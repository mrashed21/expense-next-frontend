"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/redux/store";
import {
  useGetAdminsQuery,
  useGetUsersQuery,
  useUpdateAdminStatusMutation,
  useUpdateUserStatusMutation,
} from "@/services/adminApi";
import {
  Ban,
  CheckCircle,
  Loader2,
  MoreVertical,
  ShieldAlert,
  UserCog,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: adminsData, isLoading: adminsLoading } = useGetAdminsQuery(
    {},
    { skip: user?.user_role !== "super_admin" },
  );

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updateAdminStatus] = useUpdateAdminStatusMutation();

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

  const users = usersData?.data || [];
  const admins = adminsData?.data || [];

  const handleUpdateUserStatus = async (id: string, status: string) => {
    try {
      await updateUserStatus({ id, status }).unwrap();
      toast.success(`User status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleUpdateAdminStatus = async (id: string, status: string) => {
    try {
      await updateAdminStatus({ id, status }).unwrap();
      toast.success(`Admin status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage system users and administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Users
            </h2>
          </div>
          <div className="space-y-3 max-h-15 overflow-y-auto scrollbar-hide pr-2">
            {usersLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-primary" />
            ) : users.length > 0 ? (
              users.map((u: any) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${u.user_status === "banned" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                    >
                      {u.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold flex items-center gap-2">
                        {u.user_name}
                        {u.user_status === "banned" && (
                          <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded uppercase">
                            Banned
                          </span>
                        )}
                        {u.user_status === "deactive" && (
                          <span className="text-[10px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded uppercase">
                            Inactive
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.user_email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {u.user_status !== "active" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateUserStatus(u._id, "active")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />{" "}
                          Activate
                        </DropdownMenuItem>
                      )}
                      {u.user_status !== "deactive" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateUserStatus(u._id, "deactive")
                          }
                        >
                          <UserCog className="h-4 w-4 mr-2 text-orange-500" />{" "}
                          Inactivate
                        </DropdownMenuItem>
                      )}
                      {u.user_status !== "banned" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateUserStatus(u._id, "banned")
                          }
                        >
                          <Ban className="h-4 w-4 mr-2 text-destructive" /> Ban
                          User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found.
              </p>
            )}
          </div>
        </Card>

        {/* Admin Management (Super Admin Only) */}
        {user.user_role === "super_admin" && (
          <Card className="p-6 space-y-4 border-destructive/20 bg-destructive/5">
            <div className="flex items-center justify-between border-b border-destructive/20 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-4 h-4" /> Administrators
              </h2>
            </div>
            <div className="space-y-3 max-h-150 overflow-y-auto scrollbar-hide pr-2">
              {adminsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-destructive" />
              ) : admins.length > 0 ? (
                admins.map((a: any) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-background border border-destructive/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                        {a.admin_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold flex items-center gap-2">
                          {a.admin_name}
                          {a.admin_status === "banned" && (
                            <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded uppercase">
                              Banned
                            </span>
                          )}
                          {a.admin_status === "deactive" && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded uppercase">
                              Inactive
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.admin_email}
                        </p>
                      </div>
                    </div>

                    {a._id !== user._id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4 text-destructive" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {a.admin_status !== "active" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateAdminStatus(a._id, "active")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />{" "}
                              Activate
                            </DropdownMenuItem>
                          )}
                          {a.admin_status !== "deactive" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateAdminStatus(a._id, "deactive")
                              }
                            >
                              <UserCog className="h-4 w-4 mr-2 text-orange-500" />{" "}
                              Inactivate
                            </DropdownMenuItem>
                          )}
                          {a.admin_status !== "banned" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateAdminStatus(a._id, "banned")
                              }
                            >
                              <Ban className="h-4 w-4 mr-2 text-destructive" />{" "}
                              Ban Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No admins found.
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
