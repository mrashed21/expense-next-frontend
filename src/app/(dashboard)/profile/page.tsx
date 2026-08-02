"use client";

import FormSelect from "@/components/custom/form-select";
import PhonesInput from "@/components/custom/phone-input";
import { bangladeshCities, cityAreas } from "@/lib/locationData";
import { formatDate } from "@/lib/utils";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutAllDevicesMutation } from "@/services/authApi";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetLoginHistoryQuery,
  useGetProfileQuery,
  useUpdateProfileImageMutation,
  useUpdateProfileMutation,
} from "@/services/userApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

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
  const router = useRouter();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData } = useGetProfileQuery({});
  const { data: historyData } = useGetLoginHistoryQuery({});
  const [updateProfileApi, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updateProfileImageApi, { isLoading: isUploadingImage }] =
    useUpdateProfileImageMutation();
  const [changePasswordApi, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [deleteAccountApi, { isLoading: isDeleting }] =
    useDeleteAccountMutation();
  const [logoutAllApi] = useLogoutAllDevicesMutation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const user = profileData?.data || {};
  const history = historyData?.data || [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    control: profileControl,
    clearErrors: clearProfileErrors,
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
      setTimeout(() => {
        dispatch(logout());
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.data?.message || "Password change failed");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllApi({}).unwrap();
      dispatch(logout());
      toast.success("Logged out from all active devices.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to logout all devices");
    }
  };

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("user_profile_image", file);

    try {
      await updateProfileImageApi(formData).unwrap();
      toast.success("Profile image updated!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to upload image");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountApi({}).unwrap();
      dispatch(logout());
      toast.success("Account deleted successfully.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Account & Security Profile
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your credentials, login history, and personal preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="glass-card p-6 rounded-3xl space-y-6 text-center">
          {/* Profile Image with Upload Button */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-full bg-primary/20 border-2 border-primary text-primary font-bold flex items-center justify-center text-3xl overflow-hidden shadow-xl">
              {user.user_profile_image ? (
                <img
                  src={user.user_profile_image}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.user_name?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            {/* Upload Overlay Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors border-2 border-background"
              title="Change Profile Photo"
            >
              {isUploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">
              {user.user_name || "User"}
            </h2>
            <p className="text-xs text-muted-foreground">{user.user_email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-bold text-foreground uppercase">
                {user.user_role || "User"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency:</span>
              <span className="font-bold text-foreground">
                {user.currency || "USD"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-bold text-foreground">
                {user.last_login ? formatDate(user.last_login) : "Now"}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleLogoutAll}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold text-xs border border-amber-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Logout All Devices</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-xs border border-rose-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
              Update Personal Details
            </h3>
            <form
              onSubmit={handleSubmitProfile(onUpdateProfile)}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Full Name
                  </label>
                  <input
                    {...registerProfile("user_name")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {profileErrors.user_name && (
                    <p className="text-[10px] text-destructive">
                      {profileErrors.user_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Phone Number
                  </label>
                  <Controller
                    name="user_phone"
                    control={profileControl}
                    render={({ field }) => (
                      <PhonesInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {profileErrors.user_phone && (
                    <p className="text-[10px] text-destructive">
                      {profileErrors.user_phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <FormSelect
                    label="City"
                    name="user_city"
                    control={profileControl}
                    options={bangladeshCities.map((c) => ({
                      label: c,
                      value: c,
                    }))}
                    searchable={true}
                    clearErrors={clearProfileErrors}
                    error={profileErrors.user_city}
                  />
                </div>
                <div className="space-y-1">
                  <FormSelect
                    label="Area"
                    name="user_area"
                    control={profileControl}
                    options={(profileControl._formValues.user_city &&
                    cityAreas[profileControl._formValues.user_city]
                      ? cityAreas[profileControl._formValues.user_city]
                      : []
                    ).map((a) => ({ label: a, value: a }))}
                    searchable={true}
                    clearErrors={clearProfileErrors}
                    error={profileErrors.user_area}
                  />
                </div>
                <div className="space-y-1">
                  <FormSelect
                    label="Country"
                    name="user_country"
                    control={profileControl}
                    options={[{ label: "Bangladesh", value: "Bangladesh" }]}
                    searchable={false}
                    clearErrors={clearProfileErrors}
                    error={profileErrors.user_country}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Default Currency"
                  name="currency"
                  control={profileControl}
                  options={[
                    { label: "USD ($) - US Dollar", value: "USD" },
                    { label: "BDT (৳) - Bangladeshi Taka", value: "BDT" },
                    { label: "EUR (€) - Euro", value: "EUR" },
                    { label: "GBP (£) - British Pound", value: "GBP" },
                    { label: "INR (₹) - Indian Rupee", value: "INR" },
                  ]}
                  searchable={false}
                  clearErrors={clearProfileErrors}
                  error={profileErrors.currency}
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
              Change Security Password
            </h3>
            <form
              onSubmit={handleSubmitPassword(onChangePassword)}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("current_password")}
                      type={showCurrentPassword ? "text" : "password"}
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.current_password && (
                    <p className="text-[10px] text-destructive">
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword("new_password")}
                      type={showNewPassword ? "text" : "password"}
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.new_password && (
                    <p className="text-[10px] text-destructive">
                      {passwordErrors.new_password.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="py-2.5 px-6 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Login History Table */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Recent Security Login History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                <th className="p-3">IP Address</th>
                <th className="p-3">Device / Browser</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {history.length > 0 ? (
                history.map((h: any) => (
                  <tr
                    key={h._id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 font-mono text-foreground font-bold">
                      {h.ip_address}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {h.device_info || h.user_agent || "Unknown"}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatDate(h.timestamp)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No login history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-rose-500/40 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Confirm Account Termination
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete your account? This action will
              suspend your access and mark your records as deleted. This cannot
              be undone.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-secondary text-foreground font-semibold text-xs border border-border hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-md hover:bg-rose-700 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
