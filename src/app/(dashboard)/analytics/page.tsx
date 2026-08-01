"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, PieChart as PieIcon } from "lucide-react";
import { formatCurrency } from "../../../lib/utils";

const categoryData = [
  { name: "Food & Dining", value: 450, color: "#EF4444" },
  { name: "Shopping", value: 320, color: "#F59E0B" },
  { name: "Bills & Utilities", value: 280, color: "#EC4899" },
  { name: "Transport", value: 180, color: "#3B82F6" },
  { name: "Entertainment", value: 150, color: "#8B5CF6" },
  { name: "Others", value: 70, color: "#94A3B8" },
];

const monthlyComparison = [
  { month: "Jan", Income: 3200, Expense: 1400 },
  { month: "Feb", Income: 3500, Expense: 1650 },
  { month: "Mar", Income: 3100, Expense: 1300 },
  { month: "Apr", Income: 3800, Expense: 1750 },
  { month: "May", Income: 4000, Expense: 1500 },
  { month: "Jun", Income: 3900, Expense: 1850 },
  { month: "Jul", Income: 4200, Expense: 1600 },
  { month: "Aug", Income: 3800, Expense: 1450 },
];

const cashFlowTrend = [
  { date: "Day 1", balance: 5000 },
  { date: "Day 5", balance: 4850 },
  { date: "Day 10", balance: 4600 },
  { date: "Day 15", balance: 6800 },
  { date: "Day 20", balance: 6400 },
  { date: "Day 25", balance: 6100 },
  { date: "Day 30", balance: 7350 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Financial Analytics & Insights</h1>
        <p className="text-xs text-muted-foreground">Interactive multi-dimensional charts for spending patterns and cash flow trends</p>
      </div>

      {/* Grid: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Monthly Comparison */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Monthly Income vs Expense</h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Year 2026</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "12px",
                    color: "#F9FAFB",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Breakdown Pie Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Category Spend Share</h2>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-muted-foreground truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow Balance Trend Area Chart */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-foreground">30-Day Net Worth & Cash Growth Curve</h2>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowTrend}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  borderColor: "#374151",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="balance" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#balanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
