import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Award, Plus, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Certificates | EDWartens Admin",
  description: "Manage student certificates",
};

const TYPE_COLORS: Record<string, string> = {
  CPD: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  EXPERIENCE: "bg-purple/10 text-purple border-purple/20",
  ISO: "bg-cyan/10 text-cyan border-cyan/20",
  COMPLETION: "bg-neon-green/10 text-neon-green border-neon-green/20",
};

async function getCertificates() {
  try {
    return await prisma.certificate.findMany({
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { issuedDate: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function CertificatesPage() {
  const certificates = await getCertificates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Certificates
          </h1>
          <p className="text-text-muted mt-1">
            {certificates.length} certificate
            {certificates.length !== 1 ? "s" : ""} issued
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium w-fit">
          <Plus size={16} />
          Generate Certificate
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Student
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Certificate No.
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Issued
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Expiry
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No certificates found
                  </td>
                </tr>
              ) : (
                certificates.map((cert: any) => (
                  <tr
                    key={cert.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {cert.student.user.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[cert.type] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {cert.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                      {cert.certificateNo}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {formatDate(cert.issuedDate)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {cert.expiryDate ? formatDate(cert.expiryDate) : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {cert.isValid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <Award size={12} />
                          Valid
                        </span>
                      ) : (
                        <span className="text-xs text-red-400">Revoked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {cert.pdfUrl ? (
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-neon-blue hover:underline"
                        >
                          <ExternalLink size={12} />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
