"use client";

import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency as formatCurrencyRaw } from "@/lib/utils";
import {
  useGetCurrentNetWorthQuery,
  useGetNetWorthHistoryQuery,
} from "@/services/net-worth-api";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  HandCoins,
  Home,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function NetWorthPage() {
  const { formatCurrency } = useCurrency();

  const { data: currentData, isLoading: currentLoading } =
    useGetCurrentNetWorthQuery({});
  const { data: historyData, isLoading: historyLoading } =
    useGetNetWorthHistoryQuery({ days: 30 });

  const current = currentData?.data || {
    net_worth: 0,
    total_assets: 0,
    total_liabilities: 0,
    breakdown: { assets: {}, liabilities: {} },
  };

  const history = historyData?.data || [];

  const chartData = history.map((h: any) => {
    const date = new Date(h.date);
    return {
      date: `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`,
      netWorth: h.net_worth,
    };
  });

  let growth = 0;
  let growthPercent = 0;
  if (history.length > 0) {
    const oldest = history[0].net_worth;
    growth = current.net_worth - oldest;
    if (oldest !== 0) {
      growthPercent = (growth / Math.abs(oldest)) * 100;
    }
  }

  const isGrowthPositive = growth >= 0;

  if (currentLoading) {
    return (
      <div className="space-y-6 pb-6 animate-pulse">
        <div>
          <div className="h-6 w-48 bg-secondary rounded-lg mb-2"></div>
          <div className="h-4 w-64 md:w-96 bg-secondary rounded-lg"></div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl h-48 border border-border bg-secondary/50"></div>

        <div className="glass-card p-6 rounded-3xl h-80 border border-border bg-secondary/50"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6 rounded-3xl h-64 border border-border bg-secondary/50"></div>
          <div className="glass-card p-6 rounded-3xl h-64 border border-border bg-secondary/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Net Worth Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          A holistic view of your financial health across all assets and
          liabilities.
        </p>
      </div>

      {/* Hero Section */}
      <div className="glass-card p-8 rounded-3xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-primary to-blue-500" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 z-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Total Net Worth
            </p>
            <h2 className="text-3xl font-black text-foreground tracking-tighter break-words">
              {formatCurrency(current.net_worth)}
            </h2>

            <div className="flex items-center gap-3 pt-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isGrowthPositive ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}
              >
                {isGrowthPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {isGrowthPositive ? "+" : ""}
                {growthPercent.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Last 30 days ({isGrowthPositive ? "+" : ""}
                {formatCurrency(growth)})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-10">
            <div className="p-4 rounded-2xl bg-secondary/80 border border-border backdrop-blur-sm flex-1 md:w-48">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Total Assets
                </span>
              </div>
              <p className="text-xl font-bold text-foreground break-words">
                {formatCurrency(current.total_assets)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/80 border border-border backdrop-blur-sm flex-1 md:w-48">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Total Liabilities
                </span>
              </div>
              <p className="text-xl font-bold text-foreground break-words">
                {formatCurrency(current.total_liabilities)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-border">
        <h3 className="text-base font-bold text-foreground">
          30-Day Growth Trend
        </h3>

        {historyLoading ? (
          <div className="h-72 w-full animate-pulse bg-secondary/50 rounded-xl"></div>
        ) : chartData.length < 2 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Not enough historical data to generate a trend chart. The system
              will automatically take snapshots daily!
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorNetWorth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                />
                <RechartsTooltip
                  cursor={{
                    stroke: "#555",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #333",
                    backgroundColor: "#111",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [
                    formatCurrencyRaw(value, "USD"),
                    "Net Worth",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNetWorth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assets Breakdown */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-border space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-foreground">
              Assets Breakdown
            </h3>
            <span className="text-sm font-black text-emerald-500 shrink-0">
              {formatCurrency(current.total_assets)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs sm:text-sm font-medium truncate">Cash Accounts</span>
              </div>
              <span className="text-xs sm:text-sm font-bold shrink-0">
                {formatCurrency(current.breakdown?.assets?.cash || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs sm:text-sm font-medium truncate">
                  Investments (Stocks, Crypto)
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold shrink-0">
                {formatCurrency(current.breakdown?.assets?.investments || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-xs sm:text-sm font-medium truncate">Physical Assets</span>
              </div>
              <span className="text-xs sm:text-sm font-bold shrink-0">
                {formatCurrency(
                  current.breakdown?.assets?.physical_assets || 0,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <HandCoins className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs sm:text-sm font-medium truncate">
                  Money Lent to Others
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold shrink-0">
                {formatCurrency(current.breakdown?.assets?.money_lent || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Liabilities Breakdown */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-border space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-foreground">
              Liabilities Breakdown
            </h3>
            <span className="text-sm font-black text-destructive shrink-0">
              {formatCurrency(current.total_liabilities)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <HandCoins className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-xs sm:text-sm font-medium truncate">Money Borrowed</span>
              </div>
              <span className="text-xs sm:text-sm font-bold shrink-0">
                {formatCurrency(
                  current.breakdown?.liabilities?.money_borrowed || 0,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-xs sm:text-sm font-medium truncate">
                  Outstanding EMIs (Loans)
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold shrink-0">
                {formatCurrency(
                  current.breakdown?.liabilities?.emi_remaining || 0,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
