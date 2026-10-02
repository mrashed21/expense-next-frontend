"use client";

import { useCurrency } from "@/hooks/use-currency";
import { formatCompact, formatDate } from "@/lib/utils";
import { useGetAnalyticsSummaryQuery } from "@/services/analytics-api";
import { useGetBillsQuery } from "@/services/bill-api";
import { useGetGoalsQuery } from "@/services/goal-api";
import { useGetInstallmentsQuery } from "@/services/installment-api";
import { useGetLoanSummaryQuery, useGetLoansQuery } from "@/services/loan-api";
import { useGetCurrentNetWorthQuery } from "@/services/net-worth-api";
import { useGetTransactionsQuery } from "@/services/transaction-api";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileCheck,
  Landmark,
  PieChart,
  Plus,
  Receipt,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DateRange = "thisMonth" | "last3Months" | "thisYear";

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "This Month", value: "thisMonth" },
  { label: "Last 3 Months", value: "last3Months" },
  { label: "This Year", value: "thisYear" },
];

const CATEGORY_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

function SkeletonCard() {
  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-3 animate-pulse">
      <div className="h-3 w-24 bg-secondary rounded" />
      <div className="h-7 w-36 bg-secondary rounded" />
      <div className="h-3 w-32 bg-secondary rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const { formatCurrency } = useCurrency();
  const [dateRange, setDateRange] = useState<DateRange>("thisMonth");

  const { data: netWorthData, isLoading: isLoadingNW } =
    useGetCurrentNetWorthQuery({});
  const { data: monthlyTxData, isLoading: isLoadingTx } =
    useGetTransactionsQuery({ dateRange, limit: 1000 });
  const { data: recentTxData } = useGetTransactionsQuery({
    limit: 5,
    sortBy: "date",
    sortOrder: "desc",
  });
  const { data: installmentsData, isLoading: isLoadingInstallments } =
    useGetInstallmentsQuery({
      status: "active",
    });
  const { data: billsData, isLoading: isLoadingBills } = useGetBillsQuery({});
  const { data: goalsData, isLoading: isLoadingGoals } = useGetGoalsQuery({});
  const { data: loansData, isLoading: isLoadingLoans } = useGetLoansQuery({
    limit: 3,
    status: "ACTIVE",
  });
  const { data: loanSummaryData } = useGetLoanSummaryQuery({});
  const { data: analyticsData } = useGetAnalyticsSummaryQuery({});

  const netWorthInfo = netWorthData?.data || {
    net_worth: 0,
    total_assets: 0,
    total_liabilities: 0,
    breakdown: { assets: {}, liabilities: {} },
  };
  const allTransactions = monthlyTxData?.data || [];
  const recentTransactions = recentTxData?.data || [];
  const installments = installmentsData?.data || [];
  const bills = billsData?.data || [];
  const goals = goalsData?.data || [];
  const activeLoans = (loansData?.data || []).filter(
    (l: any) => l.outstanding_amount > 0 && l.status !== "CANCELLED",
  );
  const loanSummary = loanSummaryData?.data ||
    loansData?.meta?.summary || { totalOutstanding: 0, totalLent: 0 };
  const analytics = analyticsData?.data;

  const monthlyIncome = useMemo(
    () =>
      allTransactions
        .filter((tx: any) => ["income", "refund", "opening_balance", "loan"].includes(tx.type))
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [allTransactions],
  );

  const monthlyExpense = useMemo(
    () =>
      allTransactions
        .filter((tx: any) => tx.type === "expense")
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [allTransactions],
  );

  const savingsRate =
    monthlyIncome > 0
      ? Math.max(
          0,
          Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100),
        )
      : 0;

  const netSavings = Math.max(0, monthlyIncome - monthlyExpense);

  const upcomingBills = useMemo(() => {
    return bills
      .filter((b: any) => b.status !== "paid")
      .sort(
        (a: any, b: any) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      )
      .slice(0, 3);
  }, [bills]);

  const upcomingEMIs = useMemo(
    () => installments.filter((i: any) => !i.is_completed).slice(0, 2),
    [installments],
  );

  const nearCompletionGoals = useMemo(() => {
    return goals
      .filter((g: any) => g.status === "in_progress")
      .sort((a: any, b: any) => {
        const pA = a.current_amount / a.target_amount;
        const pB = b.current_amount / b.target_amount;
        return pB - pA;
      })
      .slice(0, 2);
  }, [goals]);

  const monthlyChartData = useMemo(() => {
    if (!analytics?.monthlyComparison) return [];
    return analytics.monthlyComparison.map((m: any) => ({
      month: m.month,
      income: m.income,
      expense: m.expense,
    }));
  }, [analytics]);

  const categoryChartData = useMemo(() => {
    if (!analytics?.categoryBreakdown) return [];
    return analytics.categoryBreakdown
      .filter((c: any) => c.expense > 0)
      .slice(0, 8)
      .map((c: any, i: number) => ({
        name: c.name,
        value: c.expense,
        color: c.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
  }, [analytics]);

  const isLoading = isLoadingNW || isLoadingTx;

  const currencyFormatter = (value: number) => formatCompact(value);

  const selectedRangeLabel =
    DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "";

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-3 p-5 rounded-2xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-lg shadow-primary/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs text-indigo-100 mt-0.5">
            Track your net worth, cash flow, and upcoming obligations.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link
            href="/transactions?action=add"
            className="flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl bg-white text-primary font-semibold text-sm sm:text-xs shadow-md hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground shrink-0 hidden sm:block">
          Period:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none][scrollbar-width:none]">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`whitespace-nowrap shrink-0 px-4 py-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium transition-all ${
                dateRange === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Net Worth */}
        {isLoadingNW ? (
          <SkeletonCard />
        ) : (
          <div className="glass-card p-4 rounded-2xl border border-border hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 transition-all duration-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-[0.04] pointer-events-none">
              <Wallet className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-1.5 text-primary mb-2">
              <Wallet className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Net Worth
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
              {formatCurrency(netWorthInfo.net_worth)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                {formatCurrency(netWorthInfo.total_assets)} assets
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold border border-rose-500/20">
                {formatCurrency(netWorthInfo.total_liabilities)} debt
              </span>
            </div>
          </div>
        )}

        {/* Income */}
        {isLoadingTx ? (
          <SkeletonCard />
        ) : (
          <div className="glass-card p-4 rounded-2xl border border-border hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-200">
            <div className="flex items-center gap-1.5 text-emerald-500 mb-2">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {selectedRangeLabel} In
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
              {formatCurrency(monthlyIncome)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
              All income streams
            </p>
          </div>
        )}

        {/* Expense */}
        {isLoadingTx ? (
          <SkeletonCard />
        ) : (
          <div className="glass-card p-4 rounded-2xl border border-border hover:-translate-y-0.5 hover:shadow-lg hover:border-rose-500/30 transition-all duration-200">
            <div className="flex items-center gap-1.5 text-rose-500 mb-2">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {selectedRangeLabel} Out
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
              {formatCurrency(monthlyExpense)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-500 shrink-0" />
              All expenses & bills
            </p>
          </div>
        )}

        {/* Savings Rate */}
        {isLoadingTx ? (
          <SkeletonCard />
        ) : (
          <div className="glass-card p-4 rounded-2xl border border-border hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-200">
            <div className="flex items-center gap-1.5 text-emerald-500 mb-2">
              <PieChart className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Savings
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-secondary"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${savingsRate}, 100`}
                    className="text-emerald-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
                  {savingsRate}%
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(netSavings)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  saved {selectedRangeLabel.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Income vs Expense Bar Chart (wider) */}
        <div className="lg:col-span-3 glass-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Monthly Cash Flow
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Income vs Expense — current year
              </p>
            </div>
          </div>
          {!analytics ? (
            <div className="h-48 flex items-center justify-center">
              <div className="h-full w-full bg-secondary/30 rounded-xl animate-pulse" />
            </div>
          ) : monthlyChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={monthlyChartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={currencyFormatter}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatCurrency(value),
                    name ? String(name).charAt(0).toUpperCase() + String(name).slice(1) : "",
                  ]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="income"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="expense"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-[11px] text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-[11px] text-muted-foreground">Expense</span>
            </div>
          </div>
        </div>

        {/* Expense by Category Donut (narrower) */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-border">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Expense by Category
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              This month's breakdown
            </p>
          </div>
          {!analytics ? (
            <div className="h-40 bg-secondary/30 rounded-xl animate-pulse" />
          ) : categoryChartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
              No expense data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <RechartsPie>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatCurrency(value),
                      name,
                    ]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryChartData.slice(0, 5).map((c: any, i: number) => {
                  const total = categoryChartData.reduce(
                    (s: number, x: any) => s + x.value,
                    0,
                  );
                  const pct =
                    total > 0 ? Math.round((c.value / total) * 100) : 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: c.color }}
                        />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {c.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions + Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-primary" />
                Recent Transactions
              </h2>
            </div>
            <Link
              href="/transactions"
              className="text-xs text-primary font-medium hover:underline shrink-0"
            >
              View all →
            </Link>
          </div>
          {isLoadingTx ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-secondary shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-secondary rounded w-1/3" />
                    <div className="h-2 bg-secondary rounded w-1/4" />
                  </div>
                  <div className="w-16 h-4 bg-secondary rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No transactions yet. Start tracking!
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((tx: any) => (
                <div
                  key={tx._id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      ["income", "refund", "opening_balance", "loan"].includes(tx.type)
                        ? "bg-emerald-500/10"
                        : "bg-rose-500/10"
                    }`}
                  >
                    {["income", "refund", "opening_balance", "loan"].includes(tx.type) ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {tx.notes || tx.category_id?.name || "Transaction"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(tx.date)}
                      {tx.category_id?.name && ` · ${tx.category_id.name}`}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold shrink-0 ${
                      ["income", "refund", "opening_balance", "loan"].includes(tx.type)
                        ? "text-emerald-500"
                        : "text-foreground"
                    }`}
                  >
                    {["income", "refund", "opening_balance", "loan"].includes(tx.type) ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Items Sidebar */}
        <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-primary" />
              Action Items
            </h2>
          </div>

          {/* Bills */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Upcoming Bills
              <Link
                href="/bills"
                className="text-primary hover:underline normal-case text-[10px] font-normal"
              >
                All →
              </Link>
            </h3>
            {isLoadingBills ? (
              <div className="h-12 bg-secondary rounded-xl animate-pulse" />
            ) : upcomingBills.length > 0 ? (
              upcomingBills.map((bill: any) => (
                <div
                  key={bill._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                      <FileCheck className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {bill.title}
                      </p>
                      <p className="text-[10px] text-rose-500 font-medium">
                        Due {formatDate(bill.due_date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-rose-500 shrink-0 ml-2">
                    {formatCurrency(bill.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-2.5 rounded-xl border border-border text-center">
                No upcoming bills
              </p>
            )}
          </div>

          {/* EMIs */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Active EMIs
              <Link
                href="/installments"
                className="text-primary hover:underline normal-case text-[10px] font-normal"
              >
                All →
              </Link>
            </h3>
            {isLoadingInstallments ? (
              <div className="h-12 bg-secondary rounded-xl animate-pulse" />
            ) : upcomingEMIs.length > 0 ? (
              upcomingEMIs.map((emi: any) => (
                <div
                  key={emi._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {emi.title}
                      </p>
                      <p className="text-[10px] text-amber-500 font-medium">
                        {emi.months_paid}/{emi.total_months} paid
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-500 shrink-0 ml-2">
                    {formatCurrency(emi.monthly_amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-2.5 rounded-xl border border-border text-center">
                No active EMIs
              </p>
            )}
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Top Goals
              <Link
                href="/goals"
                className="text-primary hover:underline normal-case text-[10px] font-normal"
              >
                All →
              </Link>
            </h3>
            {isLoadingGoals ? (
              <div className="h-12 bg-secondary rounded-xl animate-pulse" />
            ) : nearCompletionGoals.length > 0 ? (
              nearCompletionGoals.map((goal: any) => {
                const percent = Math.min(
                  100,
                  (goal.current_amount / goal.target_amount) * 100,
                );
                return (
                  <div
                    key={goal._id}
                    className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate">
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-500 shrink-0">
                        {Math.round(percent)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-2.5 rounded-xl border border-border text-center">
                No active goals
              </p>
            )}
          </div>

          {/* Money Lent (Lending) */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Money Lent
              <Link
                href="/lending"
                className="text-primary hover:underline normal-case text-[10px] font-normal"
              >
                All →
              </Link>
            </h3>
            {isLoadingLoans ? (
              <div className="h-12 bg-secondary rounded-xl animate-pulse" />
            ) : activeLoans.length > 0 ? (
              activeLoans.slice(0, 2).map((loan: any) => (
                <div
                  key={loan._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Landmark className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {loan.borrower_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {loan.expected_return_date
                          ? `Due ${formatDate(loan.expected_return_date)}`
                          : `Lent ${formatDate(loan.lent_date)}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                    {formatCurrency(loan.outstanding_amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-2.5 rounded-xl border border-border text-center">
                No active lent loans
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="glass-card p-5 rounded-2xl border border-border">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Portfolio Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Link
            href="/accounts"
            className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
          >
            <Wallet className="w-4 h-4 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] text-muted-foreground font-medium">
              Cash
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {formatCurrency(netWorthInfo.breakdown.assets?.cash || 0)}
            </p>
          </Link>
          <Link
            href="/lending"
            className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-amber-500/50 hover:bg-amber-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
          >
            <Landmark className="w-4 h-4 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] text-muted-foreground font-medium">
              Money Lent (Receivable)
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {formatCurrency(
                netWorthInfo.breakdown.assets?.money_lent ??
                  loanSummary.totalOutstanding ??
                  0,
              )}
            </p>
          </Link>
          <Link
            href="/investments"
            className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-blue-500/50 hover:bg-blue-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
          >
            <TrendingUp className="w-4 h-4 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] text-muted-foreground font-medium">
              Investments
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {formatCurrency(netWorthInfo.breakdown.assets?.investments || 0)}
            </p>
          </Link>
          <Link
            href="/assets"
            className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-purple-500/50 hover:bg-purple-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
          >
            <CircleDollarSign className="w-4 h-4 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] text-muted-foreground font-medium">
              Physical Assets
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {formatCurrency(
                netWorthInfo.breakdown.assets?.physical_assets || 0,
              )}
            </p>
          </Link>
          <Link
            href="/debts"
            className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-rose-500/50 hover:bg-rose-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
          >
            <CreditCard className="w-4 h-4 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] text-muted-foreground font-medium">
              Debt (Owed)
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {formatCurrency(
                netWorthInfo.breakdown.liabilities?.money_borrowed || 0,
              )}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
