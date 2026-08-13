"use client";

import { Card } from "@/components/ui/card";
import { RootState } from "@/redux/store";
import {
  useGetActivityQuery,
  useGetDashboardStatsQuery,
  useGetSystemHealthQuery,
  useGetUserGrowthQuery,
  useGetUsersQuery,
} from "@/services/admin-api";
import {
  Activity,
  Cpu,
  Loader2,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: healthData, isLoading: healthLoading } =
    useGetSystemHealthQuery({});
  const { data: activityData, isLoading: activityLoading } =
    useGetActivityQuery({});
  const { data: statsData, isLoading: statsLoading } =
    useGetDashboardStatsQuery({});
  const { data: growthData, isLoading: growthLoading } = useGetUserGrowthQuery(
    {},
  );

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

  const stats = statsData?.data || {
    totalUsers: 0,
    totalAdmins: 0,
    totalTransactions: 0,
    activeUsers: 0,
  };
  const activitiesCount = activityData?.data?.length || 0;

  // Format uptime
  const uptimeSeconds = healthData?.data?.uptime || 0;
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Admin Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Welcome back, {user.user_name}. Here's a quick look at the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">
              Total Users
            </p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div>
            {statsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            )}
          </div>
          <Link href="/admin/users" className="absolute inset-0" />
        </Card>

        <Card className="p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">
              Recent Activities
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div>
            {statsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            )}
          </div>
          <Link href="/admin/activity" className="absolute inset-0" />
        </Card>

        <Card className="p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">
              Server Uptime
            </p>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div>
            {healthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">
                {days}d {hours}h {minutes}m
              </p>
            )}
          </div>
          <Link href="/admin/system-health" className="absolute inset-0" />
        </Card>

        <Card className="p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">
              Active Users (30d)
            </p>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div>
            {statsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            )}
          </div>
          <Link href="/admin/system-health" className="absolute inset-0" />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-6">User Growth (Last 30 Days)</h3>
        {growthLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData?.data || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Link href="/admin/users" className="group">
          <Card className="p-6 h-full border border-border hover:border-primary/50 transition-colors bg-secondary/20 hover:bg-secondary/40">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-lg mb-1">User Management</h3>
            <p className="text-sm text-muted-foreground">
              View, suspend, or activate user accounts and assign
              administrators.
            </p>
          </Card>
        </Link>

        <Link href="/admin/activity" className="group">
          <Card className="p-6 h-full border border-border hover:border-emerald-500/50 transition-colors bg-secondary/20 hover:bg-secondary/40">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-lg mb-1">Platform Activity</h3>
            <p className="text-sm text-muted-foreground">
              Track financial records added globally across all active users.
            </p>
          </Card>
        </Link>

        <Link href="/admin/system-health" className="group">
          <Card className="p-6 h-full border border-border hover:border-indigo-500/50 transition-colors bg-secondary/20 hover:bg-secondary/40">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-lg mb-1">System Health</h3>
            <p className="text-sm text-muted-foreground">
              Check server vital signs, memory utilization, and real-time
              connections.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
