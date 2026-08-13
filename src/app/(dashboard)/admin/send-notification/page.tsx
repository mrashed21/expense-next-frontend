"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { RootState } from "@/redux/store";
import {
  useGetNotificationHistoryQuery,
  useGetUsersQuery,
  useSendUserNotificationMutation,
  useBroadcastNotificationMutation,
} from "@/services/admin-api";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Search,
  Send,
  ShieldAlert,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

/* ── Types ───────────────────────────────────────────────── */
type NotifType = "info" | "success" | "warning" | "alert";

interface TargetUser {
  _id: string;
  user_name: string;
  user_email: string;
  user_status: string;
}

/* ── Helpers ─────────────────────────────────────────────── */
const TYPE_CONFIG: Record<
  NotifType,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
    badge: string;
  }
> = {
  info: {
    label: "Information",
    icon: Info,
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-500",
  },
  success: {
    label: "Success",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-500",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-500",
  },
  alert: {
    label: "Alert",
    icon: XCircle,
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    badge: "bg-red-500/15 text-red-500",
  },
};

function NotifTypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type as NotifType] ?? TYPE_CONFIG.info;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badge}`}
    >
      {type}
    </span>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function SendNotificationPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  /* ── Auth guard ── */
  useEffect(() => {
    if (user && !user.isAdmin) router.replace("/dashboard");
  }, [user, router]);

  const [targetType, setTargetType] = useState<"specific" | "all">("specific");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<TargetUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotifType>("info");
  const searchRef = useRef<HTMLDivElement>(null);

  /* ── Debounce search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* ── API ── */
  const { data: usersResponse, isFetching: searchFetching } = useGetUsersQuery(
    { limit: 8, page: 1, search: debouncedSearch, filter: "all" },
    { skip: debouncedSearch.length < 2 },
  );

  const { data: historyData, isLoading: historyLoading } =
    useGetNotificationHistoryQuery({ page: 1, limit: 10 });

  const [sendNotification, { isLoading: sending }] =
    useSendUserNotificationMutation();

  const [broadcastNotification, { isLoading: broadcasting }] =
    useBroadcastNotificationMutation();
    
  const isActionLoading = sending || broadcasting;

  /* ── Derived ── */
  const searchResults: TargetUser[] = usersResponse?.data?.users ?? [];
  const recentNotifications = historyData?.data?.notifications ?? [];

  const typeConfig = TYPE_CONFIG[type];
  const TypeIcon = typeConfig.icon;

  const titleLeft = 50 - title.length;
  const messageLeft = 200 - message.length;

  /* ── Handlers ── */
  const handleSelectUser = (u: TargetUser) => {
    setSelectedUser(u);
    setSearchQuery(u.user_name);
    setShowDropdown(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchQuery("");
  };

  const handleSend = async () => {
    if (targetType === "specific" && !selectedUser) {
      toast.error("Please select a target user first.");
      return;
    }
    if (title.trim().length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (message.trim().length < 5) {
      toast.error("Message must be at least 5 characters.");
      return;
    }

    try {
      if (targetType === "specific" && selectedUser) {
        await sendNotification({
          id: selectedUser._id,
          title: title.trim(),
          message: message.trim(),
          type,
        }).unwrap();
        toast.success(`Notification sent to ${selectedUser.user_name} successfully!`);
      } else if (targetType === "all") {
        await broadcastNotification({
          title: title.trim(),
          message: message.trim(),
          type,
        }).unwrap();
        toast.success("Broadcast notification sent to all active users!");
      }

      setTitle("");
      setMessage("");
      setType("info");
      if (targetType === "all") {
        setTargetType("specific");
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to send notification.");
    }
  };

  /* ── Guard render ── */
  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" />
          Send Notification
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Search a user and send them a real-time notification instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Form ─────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Step 1 — User Search */}
          <Card className="p-5 border border-border shadow-sm bg-card/60 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-sm font-bold">Select Target User</h2>
            </div>

            <div className="space-y-4">
              <div className="flex bg-secondary/30 p-1 rounded-xl">
                <button
                  onClick={() => setTargetType("specific")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    targetType === "specific"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Specific User
                </button>
                <button
                  onClick={() => {
                    setTargetType("all");
                    handleClearUser();
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    targetType === "all"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  All Users
                </button>
              </div>

              {targetType === "specific" ? (
                <div className="space-y-2" ref={searchRef}>
                  <Label htmlFor="user-search" className="text-xs text-muted-foreground font-medium">
                    Search by name or email
                  </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="user-search"
                  placeholder="Type name or email..."
                  className="pl-9 pr-9 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedUser) setSelectedUser(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) setShowDropdown(true);
                  }}
                  autoComplete="off"
                />
                {(searchFetching) && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {selectedUser && !searchFetching && (
                  <button
                    onClick={handleClearUser}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Dropdown */}
                {showDropdown && searchQuery.length >= 2 && !selectedUser && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    {searchFetching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No users found for &quot;{debouncedSearch}&quot;
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto py-1">
                        {searchResults.map((u) => (
                          <button
                            key={u._id}
                            onClick={() => handleSelectUser(u)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
                              {u.user_name?.charAt(0) ?? "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {u.user_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {u.user_email}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                u.user_status === "active"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-orange-500/10 text-orange-500"
                              }`}
                            >
                              {u.user_status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected user chip */}
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 mt-2">
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {selectedUser.user_name?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {selectedUser.user_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUser.user_email}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                </div>
              )}
            </div>
          ) : null}
          </div>
        </Card>

          {/* Step 2 — Compose */}
          <Card className="p-5 border border-border shadow-sm bg-card/60 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-sm font-bold">Compose Notification</h2>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-title" className="text-xs text-muted-foreground font-medium">
                  Title <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-[10px] font-mono ${titleLeft < 10 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {titleLeft} left
                </span>
              </div>
              <Input
                id="notif-title"
                placeholder="e.g. Account Verification Required"
                value={title}
                maxLength={50}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-message" className="text-xs text-muted-foreground font-medium">
                  Message <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-[10px] font-mono ${messageLeft < 20 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {messageLeft} left
                </span>
              </div>
              <textarea
                id="notif-message"
                rows={4}
                placeholder="Provide details about this notification..."
                value={message}
                maxLength={200}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">
                Notification Type
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as NotifType)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TYPE_CONFIG) as [NotifType, typeof TYPE_CONFIG.info][]).map(
                    ([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                            <span>{cfg.label}</span>
                          </div>
                        </SelectItem>
                      );
                    },
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Send button */}
            <div className="pt-2 border-t border-border">
              <Button
                onClick={handleSend}
                disabled={isActionLoading || (targetType === "specific" && !selectedUser)}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {targetType === "all" ? "Broadcast to All Users" : "Send Notification"}
                  </>
                )}
              </Button>
              {targetType === "specific" && !selectedUser && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Select a user above to enable sending.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right: Preview + History ────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Live Preview */}
          <Card className="p-5 border border-border shadow-sm bg-card/60 space-y-4">
            <h2 className="text-sm font-bold border-b border-border pb-1">
              Live Preview
            </h2>
            <div
              className={`rounded-xl border p-4 space-y-2 transition-all duration-200 ${typeConfig.bg} ${typeConfig.border}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${typeConfig.bg}`}
                >
                  <TypeIcon className={`w-5 h-5 ${typeConfig.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-bold truncate ${title ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {title || "Notification Title"}
                    </p>
                    <NotifTypeBadge type={type} />
                  </div>
                  <p
                    className={`text-xs mt-1 line-clamp-3 ${message ? "text-foreground/80" : "text-muted-foreground"}`}
                  >
                    {message || "Your notification message will appear here."}
                  </p>
                  {targetType === "specific" && selectedUser ? (
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      To:{" "}
                      <span className={`font-semibold ${typeConfig.text}`}>
                        {selectedUser.user_name}
                      </span>
                    </p>
                  ) : targetType === "all" ? (
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      To:{" "}
                      <span className={`font-semibold ${typeConfig.text}`}>
                        All Active Users
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              This is how the notification will appear to the user.
            </p>
          </Card>

          {/* Recent Notifications */}
          <Card className="p-5 border border-border shadow-sm bg-card/60 space-y-3">
            <h2 className="text-sm font-bold border-b border-border pb-1">
              Recently Sent
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No notifications sent yet.
                </p>
              ) : (
                recentNotifications.map((n: any) => {
                  const cfg =
                    TYPE_CONFIG[n.type as NotifType] ?? TYPE_CONFIG.info;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n._id}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold truncate">
                            {n.title}
                          </p>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${n.is_read ? "text-muted-foreground" : "text-emerald-500"}`}
                          >
                            {n.is_read ? "Read" : "Unread"}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {n.user_id?.user_email ?? "Unknown"}
                          </p>
                          <span className="text-[9px] text-muted-foreground">
                            {formatDate(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {recentNotifications.length > 0 && (
              <button
                onClick={() => router.push("/admin/notifications")}
                className="flex items-center gap-1 text-xs text-primary hover:underline w-full justify-center pt-1"
              >
                View full history
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
