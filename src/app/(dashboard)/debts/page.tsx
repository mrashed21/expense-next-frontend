"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { HandCoins } from "lucide-react";

export default function DebtsPage() {
  const { formatCurrency } = useCurrency();

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Debt Management</h1>
          <p className="text-xs text-muted-foreground">
            Track loans lent to others and money borrowed
          </p>
        </div>
      </div>

      <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <HandCoins className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No Debts Recorded</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Start tracking who owes you money or your outstanding loans here.
          </p>
        </div>
      </div>
    </div>
  );
}
