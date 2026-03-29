import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Award, Download, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";

const CERT_TYPE_LABELS: Record<string, string> = {
  CPD: "CPD Certificate",
  EXPERIENCE: "Experience Letter",
  ISO: "ISO Certificate",
  COMPLETION: "Completion Certificate",
};

const CERT_TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  CPD: { text: "text-neon-blue", bg: "bg-neon-blue/10" },
  EXPERIENCE: { text: "text-purple", bg: "bg-purple/10" },
  ISO: { text: "text-cyan", bg: "bg-cyan/10" },
  COMPLETION: { text: "text-neon-green", bg: "bg-neon-green/10" },
};

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let certificates: Array<{
    id: string;
    type: string;
    certificateNo: string;
    issuedDate: Date;
    expiryDate: Date | null;
    pdfUrl: string | null;
    isValid: boolean;
  }> = [];

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session?.user?.id },
    });

    if (student) {
      certificates = await prisma.certificate.findMany({
        where: { studentId: student.id },
        orderBy: { issuedDate: "desc" },
      });
    }
  } catch (error) {
    console.error("Certificates data error:", error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Certificates</h1>
        <p className="text-sm text-text-muted mt-1">
          Your earned certifications and credentials
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Award size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">No certificates yet.</p>
          <p className="text-xs text-text-muted mt-1">
            Complete your course phases and assessments to earn certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const typeColor = CERT_TYPE_COLORS[cert.type] || {
              text: "text-text-secondary",
              bg: "bg-white/[0.03]",
            };

            return (
              <div key={cert.id} className="glass-card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${typeColor.bg} flex items-center justify-center`}
                    >
                      <Award size={20} className={typeColor.text} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {CERT_TYPE_LABELS[cert.type] || cert.type}
                      </p>
                      <p className="text-xs text-text-muted font-mono">
                        {cert.certificateNo}
                      </p>
                    </div>
                  </div>
                  {cert.isValid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neon-green bg-neon-green/10 px-2 py-1 rounded">
                      <CheckCircle2 size={12} />
                      Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded">
                      <XCircle size={12} />
                      Expired
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-text-muted">Issued</p>
                    <p className="text-sm text-text-primary">
                      {cert.issuedDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Expiry</p>
                    <p className="text-sm text-text-primary">
                      {cert.expiryDate
                        ? cert.expiryDate.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "No Expiry"}
                    </p>
                  </div>
                </div>

                {/* Download & Share */}
                <div className="flex gap-2">
                  {cert.pdfUrl ? (
                    <a
                      href={cert.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors text-sm font-medium"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-text-muted text-sm">
                      <Clock size={14} />
                      PDF being generated
                    </div>
                  )}
                  <a
                    href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(CERT_TYPE_LABELS[cert.type] || cert.type)}&organizationName=${encodeURIComponent("EDWartens UK")}&issueYear=${cert.issuedDate.getFullYear()}&issueMonth=${cert.issuedDate.getMonth() + 1}&certUrl=${encodeURIComponent(`https://edwartens.co.uk/verify/${cert.certificateNo}`)}&certId=${encodeURIComponent(cert.certificateNo)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2] rounded-lg hover:bg-[#0A66C2]/20 transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={16} />
                    LinkedIn
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
