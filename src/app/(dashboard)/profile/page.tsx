"use client";

import AvatarCropper from "@/components/custom/avatar-cropper";
import FormSelect from "@/components/custom/form-select";
import PhonesInput from "@/components/custom/phone-input";
import { bangladeshCities, cityAreas } from "@/lib/location-data";
import { formatDate } from "@/lib/utils";
import { logout, updateUser } from "@/redux/slices/auth-slice";
import {
  useUpdateAdminProfileImageMutation,
  useUpdateAdminProfileMutation,
} from "@/services/admin-api";
import { useLogoutAllDevicesMutation } from "@/services/auth-api";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useDisable2FAMutation,
  useGenerate2FAMutation,
  useGetDevicesQuery,
  useGetLoginHistoryQuery,
  useGetProfileQuery,
  useRevokeDeviceMutation,
  useUpdateProfileImageMutation,
  useUpdateProfileMutation,
  useVerify2FAMutation,
} from "@/services/user-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
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

  const authUser = useSelector((state: any) => state.auth.user);
  const { data: profileData } = useGetProfileQuery(
    {},
    { skip: !!authUser?.isAdmin },
  );
  const { data: historyData } = useGetLoginHistoryQuery({});
  const [updateProfileApi, { isLoading: isUpdatingUserProfile }] =
    useUpdateProfileMutation();
  const [updateProfileImageApi, { isLoading: isUploadingUserImage }] =
    useUpdateProfileImageMutation();

  const [updateAdminProfileApi, { isLoading: isUpdatingAdminProfile }] =
    useUpdateAdminProfileMutation();
  const [updateAdminProfileImageApi, { isLoading: isUploadingAdminImage }] =
    useUpdateAdminProfileImageMutation();

  const isUpdatingProfile = isUpdatingUserProfile || isUpdatingAdminProfile;
  const isUploadingImage = isUploadingUserImage || isUploadingAdminImage;
  const [changePasswordApi, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [deleteAccountApi, { isLoading: isDeleting }] =
    useDeleteAccountMutation();
  const [logoutAllApi] = useLogoutAllDevicesMutation();

  const { data: devicesData } = useGetDevicesQuery({});
  const [generate2FA] = useGenerate2FAMutation();
  const [verify2FA, { isLoading: isVerifying2FA }] = useVerify2FAMutation();
  const [disable2FA, { isLoading: isDisabling2FA }] = useDisable2FAMutation();
  const [revokeDeviceApi] = useRevokeDeviceMutation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const rawUser = authUser?.isAdmin ? authUser : profileData?.data;

  // Admin documents store the same profile fields under an `admin_` prefix.
  // Normalise both shapes onto the `user_` keys the form and UI read, otherwise
  // an admin's saved area/city/phone never make it back into the form and the
  // next save writes them back as empty strings.
  const user = useMemo(() => {
    const u: any = rawUser || {};
    return {
      ...u,
      user_name: u.user_name || u.admin_name || "",
      user_email: u.user_email || u.admin_email || "",
      user_phone: u.user_phone || u.admin_phone || "",
      user_area: u.user_area || u.admin_area || "",
      user_city: u.user_city || u.admin_city || "",
      user_country: u.user_country || u.admin_country || "",
      user_role: u.user_role || u.admin_role || "",
      user_profile_image: u.user_profile_image || u.admin_profile_image || "",
    };
  }, [rawUser]);

  const history = historyData?.data || [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const completionScore = useMemo(() => {
    let score = 0;
    if (user.user_name) score += 20;
    if (user.user_phone) score += 20;
    if (user.user_city && user.user_area) score += 20;
    if (user.user_country) score += 20;
    if (user.user_profile_image) score += 20;
    return score;
  }, [user]);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    control: profileControl,
    clearErrors: clearProfileErrors,
    getValues: getProfileValues,
    setValue: setProfileValue,
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

  const selectedCity = useWatch({ control: profileControl, name: "user_city" });

  // Areas are city-specific. Without this the previous city's area stays in
  // form state (invisible, since it is no longer an option) and gets saved.
  useEffect(() => {
    if (!selectedCity) return;
    const currentArea = getProfileValues("user_area");
    if (currentArea && !(cityAreas[selectedCity] || []).includes(currentArea)) {
      setProfileValue("user_area", "");
    }
  }, [selectedCity, getProfileValues, setProfileValue]);

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
      if (authUser?.isAdmin) {
        const adminData = {
          admin_name: data.user_name,
          admin_phone: data.user_phone,
          admin_area: data.user_area,
          admin_city: data.user_city,
          admin_country: data.user_country,
          currency: data.currency,
        };
        const res: any = await updateAdminProfileApi(adminData).unwrap();
        // Mirror every saved field back into the store — it is the only source
        // the admin profile form reads from (there is no admin GET profile).
        dispatch(
          updateUser({
            ...(res?.data || adminData),
            user_name: data.user_name,
          } as any),
        );
      } else {
        await updateProfileApi(data).unwrap();
      }
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

  const handleEnable2FA = async () => {
    try {
      const res = await generate2FA({}).unwrap();
      setQrCodeUrl(res.data.qrCodeUrl);
      setIs2FaModalOpen(true);
      setRecoveryCodes(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate 2FA");
    }
  };

  const handleVerify2FA = async () => {
    if (twoFaCode.length !== 6) return toast.error("Code must be 6 digits");
    try {
      const res = await verify2FA({ code: twoFaCode }).unwrap();
      toast.success("Two-Factor Authentication Enabled!");
      setRecoveryCodes(res.data.recoveryCodes);
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid 2FA code");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA({}).unwrap();
      toast.success("Two-Factor Authentication Disabled");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to disable 2FA");
    }
  };

  const handleRevokeDevice = async (id: string) => {
    try {
      await revokeDeviceApi(id).unwrap();
      toast.success("Device revoked successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to revoke device");
    }
  };

  const handleProfileImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Reset the input so re-picking the same file still fires onChange.
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setSelectedFile(file);
    setIsCropModalOpen(true);
  };

  const handleUploadCroppedImage = async (croppedFile: File) => {
    const formData = new FormData();
    formData.append(
      authUser?.isAdmin ? "admin_profile_image" : "user_profile_image",
      croppedFile,
    );

    try {
      if (authUser?.isAdmin) {
        const res = await updateAdminProfileImageApi(formData).unwrap();
        dispatch(
          updateUser({
            user_profile_image: res.data.admin_profile_image,
            admin_profile_image: res.data.admin_profile_image,
          } as any),
        );
      } else {
        await updateProfileImageApi(formData).unwrap();
      }
      toast.success("Profile image updated!");
      setIsCropModalOpen(false);
      setSelectedFile(null);
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
        <h1 className="text-xl font-bold tracking-tight">
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
              ) : user.user_name ? (
                <span>{user.user_name.charAt(0).toUpperCase()}</span>
              ) : (
                <span>U</span>
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
            {(user.user_city || user.user_area) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-bold text-foreground text-right max-w-[55%] truncate">
                  {[user.user_area, user.user_city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {user.user_country && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country:</span>
                <span className="font-bold text-foreground">
                  {user.user_country}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-bold text-foreground">
                {user.last_login ? formatDate(user.last_login) : "Now"}
              </span>
            </div>
          </div>

          {/* Profile Completion Indicator */}
          <div className="pt-4 border-t border-border text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Profile Completion
              </span>
              <span className="text-xs font-bold text-foreground">
                {completionScore}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${completionScore === 100 ? "bg-emerald-500" : "bg-primary"}`}
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
            {completionScore < 100 && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Complete your profile to secure your account and personalize
                your experience.
              </p>
            )}
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
                    options={(selectedCity && cityAreas[selectedCity]
                      ? cityAreas[selectedCity]
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

          {/* 2FA Security Form */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex justify-between items-center">
              <span>Two-Factor Authentication (2FA)</span>
              {user.two_factor_enabled ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                  Enabled
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                  Disabled
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Protect your account with an extra layer of security. Once
              configured, you'll be required to enter both your password and an
              authentication code from your mobile phone in order to sign in.
            </p>
            {user.two_factor_enabled ? (
              <button
                onClick={handleDisable2FA}
                disabled={isDisabling2FA}
                className="py-2.5 px-6 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs border border-rose-500/20 transition-colors flex items-center justify-center gap-2"
              >
                {isDisabling2FA ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Disable 2FA"
                )}
              </button>
            ) : (
              <button
                onClick={handleEnable2FA}
                className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Setup 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trusted Devices Table */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Trusted Devices
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Devices that have securely logged into your account. You can revoke
          access to any unrecognized device.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                <th scope="col" className="p-3">
                  Device Name
                </th>
                <th scope="col" className="p-3">
                  IP Address
                </th>
                <th scope="col" className="p-3">
                  Last Active
                </th>
                <th scope="col" className="p-3 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {devicesData?.data?.length > 0 ? (
                devicesData.data.map((d: any) => (
                  <tr
                    key={d._id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 text-foreground font-bold flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      {d.device_name}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {d.ip_address}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(d.last_active)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRevokeDevice(d._id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-bold transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No trusted devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                <th scope="col" className="p-3">
                  IP Address
                </th>
                <th scope="col" className="p-3">
                  Device / Browser
                </th>
                <th scope="col" className="p-3 text-right">
                  Timestamp
                </th>
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
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-md bg-card border border-rose-500/40 p-6 rounded-3xl space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3
                id="modal-title"
                className="text-base font-bold text-rose-500 flex items-center gap-2"
              >
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

      {/* Avatar Crop Modal */}
      {isCropModalOpen && selectedFile && (
        <AvatarCropper
          file={selectedFile}
          isUploading={isUploadingImage}
          onCancel={() => {
            setIsCropModalOpen(false);
            setSelectedFile(null);
          }}
          onCropped={handleUploadCroppedImage}
        />
      )}

      {/* 2FA Setup Modal */}
      {is2FaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Two-Factor Authentication Setup
              </h3>
              <button
                onClick={() => setIs2FaModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!recoveryCodes ? (
              <div className="space-y-4 flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground">
                  Scan the QR code below using an authenticator app (like Google
                  Authenticator or Authy).
                </p>
                {qrCodeUrl && (
                  <div className="bg-white p-2 rounded-xl">
                    <img
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                )}
                <div className="w-full space-y-2">
                  <label className="text-xs font-semibold text-foreground text-left block">
                    Enter the 6-digit code from your app
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    placeholder="000000"
                    className="w-full px-4 py-2 rounded-xl bg-secondary border border-border text-center text-lg font-mono tracking-widest focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleVerify2FA}
                  disabled={isVerifying2FA}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  {isVerifying2FA ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify and Enable"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  2FA Enabled Successfully!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Save these recovery codes in a secure place. You can use them
                  to log in if you lose access to your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2 bg-secondary/50 p-4 rounded-xl text-left">
                  {recoveryCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-xs text-foreground tracking-widest"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIs2FaModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
