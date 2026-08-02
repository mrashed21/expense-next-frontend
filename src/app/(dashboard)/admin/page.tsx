"use client";

import { useGetUsersQuery, useGetSystemHealthQuery, useGetActivityQuery } from "../../../services/adminApi";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Server, Users, Activity, HardDrive, Cpu, ShieldAlert } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { formatDate } from "../../../lib/utils";
import { SystemHealthChart } from "../../../components/admin/SystemHealthChart";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  // Security check for client side routing
  useEffect(() => {
    if (user && user.user_role !== "admin" && user.user_role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: healthData, isLoading: healthLoading } = useGetSystemHealthQuery({});
  const { data: activityData, isLoading: activityLoading } = useGetActivityQuery({});

  if (!user || (user.user_role !== "admin" && user.user_role !== "super_admin")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const users = usersData?.data || [];
  const health = healthData?.data;
  const activities = activityData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor system health, manage users, and view platform activity.
        </p>
      </div>

      {/* Real-time System Health Section */}
      <SystemHealthChart />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Active Users
            </h2>
          </div>
          <div className="space-y-3">
            {usersLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-primary" />
            ) : users.length > 0 ? (
              users.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {u.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{u.user_name}</p>
                      <p className="text-xs text-muted-foreground">{u.user_email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.user_role === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground'}`}>
                    {u.user_role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No users found.</p>
            )}
          </div>
        </Card>

        {/* Global Activity */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Platform Activity
            </h2>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
            {activityLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-primary" />
            ) : activities.length > 0 ? (
              activities.map((act: any) => (
                <div key={act._id} className="flex items-center gap-3 p-3 rounded-2xl border border-border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${act.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {act.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">
                      <span className="text-primary">{act.user_id?.user_name || 'Unknown User'}</span> recorded {act.type}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(act.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No recent activity.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
