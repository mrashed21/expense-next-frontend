"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { useGetAccountsQuery } from "@/services/accountApi";
import { useGetTransactionsQuery } from "@/services/transactionApi";
import { BarChart3, Loader2, PieChart as PieIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#94A3B8",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AnalyticsPage() {
  const [year] = useState(new Date().getFullYear());
  const { formatCurrency } = useCurrency();

  // Fetch all transactions for this year
  const { data: txData, isLoading } = useGetTransactionsQuery({
    dateRange: "thisYear",
    limit: 1000,
  });

  // Fetch accounts for net worth tracking
  const { data: accountsData } = useGetAccountsQuery({});

  const transactions = txData?.data || [];
  const accounts = accountsData?.data || [];

  // Compute monthly income vs expense
  const monthlyComparison = useMemo(() => {
    const monthlyMap: Record<number, { Income: number; Expense: number }> = {};
    for (let i = 0; i < 12; i++) {
      monthlyMap[i] = { Income: 0, Expense: 0 };
    }

    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      if (date.getFullYear() !== year) return;
      const m = date.getMonth();
      if (tx.type === "income" || tx.type === "refund") {
        monthlyMap[m].Income += tx.amount || 0;
      } else if (tx.type === "expense") {
        monthlyMap[m].Expense += tx.amount || 0;
      }
    });

    return MONTH_NAMES.map((month, i) => ({
      month,
      Income: Math.round(monthlyMap[i].Income * 100) / 100,
      Expense: Math.round(monthlyMap[i].Expense * 100) / 100,
    }));
  }, [transactions, year]);

  // Compute category spending breakdown
  const categoryBreakdown = useMemo(() => {
    const catMap: Record<
      string,
      { name: string; value: number; color: string }
    > = {};

    transactions
      .filter((tx: any) => tx.type === "expense")
      .forEach((tx: any) => {
        const catName = tx.category_id?.name || "Uncategorized";
        const catColor = tx.category_id?.color || "#94A3B8";
        if (!catMap[catName]) {
          catMap[catName] = { name: catName, value: 0, color: catColor };
        }
        catMap[catName].value += tx.amount || 0;
      });

    return Object.values(catMap)
      .map((c, i) => ({
        ...c,
        color: c.color || CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions]);

  // Total income & expense this year
  const totalIncome = transactions
    .filter((tx: any) => tx.type === "income" || tx.type === "refund")
    .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
  const totalExpense = transactions
    .filter((tx: any) => tx.type === "expense")
    .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Net worth from accounts
  const netWorth = accounts.reduce(
    (sum: number, acc: any) => sum + (acc.current_balance || 0),
    0,
  );

  // Account balance distribution
  const accountDistribution = accounts
    .map((acc: any, i: number) => ({
      name: acc.name,
      value: Math.max(0, acc.current_balance || 0),
      color: acc.color || CHART_COLORS[i % CHART_COLORS.length],
    }))
    .filter((a: any) => a.value > 0);

  // Recent 30-day cash flow trend (last 30 days of transactions, cumulative)
  const cashFlowTrend = useMemo(() => {
    const today = new Date();
    const days: { date: string; balance: number }[] = [];
    const startBalance = netWorth;

    // Build per-day deltas for last 30 days
    const dayDeltas: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dayDeltas[key] = 0;
    }

    transactions
      .filter((tx: any) => {
        const d = new Date(tx.date);
        const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      })
      .forEach((tx: any) => {
        const d = new Date(tx.date);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        if (tx.type === "income" || tx.type === "refund") {
          dayDeltas[key] = (dayDeltas[key] || 0) + tx.amount;
        } else if (tx.type === "expense") {
          dayDeltas[key] = (dayDeltas[key] || 0) - tx.amount;
        }
      });

    let running = startBalance;
    const keys = Object.keys(dayDeltas);
    // Reverse to build from oldest to newest
    keys.forEach((key) => {
      running += dayDeltas[key];
      days.push({ date: key, balance: Math.round(running * 100) / 100 });
    });

    return days;
  }, [transactions, netWorth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Financial Analytics & Insights
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time multi-dimensional charts for spending patterns and cash flow
          trends
        </p>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Net Worth
          </p>
          <p className="text-xl font-black text-foreground">
            {formatCurrency(netWorth)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Income ({year})
          </p>
          <p className="text-xl font-black text-emerald-500">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Expense ({year})
          </p>
          <p className="text-xl font-black text-rose-500">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Savings Rate
          </p>
          <p
            className={`text-xl font-black ${savingsRate >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Grid: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Monthly Comparison */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Monthly Income vs Expense
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Year {year}
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-muted-foreground">
              No transaction data available for charts.
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "12px",
                      color: "#F9FAFB",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Spending Breakdown Pie Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Category Spend Share
              </h2>
            </div>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
              No expense data available.
            </div>
          ) : (
            <>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "#374151",
                        borderRadius: "12px",
                        color: "#F9FAFB",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => formatCurrency(val)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {categoryBreakdown.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-1.5 truncate"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-muted-foreground truncate">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account Balance Distribution */}
      {accountDistribution.length > 0 && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">
              Account Balance Distribution
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              Net Worth: {formatCurrency(netWorth)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accountDistribution.map((acc: any) => {
              const pct =
                netWorth > 0 ? Math.round((acc.value / netWorth) * 100) : 0;
              return (
                <div
                  key={acc.name}
                  className="p-3 rounded-2xl bg-secondary/50 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: acc.color }}
                      />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {acc.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: acc.color }}
                    />
                  </div>
                  <p className="text-xs font-bold text-foreground text-right">
                    {formatCurrency(acc.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cash Flow Balance Trend Area Chart */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-foreground">
            30-Day Net Worth & Cash Growth Curve
          </h2>
        </div>

        {cashFlowTrend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
            No cash flow data available.
          </div>
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowTrend}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "12px",
                    color: "#F9FAFB",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => formatCurrency(val)}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
