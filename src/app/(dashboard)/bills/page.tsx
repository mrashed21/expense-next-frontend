"use client";

import { CardSkeleton } from "@/components/custom/card-skeleton";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import FormDatePicker from "@/components/custom/form-date-picker";
import FormSelect from "@/components/custom/form-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import { useGetAccountsQuery } from "@/services/account-api";
import {
  useCreateBillMutation,
  useDeleteBillMutation,
  useGetBillsQuery,
  usePayBillMutation,
} from "@/services/bill-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  CreditCard,
  FileCheck,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const billTypes = [
  "Electricity",
  "Internet",
  "Gas",
  "Water",
  "Rent",
  "Credit Card",
  "EMI",
  "Subscriptions",
];

const billSchema = z.object({
  title: z.string().min(1, "Bill title is required"),
  type: z.string(),
  amount: z.coerce.number().positive("Amount must be positive"),
  due_date: z.string().min(1, "Due date is required"),
});

type BillFormValues = z.infer<typeof billSchema>;

export default function BillsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: billsData, isLoading } = useGetBillsQuery({});
  const { data: accountsData } = useGetAccountsQuery({});
  const [createBillApi, { isLoading: isCreating }] = useCreateBillMutation();
  const [payBillApi, { isLoading: isPaying }] = usePayBillMutation();
  const [deleteBillApi] = useDeleteBillMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [payBillId, setPayBillId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const bills = billsData?.data || [];
  const accounts = accountsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: { type: "Electricity", amount: "" as any },
  });

  const onSubmit = async (data: BillFormValues) => {
    try {
      await createBillApi(data).unwrap();
      toast.success("Bill reminder added!");
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add bill");
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBillId || !selectedAccountId) return;
    try {
      await payBillApi({
        id: payBillId,
        account_id: selectedAccountId,
      }).unwrap();
      toast.success("Bill paid and recorded as expense transaction!");
      setPayBillId(null);
      setSelectedAccountId("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Payment failed");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBillApi(deleteId).unwrap();
      toast.success("Bill deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete bill");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Bills & Subscriptions Tracker
          </h1>
          <p className="text-xs text-muted-foreground">
            Keep track of utility bills, EMIs, and monthly recurring
            subscriptions
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span>Add Bill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <CardSkeleton count={6} />
        ) : bills.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="No Bills Found"
              description="Keep track of your utility bills, EMIs, and monthly recurring subscriptions."
              actionLabel="Add Bill"
              icon={<FileCheck className="w-8 h-8" />}
              onAction={() => setIsAddOpen(true)}
            />
          </div>
        ) : (
          bills.map((b: any) => {
            const isPaid = b.status === "paid";

            return (
              <div
                key={b._id}
                className="glass-card p-5 rounded-3xl space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isPaid
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {b.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-semibold">
                        {b.type}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Due Date
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {formatDate(b.due_date)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Amount
                    </span>
                    <p className="text-base font-black text-foreground">
                      {formatCurrency(b.amount)}
                    </p>
                  </div>
                </div>

                {isPaid ? (
                  <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Paid & Settled</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setPayBillId(b._id)}
                    className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Now</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Bill Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3
                id="modal-title"
                className="text-base font-bold text-foreground"
              >
                Add Bill Reminder
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Bill Title
                </label>
                <input
                  {...register("title")}
                  placeholder="e.g. WiFi Fiber Internet, Electricity Bill"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Type"
                  name="type"
                  control={control}
                  options={billTypes.map((t) => ({ label: t, value: t }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.type}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Amount
                  </label>
                  <input
                    {...register("amount", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <FormDatePicker
                    name="due_date"
                    control={control}
                    error={errors.due_date}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Bill"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {payBillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Select Payment Account
              </h3>
              <button
                onClick={() => setPayBillId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Pay From Account
                </label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger className="w-full h-10 py-5!">
                    <SelectValue placeholder="-- Choose Account --" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a: any) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name} ({formatCurrency(a.current_balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type="submit"
                disabled={isPaying || !selectedAccountId}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPaying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Bill Payment"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Bill Reminder"
        description="Are you sure you want to delete this upcoming bill reminder?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
