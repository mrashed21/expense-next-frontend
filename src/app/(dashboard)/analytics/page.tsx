"use client";

import { EmptyState } from "@/components/custom/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { useGetAnalyticsSummaryQuery } from "@/services/analytics-api";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  CreditCard,
  Goal,
  Landmark,
  LayoutDashboard,
  Loader2,
  PieChart as PieIcon,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export default function AnalyticsPage() {
  const { formatCurrency } = useCurrency();
  const { data: analyticsData, isLoading } = useGetAnalyticsSummaryQuery({});

  const [activeTab, setActiveTab] = useState<
    "cashflow" | "wealth" | "planning"
  >("cashflow");

  const formatCurrencyCallback = useCallback(
    (value: any) => formatCurrency(value),
    [formatCurrency],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  const data = analyticsData?.data;
  if (!data) {
    return (
      <div className="mt-12">
        <EmptyState 
          title="No analytics data available"
          description="We couldn't generate analytics. Make sure you have recorded some transactions."
          icon={<BarChart3 className="w-8 h-8" />}
        />
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
    cashFlowForecast,
    assetDistribution,
    liabilityDistribution,
    netWorthTrend,
    kpi,
  } = data;

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Financial Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Comprehensive insights into your spending, wealth, and planning.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-3 sm:p-5 rounded-2xl space-y-1 sm:space-y-1.5 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 truncate">
            <LayoutDashboard className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Net Worth</span>
          </p>
          <p className="text-base sm:text-xl font-black text-foreground break-words">
            {formatCurrency(kpi.netWorth)}
          </p>
        </div>
        <div className="glass-card p-3 sm:p-5 rounded-2xl space-y-1 sm:space-y-1.5 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 truncate">
            <ArrowDownCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Income ({yearlyComparison.currentYear})</span>
          </p>
          <p className="text-base sm:text-xl font-black text-emerald-500 break-words">
            {formatCurrency(kpi.totalIncomeYear)}
          </p>
        </div>
        <div className="glass-card p-3 sm:p-5 rounded-2xl space-y-1 sm:space-y-1.5 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 truncate">
            <ArrowUpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Expense ({yearlyComparison.currentYear})</span>
          </p>
          <p className="text-base sm:text-xl font-black text-rose-500 break-words">
            {formatCurrency(kpi.totalExpenseYear)}
          </p>
        </div>
        <div className="glass-card p-3 sm:p-5 rounded-2xl space-y-1 sm:space-y-1.5 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 truncate">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Savings Rate</span>
          </p>
          <p
            className={`text-base sm:text-xl font-black break-words ${
              kpi.savingsRate >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {kpi.savingsRate}%
          </p>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="overflow-x-auto pb-0.5 scrollbar-hide">
        <div className="flex bg-secondary/50 p-1 rounded-xl w-fit min-w-max">
          <button
            onClick={() => setActiveTab("cashflow")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "cashflow"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cash Flow
          </button>
          <button
            onClick={() => setActiveTab("wealth")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "wealth"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Wealth &amp; Assets
          </button>
          <button
            onClick={() => setActiveTab("planning")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "planning"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Budgets &amp; Goals
          </button>
        </div>
      </div>

      {/* Tab: Cash Flow */}
      {activeTab === "cashflow" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Comparison */}
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
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

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
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">
                    Daily Expense Trend
                  </h2>
                </div>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySpending}>
                    <defs>
                      <linearGradient
                        id="expenseGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#EF4444"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#EF4444"
                          stopOpacity={0}
                        />
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

            {/* Spending Heatmap */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">
                    Spending Heatmap (By Day)
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
                    <Bar
                      dataKey="amount"
                      name="Avg Spent"
                      fill="#6366F1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cash Flow Forecast */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-border">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                30-Day Cash Flow Forecast
              </h2>
              <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground ml-2">
                Beta
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              This chart projects your estimated Account Balance over the next
              30 days based on your current Net Worth and upcoming Unpaid Bills.
            </p>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowForecast}>
                  <defs>
                    <linearGradient
                      id="forecastGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#333"
                    opacity={0.2}
                  />
                  <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
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
                    dataKey="projectedBalance"
                    name="Projected Balance"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#forecastGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wealth */}
      {activeTab === "wealth" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Distribution */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Landmark className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold text-foreground">
                  Asset Distribution
                </h2>
              </div>
              {assetDistribution.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                  No assets found.
                </div>
              ) : (
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {assetDistribution.map((entry: any, index: number) => (
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
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Liability Distribution */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <CreditCard className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-foreground">
                  Liability Distribution
                </h2>
              </div>
              {liabilityDistribution.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                  No liabilities found. You are debt free!
                </div>
              ) : (
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={liabilityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {liabilityDistribution.map(
                          (entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ),
                        )}
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
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Net Worth Trend */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-border">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Historical Net Worth Trend
              </h2>
            </div>
            {netWorthTrend.length < 2 ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                Not enough data to plot a trend yet.
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netWorthTrend}>
                    <defs>
                      <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#333"
                      opacity={0.2}
                    />
                    <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                    <YAxis
                      stroke="#888888"
                      fontSize={10}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
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
                      dataKey="netWorth"
                      name="Net Worth"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#nwGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Planning */}
      {activeTab === "planning" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budgets */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  Budget Burn Rate
                </h2>
              </div>
              {budgetAnalytics.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No budgets configured this month.
                </div>
              ) : (
                <div className="space-y-5 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
                  {budgetAnalytics.map((b: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold">{b.categoryName}</span>
                        <span
                          className={
                            b.isExceeded
                              ? "text-rose-500 font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {formatCurrency(b.spent)} /{" "}
                          {formatCurrency(b.budgeted)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${b.isExceeded ? "bg-rose-500" : ""}`}
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
                  Goal Progress
                </h2>
              </div>
              {goalAnalytics.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No active goals.
                </div>
              ) : (
                <div className="space-y-5 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
                  {goalAnalytics.map((g: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold">{g.title}</span>
                        <span className="font-bold text-emerald-500">
                          {g.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${g.percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">
                        {formatCurrency(g.current)} of{" "}
                        {formatCurrency(g.target)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
