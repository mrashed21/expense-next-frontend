"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { useGetTransactionsQuery } from "@/services/transactionApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { formatCurrency } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute start and end dates for the current month view
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  const { data: transactionsData } = useGetTransactionsQuery({
    dateRange: "custom",
    startDate,
    endDate,
    limit: 1000,
  });
  const transactions = transactionsData?.data || [];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Group transactions by day
  const txByDay = useMemo(() => {
    const map: Record<
      number,
      { income: number; expense: number; count: number }
    > = {};
    transactions.forEach((tx: any) => {
      const d = new Date(tx.date);
      const day = d.getDate();
      if (!map[day]) map[day] = { income: 0, expense: 0, count: 0 };
      map[day].count++;
      if (tx.type === "income" || tx.type === "refund") {
        map[day].income += tx.amount || 0;
      } else if (tx.type === "expense") {
        map[day].expense += tx.amount || 0;
      }
    });
    return map;
  }, [transactions]);

  // Monthly summary stats
  const monthlyIncome = transactions
    .filter((tx: any) => tx.type === "income" || tx.type === "refund")
    .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
  const monthlyExpense = transactions
    .filter((tx: any) => tx.type === "expense")
    .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Monthly Calendar View
          </h1>
          <p className="text-xs text-muted-foreground">
            View day-by-day transaction timelines and cash flow activity
          </p>
        </div>

        <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-card text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-foreground px-3">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-card text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Income
          </p>
          <p className="text-lg font-black text-emerald-500">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Expense
          </p>
          <p className="text-lg font-black text-rose-500">
            {formatCurrency(monthlyExpense)}
          </p>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Transactions
          </p>
          <p className="text-lg font-black text-foreground">
            {transactions.length}
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-border shadow-xl">
        {/* Days Header */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-muted-foreground border-b border-border pb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-24 sm:h-28 rounded-2xl bg-secondary/20 border border-transparent"
                />
              );
            }

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            const dayData = txByDay[day];

            return (
              <div
                key={`day-${day}`}
                className={`h-24 sm:h-28 rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                  isToday
                    ? "bg-primary/5 border-primary/40 shadow-sm"
                    : "bg-secondary/50 border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold ${
                      isToday
                        ? "w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  {dayData && dayData.count > 0 && (
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      {dayData.count}tx
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  {dayData && dayData.income > 0 && (
                    <div className="text-[9px] px-1.5 py-0.5 rounded font-bold truncate bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      +{formatCurrency(dayData.income)}
                    </div>
                  )}
                  {dayData && dayData.expense > 0 && (
                    <div className="text-[9px] px-1.5 py-0.5 rounded font-bold truncate bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      -{formatCurrency(dayData.expense)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
