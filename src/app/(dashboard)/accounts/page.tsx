"use client";

import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import {
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useGetAccountsQuery,
  useUpdateAccountMutation,
} from "@/services/account-api";
import {
  useCreateTransferMutation,
  useGetTransfersQuery,
} from "@/services/transfer-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";

const accountTypes = [
  "Cash",
  "Wallet",
  "Bank",
  "Bkash",
  "Nagad",
  "Rocket",
  "Upay",
  "Visa Card",
  "Master Card",
  "PayPal",
  "Wise",
  "Crypto Wallet",
  "Custom",
];

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.string().min(1, "Account type is required"),
  opening_balance: z.coerce.number(),
  color: z.string(),
  description: z.string().optional(),
});

const transferSchema = z.object({
  from_account_id: z.string().min(1, "Select source account"),
  to_account_id: z.string().min(1, "Select destination account"),
  amount: z.coerce.number().positive("Amount must be positive"),
  fee: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;
type TransferFormValues = z.infer<typeof transferSchema>;

export default function AccountsPage() {
  const { formatCurrency } = useCurrency();
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const { data: accountsData, isLoading: accountsLoading } =
    useGetAccountsQuery({});
  const { data: transfersData } = useGetTransfersQuery({});
  const [createAccountApi, { isLoading: isCreatingAccount }] =
    useCreateAccountMutation();
  const [updateAccountApi, { isLoading: isUpdatingAccount }] =
    useUpdateAccountMutation();
  const [deleteAccountApi] = useDeleteAccountMutation();
  const [createTransferApi, { isLoading: isCreatingTransfer }] =
    useCreateTransferMutation();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);

  const accounts = accountsData?.data || [];
  const transfers = transfersData?.data || [];

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    reset: resetAccount,
    control: controlAccount,
    clearErrors: clearErrorsAccount,
    formState: { errors: accountErrors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { opening_balance: 0, color: "#4F46E5", name: "", type: "" },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    clearErrors: clearErrorsEdit,
    formState: { errors: editErrors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { opening_balance: 0, color: "#4F46E5", name: "", type: "" },
  });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    reset: resetTransfer,
    control: controlTransfer,
    clearErrors: clearErrorsTransfer,
    formState: { errors: transferErrors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_account_id: "",
      to_account_id: "",
      amount: 0,
      fee: 0,
      notes: "",
    },
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

  const openEditAccount = (acc: any) => {
    setEditAccount(acc);
    resetEdit({
      name: acc.name,
      type: acc.type,
      opening_balance: acc.opening_balance,
      color: acc.color || "#4F46E5",
      description: acc.description || "",
    });
  };

  const onEditAccountSubmit = async (data: AccountFormValues) => {
    if (!editAccount) return;
    try {
      await updateAccountApi({ id: editAccount._id, ...data }).unwrap();
      toast.success("Account updated successfully!");
      setEditAccount(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update account");
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

  const handleDeleteAccount = (id: string) => {
    setArchiveId(id);
  };

  const confirmArchive = async () => {
    if (!archiveId) return;
    try {
      await deleteAccountApi(archiveId).unwrap();
      toast.success("Account archived.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete account.");
    } finally {
      setArchiveId(null);
    }
  };

  const totalBalance = accounts.reduce(
    (sum: number, acc: any) => sum + (acc.current_balance || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Account Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your cash, bank accounts, digital wallets, and cards
          </p>
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

      {/* Total Balance Summary */}
      {accounts.length > 0 && (
        <div className="p-5 rounded-2xl bg-linear-to-r from-primary/10 to-indigo-500/10 border border-primary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Net Balance Across All Accounts
          </p>
          <p className="text-3xl font-black text-foreground mt-1">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {accounts.length} active account{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountsLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-muted-foreground">
            No accounts created yet. Click "Add Account" to get started.
          </div>
        ) : (
          accounts.map((acc: any) => (
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
                    <h3 className="text-sm font-bold text-foreground">
                      {acc.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-semibold uppercase text-muted-foreground">
                      {acc.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditAccount(acc)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Edit Account"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(acc._id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Archive Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Current Balance
                  </span>
                  <p className="text-xl font-black text-foreground">
                    {formatCurrency(acc.current_balance)}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Opening: {formatCurrency(acc.opening_balance)}
                </span>
              </div>

              {acc.description && (
                <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
                  {acc.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Money Transfer History Log */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Transfer History Log
        </h2>
        <div className="divide-y divide-border">
          {transfers.length > 0 ? (
            transfers.map((t: any) => (
              <div
                key={t._id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {t.from_account_id?.name || "Account"} →{" "}
                      {t.to_account_id?.name || "Account"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(t.date)} {t.notes ? `• ${t.notes}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(t.amount)}
                  </span>
                  {t.fee > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Fee: {formatCurrency(t.fee)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-xs text-muted-foreground">
              No balance transfers executed yet.
            </p>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 id="modal-title" className="text-base font-bold text-foreground">
                Create Financial Account
              </h3>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitAccount(onAddAccountSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Account Name
                </label>
                <input
                  {...registerAccount("name")}
                  placeholder="e.g. Main Bank Account, Bkash Personal"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {accountErrors.name && (
                  <p className="text-[10px] text-destructive">
                    {accountErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Account Type"
                  name="type"
                  control={controlAccount}
                  options={accountTypes.map((t) => ({ label: t, value: t }))}
                  searchable={true}
                  clearErrors={clearErrorsAccount}
                  error={accountErrors.type}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Opening Balance
                  </label>
                  <input
                    {...registerAccount("opening_balance", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Color
                  </label>
                  <input
                    {...registerAccount("color")}
                    type="color"
                    className="w-full h-9 px-1 py-1 rounded-xl bg-secondary border border-border cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Description (Optional)
                </label>
                <input
                  {...registerAccount("description")}
                  placeholder="e.g. Primary checking account"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingAccount}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingAccount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Account"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Edit Account
              </h3>
              <button
                onClick={() => setEditAccount(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEdit(onEditAccountSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Account Name
                </label>
                <input
                  {...registerEdit("name")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {editErrors.name && (
                  <p className="text-[10px] text-destructive">
                    {editErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Account Type"
                  name="type"
                  control={controlEdit}
                  options={accountTypes.map((t) => ({ label: t, value: t }))}
                  searchable={true}
                  clearErrors={clearErrorsEdit}
                  error={editErrors.type}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Opening Balance
                  </label>
                  <input
                    {...registerEdit("opening_balance", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Color
                  </label>
                  <input
                    {...registerEdit("color")}
                    type="color"
                    className="w-full h-9 px-1 py-1 rounded-xl bg-secondary border border-border cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Description (Optional)
                </label>
                <input
                  {...registerEdit("description")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingAccount}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdatingAccount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Account"
                )}
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
              <h3 className="text-base font-bold text-foreground">
                Execute Balance Transfer
              </h3>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitTransfer(onTransferSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <FormSelect
                  label="From Account (Source)"
                  name="from_account_id"
                  control={controlTransfer}
                  options={accounts.map((acc: any) => ({
                    label: `${acc.name} (${formatCurrency(acc.current_balance)})`,
                    value: acc._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrorsTransfer}
                  error={transferErrors.from_account_id}
                />
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="To Account (Destination)"
                  name="to_account_id"
                  control={controlTransfer}
                  options={accounts.map((acc: any) => ({
                    label: `${acc.name} (${formatCurrency(acc.current_balance)})`,
                    value: acc._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrorsTransfer}
                  error={transferErrors.to_account_id}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Transfer Amount
                  </label>
                  <input
                    {...registerTransfer("amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Fee (Optional)
                  </label>
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
                {isCreatingTransfer ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Transfer"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={confirmArchive}
        title="Archive Account"
        description="Are you sure you want to archive this financial account?"
        confirmText="Archive Account"
        variant="warning"
      />
    </div>
  );
}
