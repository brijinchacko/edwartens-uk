import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invoices | EDWartens Admin",
  description: "Manage student invoices",
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-400 border-green-500/20",
  ISSUED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  DRAFT: "bg-white/[0.05] text-text-muted border-white/[0.08]",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
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

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;
  const outstandingCount = invoices.filter((inv) => inv.status === "ISSUED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="text-text-muted mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} · £{totalRevenue.toFixed(0)} total · {paidCount} paid · {outstandingCount} outstanding
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{invoices.length}</p>
          <p className="text-xs text-text-muted">Total Invoices</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-neon-green">£{totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-text-muted">Revenue</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{outstandingCount}</p>
          <p className="text-xs text-text-muted">Outstanding</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Invoice No</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-text-muted font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="text-neon-blue hover:underline font-mono text-xs"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${invoice.studentId}`} className="hover:text-neon-blue transition-colors">
                        <p className="text-text-primary font-medium text-xs">{invoice.student?.user?.name || "—"}</p>
                        <p className="text-text-muted text-[10px]">{invoice.student?.user?.email || "—"}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell text-xs">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-text-primary font-semibold text-xs">£{(invoice.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[invoice.status] || STATUS_COLORS.DRAFT}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="text-xs text-neon-blue hover:underline"
                      >
                        View
                      </Link>
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
