"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/redux/store";
import { useGetAdminFeedbacksQuery } from "@/services/feedback-api";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/services/notification-api";
import { useGetAdminReviewsQuery } from "@/services/review-api";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Info,
  MessageSquare,
  Shield,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export function getRelativeTime(dateStr: string | Date) {
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Recently";
  }
}

export function getNotificationIcon(type?: string, category?: string) {
  const catKey = (category || type || "").toLowerCase();

  if (catKey.includes("budget")) {
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  }
  if (catKey.includes("income")) {
    return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  }
  if (catKey.includes("expense")) {
    return <TrendingDown className="w-4 h-4 text-rose-500" />;
  }
  if (catKey.includes("security")) {
    return <Shield className="w-4 h-4 text-indigo-500" />;
  }
  if (catKey.includes("reminder") || catKey.includes("bill")) {
    return <Clock className="w-4 h-4 text-sky-500" />;
  }
  if (catKey.includes("user")) {
    return <User className="w-4 h-4 text-purple-500" />;
  }
  if (catKey.includes("system")) {
    return <Info className="w-4 h-4 text-blue-500" />;
  }
  if (catKey.includes("feedback")) {
    return <MessageSquare className="w-4 h-4 text-cyan-500" />;
  }
  if (catKey.includes("review")) {
    return <Star className="w-4 h-4 text-yellow-500" />;
  }
  return <Wallet className="w-4 h-4 text-primary" />;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Admin: fetch pending feedbacks and reviews
  const { data: adminFeedbackData } = useGetAdminFeedbacksQuery(
    {},
    { skip: !user?.isAdmin },
  );
  const { data: adminReviewData } = useGetAdminReviewsQuery(
    {},
    { skip: !user?.isAdmin },
  );

  const adminNotifications = useMemo(() => {
    if (!user?.isAdmin) return [];

    const feedbacks = (adminFeedbackData?.data || [])
      .filter((f: any) => f.status === "pending")
      .map((f: any) => ({
        _id: f._id,
        type: "feedback",
        title: "New Feedback",
        message: `${f.user_id?.user_name || "Someone"} sent a feedback`,
        createdAt: f.createdAt,
        is_read: false,
        url: "/admin/feedbacks",
      }));

    const reviews = (adminReviewData?.data || [])
      .filter((r: any) => r.status === "pending")
      .map((r: any) => ({
        _id: r._id,
        type: "review",
        title: "New Review",
        message: `${r.user_id?.user_name || "Someone"} submitted a review`,
        createdAt: r.createdAt,
        is_read: false,
        url: "/admin/reviews",
      }));

    return [...feedbacks, ...reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [adminFeedbackData, adminReviewData, user?.isAdmin]);

  const {
    data: notificationsData,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
  } = useGetNotificationsQuery(undefined, {
    skip: !!user?.isAdmin,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });

  const [markAsReadApi] = useMarkAsReadMutation();
  const [markAllAsReadApi, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();
  const [deleteNotificationApi] = useDeleteNotificationMutation();

  const isLoading = user?.isAdmin ? false : isNotificationsLoading;
  const isError = user?.isAdmin ? false : isNotificationsError;

  const notifications = useMemo(
    () => (user?.isAdmin ? adminNotifications : notificationsData?.data || []),
    [user?.isAdmin, adminNotifications, notificationsData],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n: any) => !n.is_read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n: any) => !n.is_read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user?.isAdmin) return;
    try {
      await markAsReadApi(id).unwrap();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user?.isAdmin) return;
    try {
      await markAllAsReadApi({}).unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user?.isAdmin) return;
    try {
      await deleteNotificationApi(id).unwrap();
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to remove notification");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-1 leading-none animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border bg-secondary/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              Notifications
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold">
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && !user?.isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="h-7 text-[11px] px-2 text-primary hover:text-primary/80 font-medium"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex border-b border-border px-3 py-1.5 bg-background gap-2 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors ${
              activeTab === "all"
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors ${
              activeTab === "unread"
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Scrollable Notifications Body */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-rose-500 font-medium">
                Failed to load notifications. Please try again.
              </p>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1"
                onClick={() => setIsOpen(false)}
              >
                <Link
                  href={
                    user?.isAdmin ? "/admin/notifications" : "/notifications"
                  }
                >
                  View All Notifications
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((n: any) => (
              <div
                key={n._id}
                onClick={(e) => {
                  if (user?.isAdmin) {
                    setIsOpen(false);
                    router.push(n.url);
                  } else if (!n.is_read) {
                    handleMarkAsRead(e, n._id);
                  }
                }}
                className={`p-3 transition-colors flex items-start gap-3 relative group ${!n.is_read || user?.isAdmin ? "cursor-pointer" : ""} ${
                  !n.is_read
                    ? "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10"
                    : "hover:bg-secondary/40"
                }`}
              >
                {/* Category Icon */}
                <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  {getNotificationIcon(n.type, n.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate ${!n.is_read ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
                    >
                      {n.title}
                    </p>
                    <span className="text-[9px] text-muted-foreground shrink-0 font-medium">
                      {getRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                </div>

                {/* Inline Action Buttons */}
                {!user?.isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, n._id)}
                        title="Mark as read"
                        className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      title="Delete notification"
                      className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                No {activeTab === "unread" ? "unread" : ""} notifications right
                now.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-secondary/20 text-center">
          <Button
            asChild
            variant="ghost"
            className="w-full h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 justify-center gap-1"
            onClick={() => setIsOpen(false)}
          >
            <Link
              href={user?.isAdmin ? "/admin/notifications" : "/notifications"}
            >
              View All Notifications
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
