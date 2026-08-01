"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useGetTransactionsQuery } from "../../../services/transactionApi";
import { formatCurrency } from "../../../lib/utils";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: transactionsData } = useGetTransactionsQuery({ dateRange: "thisMonth" });
  const transactions = transactionsData?.data || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Monthly Calendar View</h1>
          <p className="text-xs text-muted-foreground">View day-by-day transaction timelines and cash flow activity</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-card text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-foreground px-3">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-card text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-border shadow-xl">
        {/* Days Header */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-muted-foreground border-b border-border pb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="uppercase tracking-wider">{day}</div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-secondary/20 border border-transparent" />;
            }

            const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTxList = transactions.filter((t: any) => t.date?.startsWith(dayString) || new Date(t.date).getDate() === day);

            return (
              <div
                key={`day-${day}`}
                className="h-24 sm:h-28 rounded-2xl bg-secondary/50 border border-border p-2 flex flex-col justify-between hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">{day}</span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dayTxList.map((tx: any) => (
                    <div
                      key={tx._id}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold truncate ${
                        tx.type === "income"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
