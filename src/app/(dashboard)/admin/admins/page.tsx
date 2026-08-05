"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/redux/store";
import {
  useCreateAdminMutation,
  useGetAdminsQuery,
  useUpdateAdminStatusMutation,
} from "@/services/admin-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ban,
  CheckCircle,
  Loader2,
  MoreVertical,
  Plus,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import * as z from "zod";

const adminSchema = z.object({
  admin_name: z.string().min(2, "Name is required"),
  admin_email: z.string().email("Invalid email address"),
  admin_password: z.string().min(6, "Password must be at least 6 characters"),
  admin_role: z.enum(["admin", "super_admin"]),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export default function AdminAdminsPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.user_role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: adminsData, isLoading: adminsLoading } = useGetAdminsQuery(
    {},
    { skip: user?.user_role !== "super_admin" },
  );

  const [updateAdminStatus] = useUpdateAdminStatusMutation();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { admin_role: "admin" },
  });

  if (!user || user.user_role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">
          Only Super Admins can view this page.
        </p>
      </div>
    );
  }

  const admins = adminsData?.data || [];

  const handleUpdateAdminStatus = async (id: string, status: string) => {
    try {
      await updateAdminStatus({ id, status }).unwrap();
      toast.success(`Admin status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const onSubmit = async (data: AdminFormValues) => {
    try {
      await createAdmin(data).unwrap();
      toast.success("Admin created successfully!");
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create admin");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Admin Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create and manage system administrators.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold gap-2 shadow-lg hover:shadow-primary/20 transition-all">
              <Plus className="w-4 h-4" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 rounded-3xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">
                Create New Admin
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Name
                </label>
                <input
                  {...register("admin_name")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
                  placeholder="John Doe"
                />
                {errors.admin_name && (
                  <p className="text-[10px] text-destructive">
                    {errors.admin_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Email
                </label>
                <input
                  {...register("admin_email")}
                  type="email"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
                  placeholder="admin@example.com"
                />
                {errors.admin_email && (
                  <p className="text-[10px] text-destructive">
                    {errors.admin_email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Password
                </label>
                <input
                  {...register("admin_password")}
                  type="password"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                />
                {errors.admin_password && (
                  <p className="text-[10px] text-destructive">
                    {errors.admin_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Role
                </label>
                <select
                  {...register("admin_role")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {errors.admin_role && (
                  <p className="text-[10px] text-destructive">
                    {errors.admin_role.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl font-bold py-5 mt-4"
              >
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Admin"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between border-b border-primary/20 pb-3">
          <h2 className="text-base font-bold flex items-center gap-2 text-primary">
            <ShieldAlert className="w-4 h-4" /> Administrators
          </h2>
        </div>
        <div className="space-y-3">
          {adminsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto my-4 text-primary" />
          ) : admins.length > 0 ? (
            admins.map((a: any) => (
              <div
                key={a._id}
                className="flex items-center justify-between p-4 rounded-2xl bg-background border border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg">
                    {a.admin_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold flex items-center gap-2">
                      {a.admin_name}
                      {a.admin_status === "banned" && (
                        <span className="text-[10px] bg-destructive/20 text-destructive px-2 py-0.5 rounded-full uppercase">
                          Banned
                        </span>
                      )}
                      {a.admin_status === "deactive" && (
                        <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full uppercase">
                          Inactive
                        </span>
                      )}
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase ml-2">
                        {a.admin_role.replace("_", " ")}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
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
                        className="h-9 w-9 rounded-full"
                      >
                        <MoreVertical className="h-5 w-5 text-primary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      {a.admin_status !== "active" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateAdminStatus(a._id, "active")
                          }
                          className="rounded-lg cursor-pointer"
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
                          className="rounded-lg cursor-pointer"
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
                          className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Ban className="h-4 w-4 mr-2 text-destructive" /> Ban
                          Admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No administrators found.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
