"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { formatDate } from "@/lib/utils";
import {
  useGetBalanceSheetQuery,
  useGetCashFlowReportQuery,
  useGetTaxReportQuery,
} from "@/services/reportApi";
import {
  Download,
  FileSpreadsheet,
  Landmark,
  Loader2,
  PieChart as PieIcon,
  Receipt,
} from "lucide-react";
import { useState } from "react";

export default function ReportsPage() {
  const { formatCurrency } = useCurrency();
  const [activeReport, setActiveReport] = useState<"balance-sheet" | "cash-flow" | "tax">("balance-sheet");

  const { data: bsData, isLoading: bsLoading } = useGetBalanceSheetQuery(undefined, { skip: activeReport !== "balance-sheet" });
  
  // For cash flow, default to current year
  const now = new Date();
  const startDate = `${now.getFullYear()}-01-01`;
  const endDate = `${now.getFullYear()}-12-31`;
  const { data: cfData, isLoading: cfLoading } = useGetCashFlowReportQuery({ startDate, endDate }, { skip: activeReport !== "cash-flow" });
  
  const { data: taxData, isLoading: taxLoading } = useGetTaxReportQuery(now.getFullYear(), { skip: activeReport !== "tax" });

  const handleExportCSV = (filename: string, rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBalanceSheet = () => {
    if (!bsData?.data) return;
    const d = bsData.data;
    const rows = [
      ["BALANCE SHEET", formatDate(d.date)],
      [],
      ["ASSETS", ""],
      ["Cash", d.assets.currentAssets.cash],
      ["Investments", d.assets.nonCurrentAssets.investments],
      ["Physical Assets", d.assets.nonCurrentAssets.physical_assets],
      ["Money Lent", d.assets.nonCurrentAssets.money_lent],
      ["Total Assets", d.assets.totalAssets],
      [],
      ["LIABILITIES", ""],
      ["Money Borrowed", d.liabilities.longTermLiabilities.money_borrowed],
      ["EMIs Remaining", d.liabilities.currentLiabilities.emi_remaining],
      ["Total Liabilities", d.liabilities.totalLiabilities],
      [],
      ["EQUITY", ""],
      ["Total Equity (Net Worth)", d.equity.totalEquity],
    ];
    handleExportCSV("balance-sheet", rows);
  };

  const exportCashFlow = () => {
    if (!cfData?.data) return;
    const d = cfData.data;
    const rows = [
      ["CASH FLOW STATEMENT", `${formatDate(d.period.start)} to ${formatDate(d.period.end)}`],
      [],
      ["INFLOWS", ""],
      ...d.cashFlow.operatingActivities.inflows.map((i: any) => [i.category, i.amount]),
      ["Total Inflows", d.summary.totalInflows],
      [],
      ["OUTFLOWS", ""],
      ...d.cashFlow.operatingActivities.outflows.map((o: any) => [o.category, o.amount]),
      ["Total Outflows", d.summary.totalOutflows],
      [],
      ["NET CASH FLOW", d.summary.netCashFlow],
    ];
    handleExportCSV("cash-flow", rows);
  };

  const exportTaxReport = () => {
    if (!taxData?.data) return;
    const d = taxData.data;
    const rows = [
      ["TAX REPORT", `FY ${d.financialYear}`],
      [],
      ["INCOME", ""],
      ["Taxable Income", d.income.taxable],
      ["Non-Taxable Income", d.income.nonTaxable],
      ["Total Income", d.income.total],
      [],
      ["DEDUCTIONS", ""],
      ["Eligible Deductions", d.deductions.eligibleDeductions],
      [],
      ["ESTIMATED TAXABLE AMOUNT", d.estimatedTaxableAmount],
    ];
    handleExportCSV("tax-report", rows);
  };

  const renderLoader = () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 pb-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financial Reports</h1>
          <p className="text-xs text-muted-foreground">
            Generate, view, and export formal financial documents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveReport("balance-sheet")}
          className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
            activeReport === "balance-sheet" ? "bg-primary/5 border-primary shadow-sm" : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <div className={`p-3 rounded-xl ${activeReport === "balance-sheet" ? "bg-primary text-white" : "bg-secondary text-foreground"}`}>
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Balance Sheet</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Assets = Liabilities + Equity</p>
          </div>
        </button>

        <button
          onClick={() => setActiveReport("cash-flow")}
          className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
            activeReport === "cash-flow" ? "bg-primary/5 border-primary shadow-sm" : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <div className={`p-3 rounded-xl ${activeReport === "cash-flow" ? "bg-primary text-white" : "bg-secondary text-foreground"}`}>
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Cash Flow</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Income vs Expenses (FY)</p>
          </div>
        </button>

        <button
          onClick={() => setActiveReport("tax")}
          className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
            activeReport === "tax" ? "bg-primary/5 border-primary shadow-sm" : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <div className={`p-3 rounded-xl ${activeReport === "tax" ? "bg-primary text-white" : "bg-secondary text-foreground"}`}>
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Tax Report</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Taxable vs Deductible (FY)</p>
          </div>
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-border shadow-xs">
        
        {/* BALANCE SHEET VIEW */}
        {activeReport === "balance-sheet" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <div>
                <h2 className="text-lg font-black tracking-tight">Balance Sheet</h2>
                <p className="text-xs text-muted-foreground">Snapshot as of {formatDate(new Date())}</p>
              </div>
              <button onClick={exportBalanceSheet} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
            {bsLoading ? renderLoader() : bsData?.data && (
              <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
                
                {/* Assets Table */}
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest border-b-2 border-primary/20 pb-2 mb-4">Assets</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Cash (Current)</span>
                      <span className="font-medium">{formatCurrency(bsData.data.assets.currentAssets.cash)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Investments</span>
                      <span className="font-medium">{formatCurrency(bsData.data.assets.nonCurrentAssets.investments)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Physical Assets</span>
                      <span className="font-medium">{formatCurrency(bsData.data.assets.nonCurrentAssets.physical_assets)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Money Lent</span>
                      <span className="font-medium">{formatCurrency(bsData.data.assets.nonCurrentAssets.money_lent)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-border font-bold text-foreground">
                      <span>Total Assets</span>
                      <span>{formatCurrency(bsData.data.assets.totalAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities Table */}
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest border-b-2 border-primary/20 pb-2 mb-4">Liabilities</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Money Borrowed</span>
                      <span className="font-medium">{formatCurrency(bsData.data.liabilities.longTermLiabilities.money_borrowed)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">EMIs Remaining</span>
                      <span className="font-medium">{formatCurrency(bsData.data.liabilities.currentLiabilities.emi_remaining)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-border font-bold text-foreground">
                      <span>Total Liabilities</span>
                      <span>{formatCurrency(bsData.data.liabilities.totalLiabilities)}</span>
                    </div>
                  </div>
                </div>

                {/* Equity Table */}
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest border-b-2 border-primary/20 pb-2 mb-4">Equity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Net Worth (Retained Earnings)</span>
                      <span className="font-medium">{formatCurrency(bsData.data.equity.retainedEarnings)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-foreground font-black text-lg text-foreground">
                      <span>Total Liabilities & Equity</span>
                      <span>{formatCurrency(bsData.data.liabilities.totalLiabilities + bsData.data.equity.totalEquity)}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* CASH FLOW VIEW */}
        {activeReport === "cash-flow" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <div>
                <h2 className="text-lg font-black tracking-tight">Cash Flow Statement</h2>
                <p className="text-xs text-muted-foreground">FY {now.getFullYear()}</p>
              </div>
              <button onClick={exportCashFlow} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
            {cfLoading ? renderLoader() : cfData?.data && (
              <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
                
                {/* Inflows */}
                <div>
                  <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest border-b-2 border-emerald-500/20 pb-2 mb-4">Cash Inflows (Operating)</h3>
                  <div className="space-y-2 text-sm">
                    {cfData.data.cashFlow.operatingActivities.inflows.map((inf: any, i: number) => (
                      <div key={i} className="flex justify-between py-1">
                        <span className="text-muted-foreground">{inf.category}</span>
                        <span className="font-medium text-emerald-500">+{formatCurrency(inf.amount)}</span>
                      </div>
                    ))}
                    {cfData.data.cashFlow.operatingActivities.inflows.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">No inflows recorded.</p>
                    )}
                    <div className="flex justify-between py-3 border-t border-border font-bold text-foreground">
                      <span>Total Inflows</span>
                      <span className="text-emerald-500">{formatCurrency(cfData.data.summary.totalInflows)}</span>
                    </div>
                  </div>
                </div>

                {/* Outflows */}
                <div>
                  <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-500/20 pb-2 mb-4">Cash Outflows (Operating)</h3>
                  <div className="space-y-2 text-sm">
                    {cfData.data.cashFlow.operatingActivities.outflows.map((out: any, i: number) => (
                      <div key={i} className="flex justify-between py-1">
                        <span className="text-muted-foreground">{out.category}</span>
                        <span className="font-medium text-rose-500">-{formatCurrency(out.amount)}</span>
                      </div>
                    ))}
                    {cfData.data.cashFlow.operatingActivities.outflows.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">No outflows recorded.</p>
                    )}
                    <div className="flex justify-between py-3 border-t border-border font-bold text-foreground">
                      <span>Total Outflows</span>
                      <span className="text-rose-500">-{formatCurrency(cfData.data.summary.totalOutflows)}</span>
                    </div>
                  </div>
                </div>

                {/* Net */}
                <div>
                  <div className="flex justify-between py-4 border-t-2 border-foreground font-black text-lg text-foreground">
                    <span>Net Cash Flow</span>
                    <span className={cfData.data.summary.netCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      {formatCurrency(cfData.data.summary.netCashFlow)}
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAX REPORT VIEW */}
        {activeReport === "tax" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <div>
                <h2 className="text-lg font-black tracking-tight">Tax Report (Estimate)</h2>
                <p className="text-xs text-muted-foreground">FY {now.getFullYear()}</p>
              </div>
              <button onClick={exportTaxReport} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
            {taxLoading ? renderLoader() : taxData?.data && (
              <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
                
                {/* Income Table */}
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest border-b-2 border-primary/20 pb-2 mb-4">Gross Income</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Taxable Income</span>
                      <span className="font-medium">{formatCurrency(taxData.data.income.taxable)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Non-Taxable Income</span>
                      <span className="font-medium">{formatCurrency(taxData.data.income.nonTaxable)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-border font-bold text-foreground">
                      <span>Total Income</span>
                      <span>{formatCurrency(taxData.data.income.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest border-b-2 border-primary/20 pb-2 mb-4">Deductions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Eligible Deductions (Health, Edu, Tax)</span>
                      <span className="font-medium text-rose-500">-{formatCurrency(taxData.data.deductions.eligibleDeductions)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-border font-bold text-foreground">
                      <span>Total Deductions</span>
                      <span className="text-rose-500">-{formatCurrency(taxData.data.deductions.eligibleDeductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Net */}
                <div>
                  <div className="flex justify-between py-4 border-t-2 border-foreground font-black text-lg text-foreground">
                    <span>Estimated Taxable Amount</span>
                    <span>{formatCurrency(taxData.data.estimatedTaxableAmount)}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
