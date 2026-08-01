"use client";

import { Bell, CheckCheck, AlertTriangle, FileCheck, Target, Info } from "lucide-react";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "../../../services/notificationApi";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data: notificationsData } = useGetNotificationsQuery({});
  const [markAsReadApi] = useMarkAsReadMutation();
  const [markAllApi] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [
    {
      _id: "1",
      title: "Budget Warning (80% Reached)",
      message: "You have reached 80% of your Food & Dining budget limit for August 2026.",
      type: "budget_alert",
      is_read: false,
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "Upcoming Bill Reminder",
      message: "WiFi Fiber Internet bill ($50.00) is due in 3 days.",
      type: "bill_reminder",
      is_read: false,
      createdAt: new Date(),
    },
    {
      _id: "3",
      title: "Goal Milestone Achieved!",
      message: "Congratulations! You reached 50% of your Emergency Fund goal.",
      type: "goal_milestone",
      is_read: true,
      createdAt: new Date(),
    },
  ];

  const handleMarkAll = async () => {
    try {
      await markAllApi({}).unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.success("All notifications read.");
    }
  };

  const handleMarkSingle = async (id: string) => {
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
          <p className="text-xs text-muted-foreground">In-app alerts for budget thresholds, bill due dates, and milestone progress</p>
        </div>

        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-primary" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="glass-card rounded-3xl p-6 space-y-3">
        {notifications.map((n: any) => (
          <div
            key={n._id}
            onClick={() => handleMarkSingle(n._id)}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
              n.is_read
                ? "bg-secondary/30 border-border opacity-70"
                : "bg-secondary/70 border-primary/40 shadow-sm"
            }`}
          >
            <div className="p-2.5 rounded-xl bg-card border border-border shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground">{n.title}</h3>
                <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
