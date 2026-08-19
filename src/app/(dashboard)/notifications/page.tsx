"use client";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import {
  getNotificationIcon,
  getRelativeTime,
} from "@/components/layout/notification-dropdown";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/services/notification-api";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type FilterValue =
  | "all"
  | "unread"
  | "budget"
  | "expense"
  | "income"
  | "reminder"
  | "security"
  | "user"
  | "system";

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Budget", value: "budget" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Reminder", value: "reminder" },
  { label: "Security", value: "security" },
  { label: "User", value: "user" },
  { label: "System", value: "system" },
];

function NotificationSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-secondary shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="h-3.5 bg-secondary rounded w-2/5" />
              <div className="h-3 bg-secondary rounded w-12 ml-auto" />
            </div>
            <div className="h-3 bg-secondary rounded w-3/4" />
            <div className="h-3 bg-secondary rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: notificationsData,
    isLoading,
    isError,
    refetch,
  } = useGetNotificationsQuery({});
  const [markAsReadApi, { isLoading: isMarkingOne }] = useMarkAsReadMutation();
  const [markAllAsReadApi, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();
  const [deleteApi, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const notifications = useMemo(
    () => notificationsData?.data || [],
    [notificationsData],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n: any) => !n.is_read).length,
    [notifications],
  );

  // Count per filter for badges
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.length,
      unread: unreadCount,
    };
    notifications.forEach((n: any) => {
      const key = (n.category || n.type || "").toLowerCase();
      FILTER_OPTIONS.forEach((opt) => {
        if (opt.value === "all" || opt.value === "unread") return;
        if (key.includes(opt.value)) {
          counts[opt.value] = (counts[opt.value] || 0) + 1;
        }
      });
    });
    return counts;
  }, [notifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      if (activeFilter === "unread") return !n.is_read;
      if (activeFilter === "all") return true;
      const catKey = (n.category || n.type || "").toLowerCase();
      return catKey.includes(activeFilter);
    });
  }, [notifications, activeFilter]);

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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApi(deleteId).unwrap();
      toast.success("Notification deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete notification");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary shrink-0" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Alerts for budgets, recurring bills, security events, and system
            updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 shrink-0 disabled:opacity-60"
          >
            {isMarkingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {FILTER_OPTIONS.map((opt) => {
          const count = filterCounts[opt.value] || 0;
          // Hide filters with no notifications (except "all" and "unread")
          if (opt.value !== "all" && opt.value !== "unread" && count === 0)
            return null;
          const isActive = activeFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {opt.label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications Card */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <NotificationSkeleton />
        ) : isError ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Failed to load notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Something went wrong while fetching your alerts.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredNotifications.map((n: any) => (
              <div
                key={n._id}
                className={`p-3 sm:p-4 transition-colors flex items-start gap-2.5 sm:gap-3.5 group ${
                  !n.is_read
                    ? "bg-primary/4 dark:bg-primary/8"
                    : "hover:bg-secondary/20"
                }`}
              >
                {/* Unread dot */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-colors [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 ${
                      !n.is_read
                        ? "bg-background border-primary/20 shadow-sm"
                        : "bg-secondary/40 border-border"
                    }`}
                  >
                    {getNotificationIcon(n.type, n.category)}
                  </div>
                  {!n.is_read && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Content Container */}
                <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
                  {/* Top Row: Title & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Title */}
                    <p
                      className={`text-sm ${
                        !n.is_read
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground"
                      } leading-snug flex-1`}
                    >
                      {n.title}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-col sm:flex-row">
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n._id)}
                          disabled={isMarkingOne}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-50"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(n._id)}
                        disabled={isDeleting}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Metadata Row */}
                  <div className="flex items-center gap-1.5 mt-0.5 mb-1.5 flex-wrap">
                    {n.category && (
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {n.category}
                      </span>
                    )}
                    {n.category && <span className="w-1 h-1 rounded-full bg-border" />}
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {getRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  {/* Message Row - Full Width */}
                  <p
                    className={`text-xs leading-relaxed ${
                      !n.is_read
                        ? "text-foreground/80"
                        : "text-muted-foreground/80"
                    }`}
                  >
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12">
            <EmptyState 
              title={
                activeFilter === "unread"
                  ? "You're all caught up!"
                  : activeFilter === "all"
                    ? "No notifications yet"
                    : `No ${activeFilter} notifications`
              }
              description={
                activeFilter === "unread"
                  ? "No unread notifications right now."
                  : activeFilter === "all"
                    ? "Alerts for budget breaches, bills, and account changes will appear here."
                    : `No notifications in the ${activeFilter} category.`
              }
              icon={
                activeFilter === "unread" ? (
                  <BellOff className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )
              }
              actionLabel={activeFilter !== "all" ? "View all notifications" : undefined}
              onAction={activeFilter !== "all" ? () => setActiveFilter("all") : undefined}
            />
          </div>
        )}
      </div>

      {/* Footer hint */}
      {filteredNotifications.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
          Showing {filteredNotifications.length} of {notifications.length}{" "}
          notifications
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="text-primary hover:underline ml-1"
            >
              · Show all
            </button>
          )}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove Notification"
        description="Are you sure you want to remove this notification? This action cannot be undone."
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
