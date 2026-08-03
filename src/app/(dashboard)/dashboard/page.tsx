"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { formatDate } from "@/lib/utils";
import { useGetAccountsQuery } from "@/services/accountApi";
import { useGetTransactionsQuery } from "@/services/transactionApi";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { formatCurrency } = useCurrency();
  const { data: accountsData, isLoading: accountsLoading } =
    useGetAccountsQuery({});
  const { data: monthlyTxData } = useGetTransactionsQuery({
    dateRange: "thisMonth",
    limit: 1000,
  });

  const accounts = accountsData?.data || [];
  const monthlyTransactions = monthlyTxData?.data || [];

  const recentTransactions = useMemo(() => {
    return monthlyTransactions.slice(0, 5);
  }, [monthlyTransactions]);

  const todayTransactions = useMemo(() => {
    const todayStr = new Date().toDateString();
    return monthlyTransactions.filter((tx: any) => new Date(tx.date).toDateString() === todayStr);
  }, [monthlyTransactions]);

  // Compute real stats from API data
  const netWorth = accounts.reduce(
    (sum: number, acc: any) => sum + (acc.current_balance || 0),
    0,
  );

  const monthlyIncome = useMemo(
    () =>
      monthlyTransactions
        .filter((tx: any) => tx.type === "income" || tx.type === "refund")
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [monthlyTransactions],
  );

  const monthlyExpense = useMemo(
    () =>
      monthlyTransactions
        .filter((tx: any) => tx.type === "expense")
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [monthlyTransactions],
  );

  const todayExpense = useMemo(
    () =>
      todayTransactions
        .filter((tx: any) => tx.type === "expense")
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    [todayTransactions],
  );

  const expenseRatio =
    monthlyIncome > 0 ? Math.round((monthlyExpense / monthlyIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-xl shadow-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Track your net worth, active accounts, and daily cash flow in
            real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/transactions?action=add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary font-bold text-xs shadow-lg hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Worth
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          {accountsLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <p className="text-2xl font-black text-foreground">
                {formatCurrency(netWorth)}
              </p>
              <span className="text-[11px] font-medium text-muted-foreground">
                Across {accounts.length} account
                {accounts.length !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {/* Monthly Income */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(monthlyIncome)}
          </p>
          <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {
              monthlyTransactions.filter((tx: any) => tx.type === "income")
                .length
            }{" "}
            income transactions
          </span>
        </div>

        {/* Monthly Expense */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Expense
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(monthlyExpense)}
          </p>
          <span className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {expenseRatio}% of monthly income
          </span>
        </div>

        {/* Today Expense */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Spend
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(todayExpense)}
          </p>
          <span className="text-[11px] font-medium text-muted-foreground">
            {todayTransactions.length} transactions today
          </span>
        </div>
      </div>

      {/* Main Section: Accounts Summary & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity Table */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Recent Transactions
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest income, expenses, and transfers
              </p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx: any) => (
                <div
                  key={tx._id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        tx.type === "income"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : tx.type === "refund"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {tx.type === "income" || tx.type === "refund" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {tx.notes || tx.category_id?.name || "Transaction"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(tx.date)} •{" "}
                        {tx.account_id?.name || "Account"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold ${
                      tx.type === "income" || tx.type === "refund"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {tx.type === "income" || tx.type === "refund" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent transactions recorded yet. Click "Add Transaction" to
                start!
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Accounts Grid */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">My Accounts</h2>
            <Link
              href="/accounts"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {accounts.length > 0 ? (
              accounts.map((acc: any) => (
                <div
                  key={acc._id}
                  className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: acc.color || "#4F46E5" }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {acc.name}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground uppercase font-semibold">
                        {acc.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(acc.current_balance)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No accounts created yet.
              </div>
            )}
          </div>

          {accounts.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Total Balance</span>
                <span className="text-foreground font-bold">
                  {formatCurrency(netWorth)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Manage Budgets",
            href: "/budgets",
            color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          },
          {
            label: "View Goals",
            href: "/goals",
            color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
          },
          {
            label: "Pay Bills",
            href: "/bills",
            color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          },
          {
            label: "Analytics",
            href: "/analytics",
            color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-3 rounded-2xl border text-center text-xs font-bold transition-colors hover:opacity-80 ${item.color}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
