import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invoices | EDWartens Admin",
  description: "Manage student invoices",
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-400 border-green-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-white/[0.05] text-text-muted border-white/[0.08]",
  DRAFT: "bg-white/[0.05] text-text-muted border-white/[0.08]",
};

async function getInvoices() {
  try {
    return await prisma.invoice.findMany({
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="text-text-muted mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Invoice No
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Student
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Amount
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
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    <FileText
                      size={32}
                      className="mx-auto mb-2 opacity-40"
                    />
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice: any) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-mono text-xs">
                      {invoice.invoiceNo}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-text-primary font-medium">
                          {invoice.student.user.name}
                        </p>
                        <p className="text-text-muted text-xs">
                          {invoice.student.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {invoice.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {formatCurrency(invoice.total / 100)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[invoice.status] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-neon-blue hover:underline"
                        >
                          <Download size={12} />
                          Download
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
