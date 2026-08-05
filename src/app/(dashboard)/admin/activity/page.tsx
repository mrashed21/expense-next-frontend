"use client";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { useGetActivityQuery } from "@/services/admin-api";
import { Activity, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function AdminActivityPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: activityData, isLoading: activityLoading } =
    useGetActivityQuery({});

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

  const activities = activityData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Platform Activity
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor recent user transactions and events across the platform.
        </p>
      </div>

      <Card className="p-6 space-y-4 max-w-4xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Recent
            Transactions
          </h2>
        </div>
        <div className="space-y-3 max-h-175 overflow-y-auto scrollbar-hide pr-2">
          {activityLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-primary" />
          ) : activities.length > 0 ? (
            activities.map((act: any) => (
              <div
                key={act._id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-secondary/30"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${act.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                >
                  {act.type === "income" ? "+" : "-"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    <span className="text-primary">
                      {act.user_id?.user_name || "Unknown User"}
                    </span>{" "}
                    recorded {act.type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(act.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${act.type === "income" ? "text-emerald-500" : "text-foreground"}`}
                  >
                    {act.type === "income" ? "+" : "-"}$
                    {act.amount?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {act.category?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No recent activity found on the platform.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
