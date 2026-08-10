"use client";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import FormDatePicker from "@/components/custom/form-date-picker";
import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import {
  useAddPaymentMutation,
  useCreateDebtMutation,
  useDeleteDebtMutation,
  useGetDebtsQuery,
  useUpdateDebtMutation,
} from "@/services/debt-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  HandCoins,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const debtTypes = [
  { label: "Lent (Money owed to you)", value: "lent" },
  { label: "Borrowed (Money you owe)", value: "borrowed" },
];

const debtSchema = z.object({
  person_name: z.string().min(1, "Person name is required"),
  type: z.string().min(1, "Debt type is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  interest_rate: z.coerce.number().min(0).optional().or(z.literal(0)),
  due_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type DebtFormValues = z.infer<typeof debtSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function DebtsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: debtsData, isLoading: debtsLoading } = useGetDebtsQuery({
    search: searchTerm,
  });

  const [createDebtApi, { isLoading: isCreating }] = useCreateDebtMutation();
  const [updateDebtApi, { isLoading: isUpdating }] = useUpdateDebtMutation();
  const [deleteDebtApi] = useDeleteDebtMutation();
  const [addPaymentApi, { isLoading: isPaying }] = useAddPaymentMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [paymentItem, setPaymentItem] = useState<any>(null);

  const debts = debtsData?.data || [];
  const metrics = debtsData?.meta?.metrics || {
    totalLent: 0,
    totalBorrowed: 0,
    netDebt: 0,
  };

  const {
    register: registerForm,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      amount: 0,
      person_name: "",
      type: "",
      interest_rate: 0,
      due_date: "",
      notes: "",
    },
  });

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    control: controlPayment,
    clearErrors: clearErrorsPayment,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, date: "", notes: "" },
  });

  const onAddSubmit = async (data: DebtFormValues) => {
    try {
      const payload = { ...data };
      if (payload.due_date) {
        payload.due_date = new Date(payload.due_date).toISOString();
      } else {
        delete payload.due_date;
      }

      await createDebtApi(payload).unwrap();
      toast.success("Debt recorded successfully!");
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create debt");
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    reset({
      person_name: item.person_name,
      type: item.type,
      amount: item.amount,
      interest_rate: item.interest_rate || 0,
      due_date: item.due_date
        ? new Date(item.due_date).toISOString().split("T")[0]
        : "",
      notes: item.notes || "",
    });
  };

  const onEditSubmit = async (data: DebtFormValues) => {
    if (!editItem) return;
    try {
      const payload = { ...data };
      if (payload.due_date) {
        payload.due_date = new Date(payload.due_date).toISOString();
      } else {
        delete payload.due_date;
      }
      await updateDebtApi({ id: editItem._id, data: payload }).unwrap();
      toast.success("Debt updated successfully!");
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update debt");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDebtApi(deleteId).unwrap();
      toast.success("Debt deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete debt.");
    } finally {
      setDeleteId(null);
    }
  };

  const openPayment = (item: any) => {
    setPaymentItem(item);
    resetPayment({
      amount: item.true_remaining_amount,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const onPaymentSubmit = async (data: PaymentFormValues) => {
    if (!paymentItem) return;
    try {
      const payload = { ...data };
      if (payload.date) {
        payload.date = new Date(payload.date).toISOString();
      } else {
        delete payload.date;
      }
      await addPaymentApi({ id: paymentItem._id, data: payload }).unwrap();
      toast.success("Payment logged successfully!");
      setPaymentItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to log payment");
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Debt Management</h1>
          <p className="text-xs text-muted-foreground">
            Track loans lent to others and money borrowed
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by person name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => {
              reset();
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Debt</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Money Lent (Owed to you)
          </p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {formatCurrency(metrics.totalLent)}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20">
          <p className="text-xs font-semibold text-destructive/80 uppercase tracking-wider">
            Money Borrowed (You owe)
          </p>
          <p className="text-2xl font-black text-destructive mt-1">
            {formatCurrency(metrics.totalBorrowed)}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Net Debt Status
          </p>
          <p
            className={`text-2xl font-black mt-1 ${metrics.netDebt >= 0 ? "text-emerald-500" : "text-destructive"}`}
          >
            {metrics.netDebt > 0 ? "+" : ""}
            {formatCurrency(metrics.netDebt)}
          </p>
        </div>
      </div>

      {/* Data Grid */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border">
        {/* ── Mobile Card View (< md) ── */}
        <div className="md:hidden divide-y divide-border">
          {debtsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : debts.length === 0 ? (
            <div className="px-6 py-12 text-center flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <HandCoins className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">No Debts Found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Record who owes you money or your outstanding loans.
              </p>
            </div>
          ) : debts.map((debt: any) => {
            const isPaid = debt.derived_status === "paid";
            const isLent = debt.type === "lent";
            return (
              <div key={debt._id} className="p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        isLent ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {debt.person_name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{debt.person_name}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className={`text-[10px] font-semibold uppercase ${
                          isLent ? "text-emerald-500" : "text-destructive"
                        }`}>
                          {debt.type}
                        </span>
                        {debt.due_date && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />{formatDate(debt.due_date)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {formatCurrency(debt.amount)}
                        </span>
                        {debt.interest_rate > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {debt.interest_rate}% interest
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          Remaining: {formatCurrency(debt.true_remaining_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : debt.derived_status === "partial" ? (
                      <span className="inline-flex px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase">
                        Partial
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-[10px] font-bold uppercase">
                        Pending
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {!isPaid && (
                        <button
                          onClick={() => openPayment(debt)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          title="Log Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(debt)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(debt._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop Table View (md+) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-md text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Principal</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Interest</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Owed/Remaining</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {debtsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <HandCoins className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No Debts Found</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Record who owes you money or your outstanding loans.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                debts.map((debt: any) => {
                  const isPaid = debt.derived_status === "paid";
                  const isLent = debt.type === "lent";
                  return (
                    <tr key={debt._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${isLent ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                            {debt.person_name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">{debt.person_name}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-semibold ${isLent ? "text-emerald-500" : "text-destructive"}`}>{debt.type}</span>
                              {debt.due_date && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />{formatDate(debt.due_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(debt.amount)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-foreground">{debt.interest_rate > 0 ? `${debt.interest_rate}%` : "-"}</p>
                        {debt.accrued_interest > 0 && (
                          <p className="text-[10px] text-muted-foreground">+{formatCurrency(debt.accrued_interest)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`font-bold ${isPaid ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {formatCurrency(debt.true_remaining_amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : debt.derived_status === "partial" ? (
                          <span className="inline-flex px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase">Partial</span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-[10px] font-bold uppercase">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!isPaid && (
                            <button onClick={() => openPayment(debt)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors" title="Log Payment">
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEdit(debt)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit Debt">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(debt._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete Debt">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Shared Add/Edit) */}
      {(isAddOpen || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-3 sticky top-0 bg-card z-10">
              <h3 className="text-base font-bold text-foreground">
                {editItem ? "Edit Debt" : "Add New Debt"}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditItem(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(editItem ? onEditSubmit : onAddSubmit)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Person or Entity Name
                </label>
                <input
                  {...registerForm("person_name")}
                  placeholder="e.g. John Doe, Bank of America"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {errors.person_name && (
                  <p className="text-[10px] text-destructive">
                    {errors.person_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Debt Type"
                  name="type"
                  control={control}
                  options={debtTypes}
                  searchable={false}
                  clearErrors={clearErrors}
                  error={errors.type}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Principal Amount
                  </label>
                  <input
                    {...registerForm("amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
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
                    Interest Rate (% APY)
                  </label>
                  <input
                    {...registerForm("interest_rate", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FormDatePicker
                  name="due_date"
                  control={control}
                  error={errors.due_date}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Notes (Optional)
                </label>
                <input
                  {...registerForm("notes")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isCreating || isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editItem ? (
                  "Update Debt"
                ) : (
                  "Save Debt"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            className="w-full max-w-sm bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Log Payment
              </h3>
              <button
                onClick={() => setPaymentItem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Recording payment for{" "}
              <span className="font-bold text-foreground">
                {paymentItem.person_name}
              </span>
              . Remaining balance:{" "}
              <span className="font-bold text-foreground">
                {formatCurrency(paymentItem.true_remaining_amount)}
              </span>
              .
            </div>

            <form
              onSubmit={handlePaymentSubmit(onPaymentSubmit)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Payment Amount
                </label>
                <input
                  {...registerPayment("amount", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  max={paymentItem.true_remaining_amount}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {paymentErrors.amount && (
                  <p className="text-[10px] text-destructive">
                    {paymentErrors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FormDatePicker
                  name="date"
                  control={controlPayment}
                  error={paymentErrors.date}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Notes (Optional)
                </label>
                <input
                  {...registerPayment("notes")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isPaying}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isPaying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Payment"
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
        title="Delete Debt Record"
        description="Are you sure you want to delete this debt/loan record?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
