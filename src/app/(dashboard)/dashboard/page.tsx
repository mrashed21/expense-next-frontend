"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { formatDate } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/services/transactionApi";
import { useGetCurrentNetWorthQuery } from "@/services/netWorthApi";
import { useGetInstallmentsQuery } from "@/services/installmentApi";
import { useGetBillsQuery } from "@/services/billApi";
import { useGetGoalsQuery } from "@/services/goalApi";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
  CalendarDays,
  Target,
  FileCheck,
  CreditCard,
  CircleDollarSign,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { formatCurrency } = useCurrency();
  
  // Data Fetching
  const { data: netWorthData } = useGetCurrentNetWorthQuery({});
  const { data: monthlyTxData } = useGetTransactionsQuery({ dateRange: "thisMonth", limit: 1000 });
  const { data: installmentsData } = useGetInstallmentsQuery({ status: "active" });
  const { data: billsData } = useGetBillsQuery({});
  const { data: goalsData } = useGetGoalsQuery({});

  const netWorthInfo = netWorthData?.data || { net_worth: 0, total_assets: 0, total_liabilities: 0, breakdown: { assets: {}, liabilities: {} } };
  const monthlyTransactions = monthlyTxData?.data || [];
  const installments = installmentsData?.data || [];
  const bills = billsData?.data || [];
  const goals = goalsData?.data || [];

  // Cashflow Calculations
  const monthlyIncome = useMemo(() =>
    monthlyTransactions
      .filter((tx: any) => tx.type === "income" || tx.type === "refund")
      .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
  [monthlyTransactions]);

  const monthlyExpense = useMemo(() =>
    monthlyTransactions
      .filter((tx: any) => tx.type === "expense")
      .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
  [monthlyTransactions]);

  const savingsRate = monthlyIncome > 0 
    ? Math.max(0, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)) 
    : 0;

  // Upcoming Reminders Calculations
  const upcomingBills = useMemo(() => {
    return bills
      .filter((b: any) => b.status !== "paid")
      .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 3);
  }, [bills]);

  const upcomingEMIs = useMemo(() => {
    return installments
      .filter((i: any) => !i.is_completed)
      .slice(0, 2); // EMIs are usually fixed per month, just show top 2 active
  }, [installments]);

  const nearCompletionGoals = useMemo(() => {
    return goals
      .filter((g: any) => g.status === "in_progress")
      .sort((a: any, b: any) => {
        const pA = a.current_amount / a.target_amount;
        const pB = b.current_amount / b.target_amount;
        return pB - pA; // Descending order of completion
      })
      .slice(0, 2);
  }, [goals]);

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-xl shadow-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Track your net worth, cash flow, and upcoming obligations.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="glass-card p-5 rounded-3xl space-y-3 relative overflow-hidden border border-border hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Net Worth</span>
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">
              {formatCurrency(netWorthInfo.net_worth)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                {formatCurrency(netWorthInfo.total_assets)} Assets
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-destructive/10 text-destructive font-bold border border-destructive/20">
                {formatCurrency(netWorthInfo.total_liabilities)} Debt
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-card p-5 rounded-3xl space-y-3 relative overflow-hidden border border-border hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">This Month In</span>
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">
              {formatCurrency(monthlyIncome)}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> All Income Streams
            </p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="glass-card p-5 rounded-3xl space-y-3 relative overflow-hidden border border-border hover:-translate-y-1 hover:shadow-xl hover:border-rose-500/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 text-rose-500">
            <TrendingDown className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">This Month Out</span>
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">
              {formatCurrency(monthlyExpense)}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground mt-2 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" /> All Expenses & Bills
            </p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="glass-card p-5 rounded-3xl space-y-3 relative overflow-hidden border border-border bg-gradient-to-br from-emerald-500/5 to-transparent hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 text-emerald-500">
            <PieChart className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Savings Rate</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${savingsRate}, 100`} className="text-emerald-500" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {savingsRate}%
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                You saved <strong className="text-foreground">{formatCurrency(Math.max(0, monthlyIncome - monthlyExpense))}</strong> this month.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Links (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-border">
            <h2 className="text-base font-bold text-foreground mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/accounts" className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <Wallet className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-muted-foreground font-semibold">Cash</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(netWorthInfo.breakdown.assets.cash)}</p>
              </Link>
              <Link href="/investments" className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-blue-500/50 hover:bg-blue-500/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <TrendingUp className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-muted-foreground font-semibold">Investments</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(netWorthInfo.breakdown.assets.investments)}</p>
              </Link>
              <Link href="/assets" className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-purple-500/50 hover:bg-purple-500/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <CircleDollarSign className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-muted-foreground font-semibold">Physical Assets</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(netWorthInfo.breakdown.assets.physical_assets)}</p>
              </Link>
              <Link href="/debts" className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-rose-500/50 hover:bg-rose-500/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <CreditCard className="w-5 h-5 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-muted-foreground font-semibold">Debt (Owed)</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(netWorthInfo.breakdown.liabilities.money_borrowed)}</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Reminders Sidebar (Right 1/3) */}
        <div className="glass-card p-6 rounded-3xl border border-border space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Action Items
            </h2>
          </div>

          {/* Bills */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Upcoming Bills <Link href="/bills" className="text-primary hover:underline">All</Link>
            </h3>
            {upcomingBills.length > 0 ? (
              upcomingBills.map((bill: any) => (
                <div key={bill._id} className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{bill.title}</p>
                      <p className="text-[10px] text-rose-500 font-semibold">Due: {formatDate(bill.due_date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-500">{formatCurrency(bill.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border">No upcoming bills.</p>
            )}
          </div>

          {/* EMIs */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Active EMIs <Link href="/installments" className="text-primary hover:underline">All</Link>
            </h3>
            {upcomingEMIs.length > 0 ? (
              upcomingEMIs.map((emi: any) => (
                <div key={emi._id} className="flex items-center justify-between p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{emi.title}</p>
                      <p className="text-[10px] text-orange-500 font-semibold">{emi.months_paid}/{emi.total_months} months paid</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-orange-500">{formatCurrency(emi.monthly_amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border">No active EMIs.</p>
            )}
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Top Goals <Link href="/goals" className="text-primary hover:underline">All</Link>
            </h3>
            {nearCompletionGoals.length > 0 ? (
              nearCompletionGoals.map((goal: any) => {
                const percent = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                return (
                  <div key={goal._id} className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">{goal.title}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">{Math.round(percent)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border">No active goals.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
