"use client";

import { Bell, CheckCheck, AlertTriangle, FileCheck, Target, Info, Loader2 } from "lucide-react";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "../../../services/notificationApi";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data: notificationsData, isLoading } = useGetNotificationsQuery({});
  const [markAsReadApi] = useMarkAsReadMutation();
  const [markAllApi] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const handleMarkAll = async () => {
    try {
      await markAllApi({}).unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleMarkSingle = async (id: string, isRead: boolean) => {
    if (isRead) return; // Already read
    try {
      await markAsReadApi(id).unwrap();
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    if (type === "budget_alert") return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    if (type === "bill_reminder") return <FileCheck className="w-5 h-5 text-blue-500" />;
    if (type === "goal_milestone") return <Target className="w-5 h-5 text-emerald-500" />;
    return <Info className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notifications Center</h1>
          <p className="text-xs text-muted-foreground">
            In-app alerts for budget thresholds, bill due dates, and milestone progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-primary" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Bell className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">No Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up! Notifications will appear here when budget alerts or bill reminders are triggered.
              </p>
            </div>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n._id}
              onClick={() => handleMarkSingle(n._id, n.is_read)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                n.is_read
                  ? "bg-secondary/20 border-border opacity-60 cursor-default"
                  : "bg-secondary/60 border-primary/30 shadow-sm cursor-pointer hover:border-primary/50"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-card border border-border shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-foreground">{n.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                {n.type && (
                  <span className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    n.type === "budget_alert"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : n.type === "bill_reminder"
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      : n.type === "goal_milestone"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {n.type.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
