"use client";

import { useState } from "react";
import { FileText, Download, Printer, FileSpreadsheet, FileCheck, Calendar, Filter } from "lucide-react";
import { useGetTransactionsQuery } from "../../../services/transactionApi";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly");
  const { data: transactionsData } = useGetTransactionsQuery({ dateRange: "thisMonth" });
  const transactions = transactionsData?.data || [];

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const headers = ["Date", "Description", "Category", "Account", "Type", "Amount"];
    const rows = transactions.map((t: any) => [
      formatDate(t.date),
      `"${t.notes || t.category_id?.name || "Transaction"}"`,
      t.category_id?.name || "General",
      t.account_id?.name || "Account",
      t.type,
      t.amount,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV report downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Report Generator & Exporter</h1>
          <p className="text-xs text-muted-foreground">Generate comprehensive financial audit reports in PDF, CSV, Excel, or Print formats</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Options Bar */}
      <div className="glass-card p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">Report Scope:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-xs text-foreground font-semibold outline-none"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-semibold">Total Records: {transactions.length}</span>
      </div>

      {/* Report Preview Document */}
      <div className="glass-card p-8 rounded-3xl space-y-6 print:p-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">ExpenseVault Financial Statement</h2>
            <p className="text-xs text-muted-foreground">Period: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-primary">Status: Audited</span>
            <p className="text-[10px] text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/70 border-b border-border text-muted-foreground font-bold uppercase text-[10px]">
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Account</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {transactions.map((tx: any) => (
                <tr key={tx._id}>
                  <td className="p-3 text-muted-foreground">{formatDate(tx.date)}</td>
                  <td className="p-3 font-bold text-foreground">{tx.notes || tx.category_id?.name || "Transaction"}</td>
                  <td className="p-3">{tx.category_id?.name || "General"}</td>
                  <td className="p-3">{tx.account_id?.name || "Account"}</td>
                  <td className={`p-3 text-right font-bold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
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
