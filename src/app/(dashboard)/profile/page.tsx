"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, ShieldCheck, Lock, ShieldAlert, Clock, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useGetLoginHistoryQuery } from "../../../services/userApi";
import { useLogoutAllDevicesMutation } from "../../../services/authApi";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";

const profileSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters"),
  user_phone: z.string().optional(),
  user_area: z.string().optional(),
  user_city: z.string().optional(),
  user_country: z.string().optional(),
  currency: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: profileData } = useGetProfileQuery({});
  const { data: historyData } = useGetLoginHistoryQuery({});
  const [updateProfileApi, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePasswordApi, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [logoutAllApi] = useLogoutAllDevicesMutation();

  const user = profileData?.data || {};
  const history = historyData?.data || [];

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      user_name: user.user_name || "",
      user_phone: user.user_phone || "",
      user_area: user.user_area || "",
      user_city: user.user_city || "",
      user_country: user.user_country || "",
      currency: user.currency || "USD",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      await updateProfileApi(data).unwrap();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    try {
      await changePasswordApi(data).unwrap();
      toast.success("Password changed! Please log in again.");
      resetPasswordForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Password change failed");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllApi({}).unwrap();
      toast.success("Logged out from all active devices.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to logout all devices");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Account & Security Profile</h1>
        <p className="text-xs text-muted-foreground">Manage your credentials, login history, and personal preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="glass-card p-6 rounded-3xl space-y-6 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-full bg-primary/20 border-2 border-primary text-primary font-bold flex items-center justify-center text-3xl overflow-hidden shadow-xl">
              {user.user_profile_image ? (
                <img src={user.user_profile_image} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user.user_name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">{user.user_name || "User"}</h2>
            <p className="text-xs text-muted-foreground">{user.user_email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-bold text-foreground uppercase">{user.user_role || "User"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-bold text-foreground">{user.last_login ? formatDate(user.last_login) : "Now"}</span>
            </div>
          </div>

          <button
            onClick={handleLogoutAll}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold text-xs border border-amber-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Logout All Devices</span>
          </button>
        </div>

        {/* Right 2 Columns: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">Update Personal Details</h3>
            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    {...registerProfile("user_name")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Phone Number</label>
                  <input
                    {...registerProfile("user_phone")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Area</label>
                  <input
                    {...registerProfile("user_area")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">City</label>
                  <input
                    {...registerProfile("user_city")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Country</label>
                  <input
                    {...registerProfile("user_country")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">Change Security Password</h3>
            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Current Password</label>
                  <input
                    {...registerPassword("current_password")}
                    type="password"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <input
                    {...registerPassword("new_password")}
                    type="password"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="py-2.5 px-6 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors flex items-center justify-center gap-2"
              >
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Login History Table */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-foreground">Recent Security Login History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                <th className="p-3">IP Address</th>
                <th className="p-3">Device / OS</th>
                <th className="p-3">Browser</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {history.map((h: any) => (
                <tr key={h._id}>
                  <td className="p-3 font-mono text-foreground font-bold">{h.ip_address}</td>
                  <td className="p-3">{h.device_info}</td>
                  <td className="p-3">{h.browser}</td>
                  <td className="p-3 text-right text-muted-foreground">{formatDate(h.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
