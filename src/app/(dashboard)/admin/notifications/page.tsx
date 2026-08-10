"use client";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { useGetNotificationHistoryQuery } from "@/services/admin-api";
import { Bell, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function AdminNotificationHistoryPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: notificationData, isLoading: notificationLoading } =
    useGetNotificationHistoryQuery({ page: 1, limit: 100 });

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

  const notifications = notificationData?.data?.notifications || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Notification History
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor all notifications sent across the platform to users.
        </p>
      </div>

      <Card className="p-6 space-y-4 max-w-4xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> System & User Alerts
          </h2>
        </div>
        <div className="space-y-3 max-h-150 overflow-y-auto scrollbar-hide pr-2">
          {notificationLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-primary" />
          ) : notifications.length > 0 ? (
            notifications.map((n: any) => (
              <div
                key={n._id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-secondary/30"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    n.is_read
                      ? "bg-secondary text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold truncate">
                      {n.title}{" "}
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-2">
                        {n.category || "system"}
                      </span>
                    </p>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Recipient:{" "}
                    <span className="font-semibold text-primary">
                      {n.user_id?.user_email || "Unknown User"}
                    </span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      n.is_read ? "text-muted-foreground" : "text-emerald-500"
                    }`}
                  >
                    {n.is_read ? "Read" : "Unread"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No notifications found on the platform.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
