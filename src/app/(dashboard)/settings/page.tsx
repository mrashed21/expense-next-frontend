"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logout } from "@/redux/slices/authSlice";
import { useLazyExportBackupQuery, useRestoreBackupMutation } from "@/services/dataApi";
import { useDeleteAccountMutation, useUpdateProfileMutation } from "@/services/userApi";
import {
  Download,
  Loader2,
  Monitor,
  Moon,
  ShieldAlert,
  Sun,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const { theme, setTheme } = useTheme();
  const [updateProfile] = useUpdateProfileMutation();
  const [deleteAccountApi, { isLoading: isDeleting }] =
    useDeleteAccountMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currency, setCurrency] = useState(user?.currency || "BDT");
  const [language, setLanguage] = useState("en");

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    try {
      await updateProfile({ theme: newTheme }).unwrap();
    } catch (err) {
      console.error("Failed to sync theme");
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    try {
      await updateProfile({ currency: newCurrency }).unwrap();
    } catch (err) {
      console.error("Failed to sync currency");
    }
  };

  const [exportBackup, { isFetching: isExporting }] = useLazyExportBackupQuery();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();

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

  const handleExportBackup = async () => {
    try {
      const response = await exportBackup({}).unwrap();
      const backupData = JSON.stringify(response.data, null, 2);
      const blob = new Blob([backupData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Expense Tracker_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Full data backup downloaded successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to export backup");
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await restoreBackup(json).unwrap();
        toast.success("Backup restored successfully!");
        window.location.reload();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to restore backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          System Preferences & Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage currency formats, app theme, data backups, and account
          termination
        </p>
      </div>

      {/* General Preferences */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
          Regional & Theme Setup
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Default Currency
            </label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-full h-10 py-5!">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                <SelectItem value="BDT">BDT (৳) - Bangladeshi Taka</SelectItem>
                <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Language
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full h-10 py-5!">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-foreground">
            Interface Appearance Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleThemeChange("light")}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs">Light Mode</span>
            </button>

            <button
              onClick={() => handleThemeChange("dark")}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs">Dark Mode</span>
            </button>

            <button
              onClick={() => handleThemeChange("system")}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-xs">System Match</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
          Data Backup & Export
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-foreground">
              Download Data Snapshot
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Export your complete financial records, accounts, and budgets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Download className="w-4 h-4 text-primary" />}
              <span>Export JSON</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50">
              {isRestoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreBackup}
                disabled={isRestoring}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-rose-500/30">
        <h2 className="text-base font-bold text-rose-500 border-b border-rose-500/20 pb-3">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">
              Delete Account Permanently
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Soft delete your account, archive all data, and terminate active
              subscriptions
            </p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-md bg-card border border-rose-500/40 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 id="modal-title" className="text-base font-bold text-rose-500 flex items-center gap-2">
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
              suspend your access and mark your records as deleted.
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
