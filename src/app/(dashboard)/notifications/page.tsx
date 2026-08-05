"use client";

import { useMemo, useState } from "react";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} from "@/services/notification-api";
import {
  Bell,
  Check,
  CheckCircle2,
  Trash2,
  Filter,
  Shield,
  Clock,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  User,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/custom/empty-state";
import { TableSkeleton } from "@/components/custom/table-skeleton";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { getNotificationIcon, getRelativeTime } from "@/components/layout/notification-dropdown";

const categories = [
  { label: "All Categories", value: "all" },
  { label: "Budget", value: "budget" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Reminder", value: "reminder" },
  { label: "Security", value: "security" },
  { label: "User", value: "user" },
  { label: "System", value: "system" },
];

export default function NotificationsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: notificationsData, isLoading, isError } = useGetNotificationsQuery({});
  const [markAsReadApi] = useMarkAsReadMutation();
  const [markAllAsReadApi, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteApi] = useDeleteNotificationMutation();

  const notifications = useMemo(() => notificationsData?.data || [], [notificationsData]);

  const unreadCount = useMemo(
    () => notifications.filter((n: any) => !n.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      const catKey = (n.category || n.type || "").toLowerCase();
      if (categoryFilter !== "all" && !catKey.includes(categoryFilter)) {
        return false;
      }
      if (showUnreadOnly && n.is_read) {
        return false;
      }
      return true;
    });
  }, [notifications, categoryFilter, showUnreadOnly]);

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
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications Center
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Stay updated with real-time alerts for budgets, recurring bills, security events, and system updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Unread Only Toggle */}
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            showUnreadOnly
              ? "bg-primary/10 border-primary text-primary font-bold"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Unread Only</span>
        </button>
      </div>

      {/* Notifications List Card */}
      <div className="glass-card rounded-3xl border border-border overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={1} rows={5} />
        ) : isError ? (
          <div className="p-12 text-center text-xs text-rose-500 font-medium">
            Failed to load notifications. Please refresh the page.
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredNotifications.map((n: any) => (
              <div
                key={n._id}
                className={`p-4 transition-colors flex items-start gap-4 ${
                  !n.is_read ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-secondary/30"
                }`}
              >
                {/* Category Icon */}
                <div
                  className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center border ${
                    !n.is_read
                      ? "bg-background border-primary/30 shadow-xs"
                      : "bg-secondary/50 border-border"
                  }`}
                >
                  {getNotificationIcon(n.type, n.category)}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm tracking-tight ${
                          !n.is_read
                            ? "font-bold text-foreground"
                            : "font-semibold text-muted-foreground"
                        }`}
                      >
                        {n.title}
                      </p>
                      {n.category && (
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground capitalize">
                          {n.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap shrink-0">
                      {getRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      !n.is_read ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {n.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(n._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notifications found"
            description="You have no matching notifications right now. Alerts for budget breaches, bills, and account changes will appear here."
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove Notification"
        description="Are you sure you want to remove this notification?"
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
