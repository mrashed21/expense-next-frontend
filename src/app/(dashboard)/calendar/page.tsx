"use client";

import { useState } from "react";
import { useGetCalendarEventsQuery } from "@/services/calendar-api";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/lib/utils"; // If it exports formatCurrency separately, otherwise use hook

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { formatCurrency } = useCurrency();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get boundaries for the current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // We fetch a bit wider range to cover the whole grid (including previous/next month bleeding days)
  const startDate = new Date(currentYear, currentMonth, -7).toISOString();
  const endDate = new Date(currentYear, currentMonth + 1, 7).toISOString();

  const { data: calendarData, isLoading } = useGetCalendarEventsQuery({ startDate, endDate });
  const events = calendarData?.data || [];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigation handlers
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Generate grid cells
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  const gridCells = [];
  
  // Padding days from previous month
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    gridCells.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push({
      date: new Date(currentYear, currentMonth, i),
      isCurrentMonth: true,
    });
  }

  // Padding days for next month to fill 42 cells (6 rows)
  const remainingCells = 42 - gridCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridCells.push({
      date: new Date(currentYear, currentMonth + 1, i),
      isCurrentMonth: false,
    });
  }

  // Helper to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((e: any) => {
      const eDate = new Date(e.date);
      return (
        eDate.getDate() === date.getDate() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
          <p className="text-xs text-muted-foreground">Master chronological view of your finances.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border hover:bg-secondary">
            Today
          </button>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-background">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold w-32 text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-background">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Calendar Grid */}
        <div className="flex-1 glass-card rounded-3xl border border-border flex flex-col overflow-hidden min-h-0">
          <div className="grid grid-cols-7 border-b border-border bg-secondary/30 shrink-0">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          
          <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {gridCells.map((cell, idx) => {
              const cellEvents = getEventsForDate(cell.date);
              const isToday = new Date().toDateString() === cell.date.toDateString();
              const isSelected = selectedDate?.toDateString() === cell.date.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`border-r border-b border-border p-1 sm:p-2 flex flex-col transition-colors cursor-pointer min-h-0
                    ${!cell.isCurrentMonth ? "bg-secondary/10 opacity-50" : "hover:bg-secondary/30"}
                    ${isSelected ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}
                  `}
                >
                  <div className="flex justify-between items-start shrink-0 mb-1">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}
                    `}>
                      {cell.date.getDate()}
                    </span>
                    {cellEvents.length > 0 && (
                      <span className="text-[9px] font-black text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                    {cellEvents.slice(0, 3).map((e: any) => (
                      <div
                        key={e.id}
                        className={`text-[10px] sm:text-xs truncate px-1.5 py-1 rounded border-l-2
                          ${e.type === "income" ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400" :
                            e.type === "expense" ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400" :
                            e.type === "bill" ? "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400" :
                            "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400"
                          }
                        `}
                      >
                        <span className="font-semibold">{formatCurrency(e.amount)}</span> {e.title}
                      </div>
                    ))}
                    {cellEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center font-bold">
                        +{cellEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel for Selected Date */}
        <div className="w-full lg:w-80 glass-card rounded-3xl border border-border flex flex-col shrink-0 min-h-[300px] lg:min-h-0">
          <div className="p-4 border-b border-border bg-secondary/30 shrink-0">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric' }) : "Select a date"}
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {!selectedDate ? (
              <p className="text-xs text-muted-foreground text-center mt-10">Click on any date in the calendar to view its events.</p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center mt-10">No financial events on this day.</p>
            ) : (
              selectedEvents.map((e: any) => (
                <div key={e.id} className="p-3 rounded-xl border border-border bg-card shadow-xs flex justify-between items-center gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                      ${e.type === "income" ? "bg-emerald-500/10 text-emerald-500" :
                        e.type === "expense" ? "bg-rose-500/10 text-rose-500" :
                        e.type === "bill" ? "bg-purple-500/10 text-purple-500" :
                        "bg-amber-500/10 text-amber-500"
                      }
                    `}>
                      <span className="text-xs font-black uppercase">{e.type[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{e.source}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-black shrink-0
                    ${e.type === "income" ? "text-emerald-500" : "text-foreground"}
                  `}>
                    {e.type === "income" ? "+" : ""}{formatCurrency(e.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
