"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { useGetAnalyticsSummaryQuery } from "@/services/analyticsApi";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Calendar,
  Goal,
  LayoutDashboard,
  Loader2,
  PieChart as PieIcon,
  Target,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback } from "react";

const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });

export default function AnalyticsPage() {
  const { formatCurrency } = useCurrency();
  const { data: analyticsData, isLoading } = useGetAnalyticsSummaryQuery({});

  const formatCurrencyCallback = useCallback(
    (value: any) => formatCurrency(value),
    [formatCurrency]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const data = analyticsData?.data;
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No analytics data available.
      </div>
    );
  }

  const {
    monthlyComparison,
    yearlyComparison,
    spendingHeatmap,
    dailySpending,
    categoryBreakdown,
    budgetAnalytics,
    goalAnalytics,
    kpi,
  } = data;

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Financial Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Comprehensive insights into your spending, budgets, and goals
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Net Worth
          </p>
          <p className="text-xl font-black text-foreground">
            {formatCurrency(kpi.netWorth)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500" />
            Income ({yearlyComparison.currentYear})
          </p>
          <p className="text-xl font-black text-emerald-500">
            {formatCurrency(kpi.totalIncomeYear)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpCircle className="w-3.5 h-3.5 text-rose-500" />
            Expense ({yearlyComparison.currentYear})
          </p>
          <p className="text-xl font-black text-rose-500">
            {formatCurrency(kpi.totalExpenseYear)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Savings Rate
          </p>
          <p
            className={`text-xl font-black ${
              kpi.savingsRate >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {kpi.savingsRate}%
          </p>
        </div>
      </div>

      {/* Yearly Comparison & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Monthly Cash Flow
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Year {yearlyComparison.currentYear}
            </span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={formatCurrencyCallback}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                  formatter={formatCurrencyCallback}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-4 flex flex-col">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Yearly Comparison
            </h2>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-muted-foreground">Income</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase">{yearlyComparison.currentYear}</p>
                  <p className="text-sm font-bold text-emerald-500">{formatCurrency(yearlyComparison.currentYearIncome)}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase">{yearlyComparison.lastYear}</p>
                  <p className="text-sm font-bold text-muted-foreground">{formatCurrency(yearlyComparison.lastYearIncome)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-muted-foreground">Expense</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase">{yearlyComparison.currentYear}</p>
                  <p className="text-sm font-bold text-rose-500">{formatCurrency(yearlyComparison.currentYearExpense)}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase">{yearlyComparison.lastYear}</p>
                  <p className="text-sm font-bold text-muted-foreground">{formatCurrency(yearlyComparison.lastYearExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trends & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Daily Trend (This Month)
              </h2>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySpending}>
                <defs>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickFormatter={formatCurrencyCallback}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                  formatter={formatCurrencyCallback}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Spending Heatmap (By Day of Week)
              </h2>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingHeatmap}>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={formatCurrencyCallback}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                  formatter={formatCurrencyCallback}
                />
                <Bar dataKey="amount" name="Avg Spent" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdowns, Budgets & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Pie */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Category Spend
              </h2>
            </div>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No expenses this month.
            </div>
          ) : (
            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="expense"
                  >
                    {categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      color: "var(--foreground)",
                      fontSize: "12px",
                    }}
                    formatter={formatCurrencyCallback}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Budgets */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Budget Analytics
            </h2>
          </div>
          {budgetAnalytics.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No budgets configured this month.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
              {budgetAnalytics.map((b: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{b.categoryName}</span>
                    <span className={b.isExceeded ? "text-rose-500 font-bold" : "text-muted-foreground"}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.budgeted)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${b.isExceeded ? 'bg-rose-500' : ''}`}
                      style={{
                        width: `${b.percentage}%`,
                        backgroundColor: b.isExceeded ? undefined : b.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Goal className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Goal Analytics
            </h2>
          </div>
          {goalAnalytics.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No active goals.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
              {goalAnalytics.map((g: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{g.title}</span>
                    <span className="text-muted-foreground">
                      {g.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${g.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">
                    {formatCurrency(g.current)} of {formatCurrency(g.target)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
