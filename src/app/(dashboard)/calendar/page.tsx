"use client";

import { useCurrency } from "@/hooks/use-currency";
import { useGetCalendarEventsQuery } from "@/services/calendar-api";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_MOBILE = ["S", "M", "T", "W", "T", "F", "S"];

// Normalize a Date or ISO string to a local YYYY-MM-DD key
function getDateString(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (typeof date === "string") {
    // Extract the YYYY-MM-DD part from the backend ISO string
    return date.split("T")[0];
  }
  try {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch (e) {
    return "";
  }
}

function getEventIcon(type: string, size = "w-3.5 h-3.5") {
  switch (type) {
    case "income":
      return <TrendingUp className={`${size} text-emerald-500`} />;
    case "expense":
      return <TrendingDown className={`${size} text-rose-500`} />;
    case "bill":
      return <AlertTriangle className={`${size} text-purple-500`} />;
    case "emi":
      return <CreditCard className={`${size} text-amber-500`} />;
    default:
      return <Clock className={`${size} text-sky-500`} />;
  }
}

function getEventColors(type: string) {
  switch (type) {
    case "income":
      return "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400";
    case "expense":
      return "bg-rose-500/10 border-rose-500/50 text-rose-700 dark:text-rose-400";
    case "bill":
      return "bg-purple-500/10 border-purple-500/50 text-purple-700 dark:text-purple-400";
    case "emi":
      return "bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400";
    default:
      return "bg-sky-500/10 border-sky-500/50 text-sky-700 dark:text-sky-400";
  }
}

function getEventDotColor(type: string) {
  switch (type) {
    case "income":
      return "bg-emerald-500";
    case "expense":
      return "bg-rose-500";
    case "bill":
      return "bg-purple-500";
    case "emi":
      return "bg-amber-500";
    default:
      return "bg-sky-500";
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { formatCurrency } = useCurrency();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Fetch wider range to cover leading/trailing cells
  const startDate = new Date(currentYear, currentMonth, -7).toISOString();
  const endDate = new Date(currentYear, currentMonth + 1, 7).toISOString();

  const { data: calendarData, isLoading } = useGetCalendarEventsQuery({
    startDate,
    endDate,
  });
  const events = calendarData?.data || [];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigation handlers
  const prevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Generate grid cells
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const gridCells = useMemo(() => {
    const cells: { date: Date; isCurrentMonth: boolean }[] = [];
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }
    return cells;
  }, [currentYear, currentMonth, daysInMonth, startingDayOfWeek]);

  // Build event map keyed by date string for O(1) lookup
  const eventMap = useMemo(() => {
    const map = new Map<string, any[]>();
    events.forEach((e: any) => {
      const key = getDateString(e.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  const getEventsForDate = (date: Date): any[] => {
    const key = getDateString(date);
    return eventMap.get(key) || [];
  };

  const selectedEvents = useMemo(
    () => (selectedDate ? getEventsForDate(selectedDate) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, eventMap],
  );

  const todayKey = getDateString(new Date());

  // Summary counts for legend
  const eventTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e: any) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, [events]);

  const legendItems = [
    { type: "income", label: "Income" },
    { type: "expense", label: "Expense" },
    { type: "bill", label: "Bill" },
    { type: "emi", label: "EMI" },
  ].filter((l) => eventTypeCounts[l.type] > 0);

  return (
    <div className="space-y-4 pb-6 max-w-7xl mx-auto flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Calendar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological view of your financial events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-background transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold w-32 text-center select-none">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-background transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {legendItems.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {legendItems.map((l) => (
            <div key={l.type} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${getEventDotColor(l.type)}`}
              />
              <span className="text-[11px] font-medium text-muted-foreground capitalize">
                {l.label}
                <span className="ml-1 text-foreground font-bold">
                  ({eventTypeCounts[l.type]})
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Calendar + Side Panel */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar Grid */}
        <div className="flex-1 glass-card rounded-2xl border border-border flex flex-col overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-border bg-secondary/20 shrink-0">
            {DAYS_OF_WEEK.map((day, i) => (
              <div
                key={day}
                className="py-2.5 text-center text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{DAYS_MOBILE[i]}</span>
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="flex-1 grid grid-cols-7 grid-rows-6 relative min-h-[380px] sm:min-h-[460px]">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-2xl">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {gridCells.map((cell, idx) => {
              const cellEvents = getEventsForDate(cell.date);
              const cellKey = getDateString(cell.date);
              const isToday = cellKey === todayKey;
              const isSelected =
                selectedDate &&
                getDateString(selectedDate) === cellKey;
              const maxVisible = 2;
              const extra = cellEvents.length - maxVisible;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`border-r border-b border-border p-1 sm:p-1.5 flex flex-col transition-colors cursor-pointer group min-h-0
                    ${!cell.isCurrentMonth ? "opacity-35" : "hover:bg-secondary/20"}
                    ${isSelected ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}
                  `}
                >
                  {/* Date number */}
                  <div className="flex items-start justify-center relative mb-1 shrink-0">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors
                        ${isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"}
                        ${isSelected && !isToday ? "bg-primary/10 text-primary" : ""}
                      `}
                    >
                      {cell.date.getDate()}
                    </span>
                    {cellEvents.length > 0 && (
                      <span className="absolute top-0 right-0 text-[9px] font-bold text-muted-foreground bg-secondary/80 px-1 py-0.5 rounded hidden sm:inline-block">
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event dots on mobile, event pills on desktop */}
                  <div className="flex-1 overflow-hidden">
                    {/* Desktop: pills */}
                    <div className="hidden sm:flex flex-col gap-0.5">
                      {cellEvents.slice(0, maxVisible).map((e: any) => (
                        <div
                          key={e.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded border-l-2 leading-tight
                            ${getEventColors(e.type)}
                          `}
                          title={`${e.title} — ${formatCurrency(e.amount)}`}
                        >
                          {e.title}
                        </div>
                      ))}
                      {extra > 0 && (
                        <div className="text-[10px] text-muted-foreground font-semibold pl-1">
                          +{extra} more
                        </div>
                      )}
                    </div>

                    {/* Mobile: colored dots */}
                    <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
                      {cellEvents.slice(0, 3).map((e: any, i: number) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${getEventDotColor(e.type)}`}
                        />
                      ))}
                      {cellEvents.length > 3 && (
                        <span className="text-[8px] text-muted-foreground font-bold">
                          +{cellEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel — Selected Date Events */}
        <div className="w-full lg:w-72 glass-card rounded-2xl border border-border flex flex-col shrink-0">
          <div className="p-3.5 border-b border-border bg-secondary/20 shrink-0">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span>
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </span>
            </h3>
            {selectedDate && selectedEvents.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5 pl-6">
                {selectedEvents.length} event
                {selectedEvents.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-2 min-h-48 lg:min-h-0">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Click any date to see events
                </p>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  No events on this day
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Add a transaction or bill
                </p>
              </div>
            ) : (
              selectedEvents.map((e: any) => (
                <div
                  key={e.id}
                  className="p-3 rounded-xl border border-border bg-card flex gap-3 items-start hover:border-primary/20 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                      ${
                        e.type === "income"
                          ? "bg-emerald-500/10"
                          : e.type === "expense"
                            ? "bg-rose-500/10"
                            : e.type === "bill"
                              ? "bg-purple-500/10"
                              : "bg-amber-500/10"
                      }
                    `}
                  >
                    {getEventIcon(e.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {e.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      {e.source}
                      {e.status && ` · ${e.status}`}
                    </p>
                    <p
                      className={`text-sm font-bold mt-1 ${
                        e.type === "income"
                          ? "text-emerald-500"
                          : e.type === "expense"
                            ? "text-rose-500"
                            : e.type === "bill"
                              ? "text-purple-500"
                              : "text-amber-500"
                      }`}
                    >
                      {e.type === "income" ? "+" : ""}
                      {formatCurrency(e.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
