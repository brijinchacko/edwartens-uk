import sharp from "sharp";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { generateCertificateNo, formatDate } from "./utils";

// Template dimensions: 4419 x 6250 px
// Dynamic field positions (relative to template):
// Student Name: centered horizontally, ~37% from top (y ≈ 2310)
// Date: centered horizontally, ~73% from top (y ≈ 4560)
// QR Code: bottom-right, ~83% from top, ~78% from left

const TEMPLATE_PATH = path.join(process.cwd(), "public", "images", "certificate-template.png");

interface CertificateData {
  studentName: string;
  date: string; // formatted date string
  certNo: string;
  verifyUrl: string;
}

async function createTextSvg(
  text: string,
  fontSize: number,
  color: string,
  fontWeight: string = "normal",
  maxWidth: number = 3000
): Promise<Buffer> {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${fontSize * 2}">
    <text
      x="${maxWidth / 2}"
      y="${fontSize * 1.2}"
      font-family="serif"
      font-size="${fontSize}px"
      font-weight="${fontWeight}"
      fill="${color}"
      text-anchor="middle"
      dominant-baseline="middle"
    >${escapedText}</text>
  </svg>`;

  return Buffer.from(svg);
}

export async function generateCertificateImage(
  data: CertificateData
): Promise<string> {
  // Check template exists
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Certificate template not found at ${TEMPLATE_PATH}`);
  }

  const templateMeta = await sharp(TEMPLATE_PATH).metadata();
  const W = templateMeta.width || 4419;
  const H = templateMeta.height || 6250;

  // Generate QR code as PNG buffer (pixel-scanned box measurements)
  // Box inner white area: left=3233, top=5022, right=4143, textTop=5862
  // Inner width=910, QR area above 'Verification' text=780px
  const qrSize = 420;
  const qrBuffer = await QRCode.toBuffer(data.verifyUrl, {
    width: qrSize,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Create text overlays as SVG
  const nameText = await createTextSvg(data.studentName, 100, "#1a1a2e", "bold", 3200);
  const dateText = await createTextSvg(data.date, 68, "#555555", "normal", 1600);

  // Composite all layers onto template
  const outputBuffer = await sharp(TEMPLATE_PATH)
    .composite([
      // Student Name - centered, at ~28% from top (above dotted line)
      {
        input: nameText,
        top: Math.round(H * 0.28),
        left: Math.round((W - 3200) / 2),
      },
      // Date - centered, at ~74.8% from top (below "Course Coordinator")
      {
        input: dateText,
        top: Math.round(H * 0.748),
        left: Math.round((W - 1600) / 2),
      },
      // QR Code - centered in verification box above 'Verification' text
      // Centered: left=3233+(910-420)/2=3478, top=5022+(780-420)/2=5202
      {
        input: qrBuffer,
        top: 5202,
        left: 3478,
      },
    ])
    .png()
    .toBuffer();

  // Save to uploads
  const uploadsDir = path.join(process.cwd(), "uploads", "certificates");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `${data.certNo}.png`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, outputBuffer);

  return `/api/uploads/certificates/${fileName}`;
}

export async function autoGenerateCertificate(
  studentId: string,
  type: "CPD" | "COMPLETION" = "CPD"
): Promise<{ certNo: string; pdfUrl: string } | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true } },
      batch: { select: { endDate: true, startDate: true } },
      certificates: { where: { type } },
    },
  });

  if (!student) return null;

  // Don't generate duplicate certificates
  if (student.certificates.length > 0) return null;

  // Generate certificate number
  const lastCert = await prisma.certificate.findFirst({
    where: { certificateNo: { startsWith: `EDW-UK-${new Date().getFullYear()}` } },
    orderBy: { certificateNo: "desc" },
  });
  const sequence = lastCert
    ? parseInt(lastCert.certificateNo.split("-").pop() || "0") + 1
    : 1;
  const certNo = generateCertificateNo(sequence);

  // Determine date (batch end date or today)
  const certDate = student.batch?.endDate || student.batch?.startDate || new Date();

  // Generate certificate image
  let pdfUrl: string | null = null;
  try {
    pdfUrl = await generateCertificateImage({
      studentName: student.user.name,
      date: formatDate(certDate),
      certNo,
      verifyUrl: `https://edwartens.co.uk/verify/${certNo}`,
    });
  } catch (err) {
    console.error("Certificate image generation error:", err);
  }

  // Create certificate record
  const cert = await prisma.certificate.create({
    data: {
      studentId,
      type,
      certificateNo: certNo,
      issuedDate: new Date(),
      pdfUrl,
      qrCode: `https://edwartens.co.uk/verify/${certNo}`,
      isValid: true,
    },
  });

  // Log journey event
  try {
    await prisma.studentJourney.create({
      data: {
        studentId,
        eventType: "CERTIFICATE_ISSUED",
        title: `${type} Certificate Issued`,
        description: `Certificate ${certNo} generated automatically`,
      },
    });
  } catch (e) {
    console.error("Journey log error:", e);
  }

  return { certNo: cert.certificateNo, pdfUrl: pdfUrl || "" };
}
