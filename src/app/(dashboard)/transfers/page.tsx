"use client";

import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import { useGetAccountsQuery } from "@/services/account-api";
import {
  useCreateTransferMutation,
  useGetTransfersQuery,
} from "@/services/transfer-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const transferSchema = z.object({
  from_account_id: z.string().min(1, "Select source account"),
  to_account_id: z.string().min(1, "Select destination account"),
  amount: z.number().positive("Amount must be positive"),
  fee: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransfersPage() {
  const { formatCurrency } = useCurrency();
  const { data: transfersData, isLoading } = useGetTransfersQuery({});
  const { data: accountsData } = useGetAccountsQuery({});
  const [createTransferApi, { isLoading: isCreating }] =
    useCreateTransferMutation();

  const [isOpen, setIsOpen] = useState(false);

  const transfers = transfersData?.data || [];
  const accounts = accountsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { fee: "" as any },
  });

  const onSubmit = async (data: TransferFormValues) => {
    try {
      await createTransferApi(data).unwrap();
      toast.success("Funds transferred successfully!");
      setIsOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Transfer failed");
    }
  };

  const totalTransferred = transfers.reduce(
    (sum: number, t: any) => sum + (t.amount || 0),
    0,
  );
  const totalFees = transfers.reduce(
    (sum: number, t: any) => sum + (t.fee || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Fund Transfers
          </h1>
          <p className="text-xs text-muted-foreground">
            Move money between your accounts with optional fee tracking
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Transfers
          </p>
          <p className="text-2xl font-black text-foreground">
            {transfers.length}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Transferred
          </p>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(totalTransferred)}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Fees Paid
          </p>
          <p className="text-2xl font-black text-rose-500">
            {formatCurrency(totalFees)}
          </p>
        </div>
      </div>

      {/* Transfers Log */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border shadow-xl">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            Transfer History
          </h2>
          <p className="text-xs text-muted-foreground">
            All internal balance movements between your accounts
          </p>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : transfers.length > 0 ? (
            transfers.map((t: any) => (
              <div
                key={t._id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {t.from_account_id?.name || "Account"} →{" "}
                      {t.to_account_id?.name || "Account"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(t.date)}
                      {t.notes ? ` • ${t.notes}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(t.amount)}
                  </p>
                  {t.fee > 0 && (
                    <p className="text-[10px] text-rose-500 font-semibold">
                      Fee: {formatCurrency(t.fee)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No transfers yet. Click "New Transfer" to move funds between
              accounts.
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 id="modal-title" className="text-base font-bold text-foreground">
                Execute Balance Transfer
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <FormSelect
                  label="From Account (Source)"
                  name="from_account_id"
                  control={control}
                  options={accounts.map((acc: any) => ({
                    label: `${acc.name} (${formatCurrency(acc.current_balance)})`,
                    value: acc._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.from_account_id}
                />
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="To Account (Destination)"
                  name="to_account_id"
                  control={control}
                  options={accounts.map((acc: any) => ({
                    label: `${acc.name} (${formatCurrency(acc.current_balance)})`,
                    value: acc._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.to_account_id}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Transfer Amount
                  </label>
                  <input
                    {...register("amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.amount && (
                    <p className="text-[10px] text-destructive">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Fee (Optional)
                  </label>
                  <input
                    {...register("fee", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Notes (Optional)
                </label>
                <input
                  {...register("notes")}
                  placeholder="e.g. Monthly savings transfer"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Transfer"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
