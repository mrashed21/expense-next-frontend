"use client";

import { SystemHealthChart } from "@/components/admin/SystemHealthChart";
import { RootState } from "@/redux/store";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function AdminSystemHealthPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          System Health
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Real-time metrics and historical performance data for the ExpenseVault
          backend.
        </p>
      </div>

      <SystemHealthChart />
    </div>
  );
}
