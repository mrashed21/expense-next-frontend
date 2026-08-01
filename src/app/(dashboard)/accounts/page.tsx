"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  DollarSign,
  CreditCard,
  Building2,
  Smartphone,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useGetAccountsQuery, useCreateAccountMutation, useDeleteAccountMutation } from "../../../services/accountApi";
import { useGetTransfersQuery, useCreateTransferMutation } from "../../../services/transferApi";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { toast } from "sonner";

const accountTypes = [
  "Cash", "Wallet", "Bank", "Bkash", "Nagad", "Rocket", "Upay",
  "Visa Card", "Master Card", "PayPal", "Wise", "Crypto Wallet", "Custom"
];

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.string().min(1, "Account type is required"),
  opening_balance: z.number().default(0),
  color: z.string().default("#4F46E5"),
  description: z.string().optional(),
});

const transferSchema = z.object({
  from_account_id: z.string().min(1, "Select source account"),
  to_account_id: z.string().min(1, "Select destination account"),
  amount: z.number().positive("Amount must be positive"),
  fee: z.number().min(0).default(0),
  notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;
type TransferFormValues = z.infer<typeof transferSchema>;

export default function AccountsPage() {
  const { data: accountsData, isLoading: accountsLoading } = useGetAccountsQuery({});
  const { data: transfersData } = useGetTransfersQuery({});
  const [createAccountApi, { isLoading: isCreatingAccount }] = useCreateAccountMutation();
  const [deleteAccountApi] = useDeleteAccountMutation();
  const [createTransferApi, { isLoading: isCreatingTransfer }] = useCreateTransferMutation();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const accounts = accountsData?.data || [];
  const transfers = transfersData?.data || [];

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    reset: resetAccount,
    formState: { errors: accountErrors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { opening_balance: 0, color: "#4F46E5" },
  });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    reset: resetTransfer,
    formState: { errors: transferErrors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fee: 0 },
  });

  const onAddAccountSubmit = async (data: AccountFormValues) => {
    try {
      await createAccountApi(data).unwrap();
      toast.success("Account created successfully!");
      setIsAddAccountOpen(false);
      resetAccount();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create account");
    }
  };

  const onTransferSubmit = async (data: TransferFormValues) => {
    try {
      await createTransferApi(data).unwrap();
      toast.success("Funds transferred successfully!");
      setIsTransferOpen(false);
      resetTransfer();
    } catch (err: any) {
      toast.error(err?.data?.message || "Transfer failed");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to archive this account?")) return;
    try {
      await deleteAccountApi(id).unwrap();
      toast.success("Account archived.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete account.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Account Management</h1>
          <p className="text-xs text-muted-foreground">Manage your cash, bank accounts, digital wallets, and cards</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            <span>Transfer Money</span>
          </button>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc: any) => (
          <div
            key={acc._id}
            className="glass-card p-5 rounded-3xl space-y-3 relative group overflow-hidden border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: acc.color || "#4F46E5" }}
                >
                  {acc.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{acc.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-semibold uppercase text-muted-foreground">
                    {acc.type}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteAccount(acc._id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Archive Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-border flex items-end justify-between">
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Current Balance</span>
                <p className="text-xl font-black text-foreground">{formatCurrency(acc.current_balance)}</p>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Opening: {formatCurrency(acc.opening_balance)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Money Transfer History Log */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-foreground">Transfer History Log</h2>
        <div className="divide-y divide-border">
          {transfers.length > 0 ? (
            transfers.map((t: any) => (
              <div key={t._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {t.from_account_id?.name || "Account"} → {t.to_account_id?.name || "Account"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(t.date)} {t.notes ? `• ${t.notes}` : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">{formatCurrency(t.amount)}</span>
                  {t.fee > 0 && <p className="text-[10px] text-muted-foreground">Fee: {formatCurrency(t.fee)}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-xs text-muted-foreground">No balance transfers executed yet.</p>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create Financial Account</h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccount(onAddAccountSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Account Name</label>
                <input
                  {...registerAccount("name")}
                  placeholder="e.g. Main Bank Account, Bkash Personal"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Account Type</label>
                <select
                  {...registerAccount("type")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  {accountTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Opening Balance</label>
                <input
                  {...registerAccount("opening_balance", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingAccount}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Money Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Execute Balance Transfer</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer(onTransferSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">From Account (Source)</label>
                <select
                  {...registerTransfer("from_account_id")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">-- Select Source Account --</option>
                  {accounts.map((acc: any) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} ({formatCurrency(acc.current_balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">To Account (Destination)</label>
                <select
                  {...registerTransfer("to_account_id")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">-- Select Destination Account --</option>
                  {accounts.map((acc: any) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} ({formatCurrency(acc.current_balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Transfer Amount</label>
                  <input
                    {...registerTransfer("amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Fee (Optional)</label>
                  <input
                    {...registerTransfer("fee", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingTransfer}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingTransfer ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
