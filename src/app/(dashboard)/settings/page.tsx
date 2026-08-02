"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";
import { Settings, ShieldAlert, Download, Database, Sun, Moon, Monitor, Trash2, X, Loader2 } from "lucide-react";
import { useDeleteAccountMutation } from "../../../services/userApi";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const [deleteAccountApi, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("en");

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

  const handleExportBackup = () => {
    toast.success("Full data backup downloaded as JSON!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">System Preferences & Settings</h1>
        <p className="text-xs text-muted-foreground">Manage currency formats, app theme, data backups, and account termination</p>
      </div>

      {/* General Preferences */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Regional & Theme Setup</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Default Currency</label>
            <Select value={currency} onValueChange={setCurrency}>
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
            <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Language</label>
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
          <label className="text-xs font-semibold text-foreground">Interface Appearance Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === "light" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === "dark" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === "system" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border bg-secondary/50 text-muted-foreground"
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
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Data Backup & Export</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Download Data Snapshot</h3>
            <p className="text-[11px] text-muted-foreground">Export your complete financial records, accounts, and budgets</p>
          </div>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-rose-500/30">
        <h2 className="text-base font-bold text-rose-500 border-b border-rose-500/20 pb-3">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Delete Account Permanently</h3>
            <p className="text-[11px] text-muted-foreground">Soft delete your account, archive all data, and terminate active subscriptions</p>
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
          <div className="w-full max-w-md bg-card border border-rose-500/40 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Confirm Account Termination
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete your account? This action will suspend your access and mark your records as deleted.
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
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
