"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { formatDate } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/services/transactionApi";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REPORT_DATE_RANGES: Record<string, string> = {
  today: "today",
  yesterday: "yesterday",
  last7days: "last7days",
  thisMonth: "thisMonth",
  last30days: "last30days",
  thisYear: "thisYear",
};

export default function ReportsPage() {
  const { formatCurrency } = useCurrency();
  const [dateRange, setDateRange] = useState("thisMonth");
  const { data: transactionsData, isLoading } = useGetTransactionsQuery({
    dateRange: REPORT_DATE_RANGES[dateRange],
    limit: 1000,
  });
  const transactions = transactionsData?.data || [];

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((tx: any) => tx.type === "income" || tx.type === "refund")
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [transactions],
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((tx: any) => tx.type === "expense")
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [transactions],
  );

  const netBalance = totalIncome - totalExpense;

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const headers = [
      "Date",
      "Description",
      "Category",
      "Account",
      "Type",
      "Amount",
    ];
    const rows = transactions.map((t: any) => [
      formatDate(t.date),
      `"${t.notes || t.category_id?.name || "Transaction"}"`,
      t.category_id?.name || "General",
      t.account_id?.name || "Account",
      t.type,
      t.amount,
    ]);

    const csvData = [
      headers.join(","),
      ...rows.map((e: any) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ExpenseVault_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV report downloaded successfully!");
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const data = transactions.map((t: any) => ({
      Date: formatDate(t.date),
      Description: t.notes || t.category_id?.name || "Transaction",
      Category: t.category_id?.name || "General",
      Account: t.account_id?.name || "Account",
      Type: t.type,
      Amount: t.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(
      workbook,
      `ExpenseVault_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    toast.success("Excel report downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Generating PDF report...");

      // Dynamic imports to avoid SSR issues with @react-pdf/renderer
      const [{ pdf }, { PdfReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/custom/pdf-report"),
      ]);

      const doc = PdfReportDocument({
        transactions,
        periodLabel: periodLabel[dateRange],
        totalIncome: formatCurrency(totalIncome),
        totalExpense: formatCurrency(totalExpense),
        netBalance: formatCurrency(netBalance),
        netBalanceRaw: netBalance,
        formatDate,
        formatCurrency,
      });

      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ExpenseVault_Report_${dateRange}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF Report downloaded successfully");
    } catch (error) {
      console.error("PDF Export Error", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const periodLabel: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    last7days: "Last 7 Days",
    thisMonth: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    last30days: "Last 30 Days",
    thisYear: `Year ${new Date().getFullYear()}`,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Report Generator & Exporter
          </h1>
          <p className="text-xs text-muted-foreground">
            Generate comprehensive financial audit reports in CSV, Excel, PDF, or Print format
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-600 text-white font-semibold text-xs shadow-md hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter & Stats Bar */}
      <div className="glass-card p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-foreground">Date Range:</span>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-35 px-3 py-1.5 rounded-xl bg-secondary border border-border text-xs text-foreground font-semibold outline-none h-8">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-emerald-500">
            Income: {formatCurrency(totalIncome)}
          </span>
          <span className="text-rose-500">
            Expense: {formatCurrency(totalExpense)}
          </span>
          <span className={netBalance >= 0 ? "text-primary" : "text-rose-500"}>
            Net: {formatCurrency(netBalance)}
          </span>
          <span className="text-muted-foreground">
            {transactions.length} records
          </span>
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="glass-card p-8 rounded-3xl space-y-6 print:p-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              ExpenseVault Financial Statement
            </h2>
            <p className="text-xs text-muted-foreground">
              Period: {periodLabel[dateRange]}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-primary">
              Status: Audited
            </span>
            <p className="text-[10px] text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
            <p className="text-[10px] text-emerald-500 font-bold uppercase">
              Total Income
            </p>
            <p className="text-lg font-black text-emerald-500">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-center">
            <p className="text-[10px] text-rose-500 font-bold uppercase">
              Total Expense
            </p>
            <p className="text-lg font-black text-rose-500">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div
            className={`p-3 rounded-xl text-center ${
              netBalance >= 0
                ? "bg-primary/5 border border-primary/20"
                : "bg-rose-500/5 border border-rose-500/20"
            }`}
          >
            <p
              className={`text-[10px] font-bold uppercase ${netBalance >= 0 ? "text-primary" : "text-rose-500"}`}
            >
              Net Balance
            </p>
            <p
              className={`text-lg font-black ${netBalance >= 0 ? "text-primary" : "text-rose-500"}`}
            >
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/70 border-b border-border text-muted-foreground font-bold uppercase text-[10px]">
                <th scope="col" className="p-3">Date</th>
                <th scope="col" className="p-3">Description</th>
                <th scope="col" className="p-3">Category</th>
                <th scope="col" className="p-3">Account</th>
                <th scope="col" className="p-3">Type</th>
                <th scope="col" className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {tx.notes || tx.category_id?.name || "Transaction"}
                    </td>
                    <td className="p-3">{tx.category_id?.name || "General"}</td>
                    <td className="p-3">{tx.account_id?.name || "Account"}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {tx.type === "income" || tx.type === "refund" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
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
