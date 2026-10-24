"use client";

import FormDatePicker from "@/components/custom/form-date-picker";
import FormSelect from "@/components/custom/form-select";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/use-currency";
import { useGetAccountsQuery } from "@/services/account-api";
import {
  useCloseDpsFdrMutation,
  useCreateDpsFdrMutation,
  useGetDpsFdrQuery,
  usePayDpsMutation,
} from "@/services/dps-fdr-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  account_id: z.string().min(1, "Account is required"),
  principal_amount: z.coerce.number().positive("Amount must be positive"),
  monthly_installment: z.coerce.number().positive().optional(),
  interest_rate: z.coerce.number().min(0, "Rate cannot be negative"),
  start_date: z.string().min(1, "Start date is required"),
  maturity_date: z.string().min(1, "Maturity date is required"),
  notes: z.string().optional(),
});

type DepositValues = z.infer<typeof schema>;

export function DepositPage({ type }: { type: "dps" | "fdr" }) {
  const { formatCurrency } = useCurrency();
  const { data, isLoading } = useGetDpsFdrQuery({ type });
  const { data: accountsData } = useGetAccountsQuery({});
  const [create, { isLoading: creating }] = useCreateDpsFdrMutation();
  const [pay] = usePayDpsMutation();
  const [close] = useCloseDpsFdrMutation();
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<DepositValues>({
    resolver: zodResolver(schema),
    defaultValues: { start_date: "", maturity_date: "" },
  });

  const accounts = accountsData?.data || [];
  const deposits = data?.data || [];
  const onSubmit = async (values: DepositValues) => {
    if (type === "dps" && !values.monthly_installment) {
      toast.error("Monthly installment is required for DPS.");
      return;
    }
    try {
      await create({
        ...values,
        type,
        principal_amount: Number(values.principal_amount),
        monthly_installment:
          type === "dps" ? Number(values.monthly_installment) : undefined,
        interest_rate: Number(values.interest_rate),
      }).unwrap();
      toast.success(`${type.toUpperCase()} created successfully.`);
      reset({ start_date: "", maturity_date: "" });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to create ${type.toUpperCase()}.`);
    }
  };
  const runAction = async (action: typeof pay, id: string, message: string) => {
    try {
      await action(id).unwrap();
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{type.toUpperCase()} Management</h1>
          <p className="text-xs text-muted-foreground">
            Track {type === "dps" ? "monthly installments and maturity" : "principal, interest and maturity"}.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add {type.toUpperCase()}
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="mx-auto animate-spin" />
      ) : deposits.length === 0 ? (
        <p className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
          No {type.toUpperCase()} records yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deposits.map((item: any) => (
            <div key={item._id} className="space-y-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-bold">{item.name}</h2>
                  <p className="text-xs uppercase text-muted-foreground">{item.status}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(item.maturity_amount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Principal: {formatCurrency(item.principal_amount)}</span>
                <span>Rate: {item.interest_rate}%</span>
                <span>Paid: {formatCurrency(item.total_paid)}</span>
                <span>Maturity: {new Date(item.maturity_date).toLocaleDateString()}</span>
              </div>
              {item.status === "active" && (
                <button
                  onClick={() =>
                    type === "dps"
                      ? runAction(pay, item._id, "DPS installment paid.")
                      : runAction(close, item._id, "FDR closed and payout recorded.")
                  }
                  className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold"
                >
                  {type === "dps" ? "Pay Installment" : "Close FDR"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-2 rounded-2xl bg-card p-6">
            <h2 className="mb-3 text-lg font-bold">Add {type.toUpperCase()}</h2>
            <div>
              <label className="mb-1 block text-xs font-semibold">Name</label>
              <Input {...register("name")} placeholder={`${type.toUpperCase()} name`} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <FormSelect
              label="Linked Account"
              name="account_id"
              control={control}
              clearErrors={clearErrors}
              options={accounts.map((account: any) => ({
                value: account._id,
                label: `${account.name} (${formatCurrency(account.current_balance)})`,
              }))}
              error={errors.account_id}
              placeholder="Select account"
            />
            <div>
              <label className="mb-1 block text-xs font-semibold">Principal Amount</label>
              <Input {...register("principal_amount")} type="number" step="0.01" placeholder="0.00" />
              {errors.principal_amount && <p className="text-xs text-destructive">{errors.principal_amount.message}</p>}
            </div>
            {type === "dps" && (
              <div>
                <label className="mb-1 block text-xs font-semibold">Monthly Installment</label>
                <Input {...register("monthly_installment")} type="number" step="0.01" placeholder="0.00" />
                {errors.monthly_installment && <p className="text-xs text-destructive">{errors.monthly_installment.message}</p>}
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold">Interest Rate (%)</label>
              <Input {...register("interest_rate")} type="number" step="0.01" placeholder="0.00" />
              {errors.interest_rate && <p className="text-xs text-destructive">{errors.interest_rate.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormDatePicker label="Start Date" name="start_date" control={control} clearErrors={clearErrors} rules={{ required: true }} error={errors.start_date} />
              <FormDatePicker label="Maturity Date" name="maturity_date" control={control} clearErrors={clearErrors} rules={{ required: true }} error={errors.maturity_date} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Notes</label>
              <Input {...register("notes")} placeholder="Optional notes" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2 text-sm">Cancel</button>
              <button disabled={creating} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
                {creating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
