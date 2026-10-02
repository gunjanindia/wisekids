import React from "react";
import prisma from "@/lib/prisma";
import { CreditCard, Download, Search, CheckCircle2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      user: true,
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payments, Fees & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor course tuition collections, transaction histories, and invoice statuses.
          </p>
        </div>

        {/* CSV export button */}
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            "Invoice,Student,Email,Course,Amount,Status,Date\n" +
              payments
                .map(
                  (p) =>
                    `"${p.invoiceNumber}","${p.user.name}","${p.user.email}","${p.course.title}",${p.amount},"${p.status}","${p.createdAt.toISOString()}"`
                )
                .join("\n")
          )}`}
          download="wisekids-invoices.csv"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Invoices to CSV</span>
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Collections</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-bold">100% Settled</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Invoices</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{payments.length}</p>
          <p className="text-[10px] text-slate-400">All paid courses</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Order Value</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ${payments.length ? (totalRevenue / payments.length).toFixed(0) : "0"}
          </p>
          <p className="text-[10px] text-slate-400">Per enrollment</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{p.user?.name}</p>
                    <p className="text-[10px] text-slate-500">{p.user?.email}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {p.course?.title}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    ${p.amount.toFixed(2)} {p.currency}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {p.paymentMethod}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
