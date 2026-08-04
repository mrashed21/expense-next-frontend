"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { formatDate } from "@/lib/utils";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} from "@/services/notificationApi";
import {
  Bell,
  Check,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/custom/EmptyState";
import { TableSkeleton } from "@/components/custom/TableSkeleton";

export default function NotificationsPage() {
  const { data: notificationsData, isLoading } = useGetNotificationsQuery({});
  const [markAsReadApi] = useMarkAsReadMutation();
  const [markAllAsReadApi, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteApi] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadApi(id).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi({}).unwrap();
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApi(id).unwrap();
      toast.success("Notification deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete notification");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "budget_alert":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case "bill_reminder":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "system":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Stay updated with your budgets, upcoming bills, and system alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/80 border border-border text-foreground font-semibold text-xs hover:bg-secondary transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="glass-card rounded-3xl border border-border overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={1} rows={5} />
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((notification: any) => (
              <div
                key={notification._id}
                className={`p-4 transition-colors flex items-start gap-4 ${
                  !notification.is_read ? "bg-primary/5" : "hover:bg-secondary/30"
                }`}
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center border ${
                    !notification.is_read
                      ? "bg-background border-primary/20 shadow-sm"
                      : "bg-secondary/50 border-border"
                  }`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm tracking-tight ${
                        !notification.is_read
                          ? "font-bold text-foreground"
                          : "font-semibold text-muted-foreground"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      !notification.is_read
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {notification.message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="All caught up!"
            description="You have no notifications right now. When you exceed a budget or have a bill due, it will appear here."
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          />
        )}
      </div>
    </div>
  );
}
