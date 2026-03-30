import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function StudentInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id as string },
  });
  if (!student) redirect("/student/dashboard");

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: {
        include: { user: { select: { name: true, email: true, phone: true, address: true } } },
      },
    },
  });

  if (!invoice || invoice.studentId !== student.id) notFound();

  const lineItems = (() => {
    try { return JSON.parse(invoice.lineItems as string || "[]"); }
    catch { return []; }
  })();

  const statusColor = invoice.status === "PAID"
    ? "text-neon-green bg-neon-green/10 border-neon-green/20"
    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/student/payments" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Payments
        </Link>
        <span className="text-xs text-text-muted">Use Ctrl+P to print</span>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/[0.06]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">INVOICE</h1>
              <p className="text-lg font-mono text-neon-blue mt-1">{invoice.invoiceNumber}</p>
              <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                {invoice.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-text-primary">EDWartens UK</p>
              <p className="text-xs text-text-muted">A Trading Name of Wartens Ltd</p>
              <p className="text-xs text-text-muted mt-2">Unit 8, Lyon Road</p>
              <p className="text-xs text-text-muted">Milton Keynes, MK1 1EX</p>
              <p className="text-xs text-text-muted">VAT: 473020522</p>
            </div>
          </div>
        </div>

        {/* Bill To + Dates */}
        <div className="p-8 grid grid-cols-2 gap-8 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Bill To</p>
            <p className="text-sm font-semibold text-text-primary">{invoice.student?.user?.name}</p>
            <p className="text-xs text-text-muted">{invoice.student?.user?.email}</p>
            {invoice.student?.user?.phone && <p className="text-xs text-text-muted">{invoice.student.user.phone}</p>}
            {invoice.student?.user?.address && <p className="text-xs text-text-muted mt-1">{invoice.student.user.address}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Invoice Date</span>
              <span className="text-text-secondary">{formatDate(invoice.date)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Due Date</span>
                <span className="text-text-secondary">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="p-8 border-b border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 text-text-muted font-medium text-xs">Description</th>
                <th className="text-right py-3 text-text-muted font-medium text-xs w-20">Qty</th>
                <th className="text-right py-3 text-text-muted font-medium text-xs w-28">Unit Price</th>
                <th className="text-right py-3 text-text-muted font-medium text-xs w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  <td className="py-3 text-text-primary text-xs">{item.description}</td>
                  <td className="py-3 text-text-secondary text-right text-xs">{item.quantity || 1}</td>
                  <td className="py-3 text-text-secondary text-right text-xs">£{(item.unitPrice || 0).toFixed(2)}</td>
                  <td className="py-3 text-text-primary text-right text-xs font-medium">£{(item.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-8">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text-secondary">£{(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">VAT ({invoice.vatRate || 20}%)</span>
                <span className="text-text-secondary">£{(invoice.vatAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/[0.06]">
                <span className="text-text-primary">Total</span>
                <span className="text-neon-green">£{(invoice.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Notes</p>
              <p className="text-xs text-text-secondary">{invoice.notes}</p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-[10px] text-text-muted">EDWartens UK — Wartens Ltd | CRN: 15262249 | VAT: 473020522</p>
            <p className="text-[10px] text-text-muted">Unit 8, Lyon Road, Milton Keynes, MK1 1EX | 0333 33 98 394 | info@wartens.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
