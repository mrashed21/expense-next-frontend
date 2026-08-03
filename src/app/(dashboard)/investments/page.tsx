"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { TrendingUp } from "lucide-react";

export default function InvestmentsPage() {
  const { formatCurrency } = useCurrency();

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Investments</h1>
          <p className="text-xs text-muted-foreground">
            Track stocks, crypto, and other investment portfolios
          </p>
        </div>
      </div>

      <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No Investments Found</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Start tracking your investment portfolio here.
          </p>
        </div>
      </div>
    </div>
  );
}
