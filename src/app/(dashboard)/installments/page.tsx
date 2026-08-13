"use client";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import FormDatePicker from "@/components/custom/form-date-picker";
import FormSelect from "@/components/custom/form-select";
import { TableSkeleton } from "@/components/custom/table-skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import { useGetAccountsQuery } from "@/services/account-api";
import {
  useAddInstallmentPaymentMutation,
  useCreateInstallmentMutation,
  useDeleteInstallmentMutation,
  useGetInstallmentsQuery,
  useUpdateInstallmentMutation,
} from "@/services/installment-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
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

const installmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  account_id: z.string().min(1, "Account is required"),
  total_amount: z.coerce
    .number()
    .min(0.01, "Total amount must be greater than zero"),
  total_months: z.coerce.number().min(1, "Must have at least 1 month"),
  start_date: z.string().min(1, "Start date is required"),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type InstallmentFormValues = z.infer<typeof installmentSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function InstallmentsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: installmentsData, isLoading: installmentsLoading } =
    useGetInstallmentsQuery({
      search: searchTerm,
      status: statusFilter,
    });
  const { data: accountsData } = useGetAccountsQuery({});

  const [createInstallmentApi, { isLoading: isCreating }] =
    useCreateInstallmentMutation();
  const [updateInstallmentApi, { isLoading: isUpdating }] =
    useUpdateInstallmentMutation();
  const [deleteInstallmentApi] = useDeleteInstallmentMutation();
  const [addPaymentApi, { isLoading: isPaying }] =
    useAddInstallmentPaymentMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [paymentItem, setPaymentItem] = useState<any>(null);

  const installments = installmentsData?.data || [];
  const metrics = installmentsData?.meta?.metrics || {
    totalMonthlyBurden: 0,
    totalOutstanding: 0,
    activeCount: 0,
    completedCount: 0,
  };

  const accountOptions = (accountsData?.data || []).map((acc: any) => ({
    label: acc.name,
    value: acc._id,
  }));

  const {
    register: registerForm,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<InstallmentFormValues>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      total_amount: 0,
      total_months: 1,
      title: "",
      account_id: "",
      start_date: "",
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

  const onAddSubmit = async (data: InstallmentFormValues) => {
    try {
      const payload = { ...data };
      payload.start_date = new Date(payload.start_date).toISOString();

      await createInstallmentApi(payload).unwrap();
      toast.success("EMI recorded successfully!");
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create EMI");
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    reset({
      title: item.title,
      account_id: item.account_id?._id || item.account_id,
      total_amount: item.total_amount,
      total_months: item.total_months,
      start_date: new Date(item.start_date).toISOString().split("T")[0],
      notes: item.notes || "",
    });
  };

  const onEditSubmit = async (data: InstallmentFormValues) => {
    if (!editItem) return;
    try {
      const payload = { ...data };
      payload.start_date = new Date(payload.start_date).toISOString();

      await updateInstallmentApi({ id: editItem._id, data: payload }).unwrap();
      toast.success("EMI updated successfully!");
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update EMI");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInstallmentApi(deleteId).unwrap();
      toast.success("EMI deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete EMI.");
    } finally {
      setDeleteId(null);
    }
  };

  const openPayment = (item: any) => {
    setPaymentItem(item);
    const suggestedPayment = Math.min(
      item.monthly_amount,
      item.remaining_amount,
    );
    resetPayment({
      amount: Number(suggestedPayment.toFixed(2)),
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
      toast.success("EMI Payment logged successfully!");
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
          <h1 className="text-xl font-bold tracking-tight">
            Installment (EMI) Tracker
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor and manage your recurring monthly loan payments
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search EMI title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex rounded-xl overflow-hidden border border-border text-xs font-medium">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 transition-colors ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary text-muted-foreground"}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-2 transition-colors border-l border-border ${statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary text-muted-foreground"}`}
            >
              Active
            </button>
          </div>

          <button
            onClick={() => {
              reset();
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New EMI</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Monthly Burden
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {formatCurrency(metrics.totalMonthlyBurden)}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Outstanding
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {formatCurrency(metrics.totalOutstanding)}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
            Active EMIs
          </p>
          <p className="text-2xl font-black text-blue-500 mt-1">
            {metrics.activeCount}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            Completed EMIs
          </p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {metrics.completedCount}
          </p>
        </div>
      </div>

      {/* Data Grid */}
      {installmentsLoading ? (
        <TableSkeleton columns={7} rows={5} />
      ) : installments.length === 0 ? (
        <EmptyState 
          title="No EMIs Found"
          description="Start tracking your car loan, mortgage, or device installments."
          actionLabel="Add EMI"
          icon={<Calendar className="w-8 h-8" />}
          onAction={() => {
            reset();
            setIsAddOpen(true);
          }}
        />
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-border">
          {/* ── Mobile Card View (< md) ── */}
          <div className="md:hidden divide-y divide-border">
            {installments.filter((inst: any) =>
              statusFilter === "all" ? true : !inst.is_completed
            ).filter((inst: any) =>
              inst.title.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((inst: any) => {
            const progressPercent = Math.min(100, Math.max(0, (inst.months_paid / inst.total_months) * 100));
            return (
              <div key={inst._id} className={`p-4 hover:bg-secondary/20 transition-colors ${inst.is_completed ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                      {inst.title.substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-sm truncate">{inst.title}</p>
                      <p className="text-[10px] text-muted-foreground">{inst.account_id?.name || "Unknown"} &middot; Ends {formatDate(inst.end_date)}</p>
                      {/* Progress bar */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-primary">{inst.months_paid} <span className="text-muted-foreground font-normal">paid</span></span>
                          <span className="text-muted-foreground">{inst.total_months} total</span>
                        </div>
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${inst.is_completed ? "bg-emerald-500" : "bg-primary"}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{formatCurrency(inst.monthly_amount)}/mo</span>
                        <span className="text-[10px] text-muted-foreground">Remaining: {formatCurrency(inst.remaining_amount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {inst.is_completed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Cleared
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase">Active</span>
                    )}
                    <div className="flex items-center gap-1">
                      {!inst.is_completed && (
                        <button onClick={() => openPayment(inst)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors" title="Log EMI Payment">
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => openEdit(inst)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(inst._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop Table (md+) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-md text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">EMI Details</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Progress</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Monthly EMI</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Remaining</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {installments.map((inst: any) => {
                  const progressPercent = Math.min(100, Math.max(0, (inst.months_paid / inst.total_months) * 100));
                  return (
                    <tr key={inst._id} className={`hover:bg-secondary/30 transition-colors ${inst.is_completed ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-sm">
                            {inst.title.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">{inst.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground truncate w-24">{inst.account_id?.name || "Unknown"}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" /> Ends {formatDate(inst.end_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-end w-32 ml-auto gap-1.5">
                          <div className="flex items-center justify-between w-full text-[10px] font-bold">
                            <span className="text-primary">{inst.months_paid} <span className="text-muted-foreground font-normal">paid</span></span>
                            <span className="text-muted-foreground">{inst.total_months} <span className="font-normal">total</span></span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${inst.is_completed ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${progressPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(inst.monthly_amount)}</p>
                        <p className="text-[10px] text-muted-foreground">per month</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-foreground">{formatCurrency(inst.remaining_amount)}</p>
                        <p className="text-[10px] text-muted-foreground">of {formatCurrency(inst.total_amount)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inst.is_completed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!inst.is_completed && (
                            <button onClick={() => openPayment(inst)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors" title="Log EMI Payment">
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEdit(inst)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit EMI">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(inst._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete EMI">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        </div>
      )}


      {/* Form Modal (Shared Add/Edit) */}
      {(isAddOpen || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-3 sticky top-0 bg-card z-10">
              <h3 className="text-base font-bold text-foreground">
                {editItem ? "Edit EMI" : "Setup New EMI"}
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
                  EMI Title
                </label>
                <input
                  {...registerForm("title")}
                  placeholder="e.g. Car Loan, iPhone Installment"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {errors.title && (
                  <p className="text-[10px] text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Deduct From Account"
                  name="account_id"
                  control={control}
                  options={accountOptions}
                  searchable={false}
                  clearErrors={clearErrors}
                  error={errors.account_id}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Total Loan Amount
                  </label>
                  <input
                    {...registerForm("total_amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.total_amount && (
                    <p className="text-[10px] text-destructive">
                      {errors.total_amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Duration (Months)
                  </label>
                  <input
                    {...registerForm("total_months", { valueAsNumber: true })}
                    type="number"
                    step="1"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.total_months && (
                    <p className="text-[10px] text-destructive">
                      {errors.total_months.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <FormDatePicker
                  name="start_date"
                  control={control}
                  error={errors.start_date}
                />
                {errors.start_date && (
                  <p className="text-[10px] text-destructive">
                    {errors.start_date.message}
                  </p>
                )}
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

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span> The
                system will automatically calculate the Monthly Payment (
                {editItem ? "recalculated on save" : "Total ÷ Months"}) and
                determine the End Date based on your inputs.
              </div>

              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isCreating || isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editItem ? (
                  "Update EMI Schedule"
                ) : (
                  "Create EMI Schedule"
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
                Log EMI Payment
              </h3>
              <button
                onClick={() => setPaymentItem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">EMI Target:</span>
                <span className="font-bold text-foreground">
                  {paymentItem.title}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Required EMI:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(paymentItem.monthly_amount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Outstanding:</span>
                <span className="font-bold text-destructive">
                  {formatCurrency(paymentItem.remaining_amount)}
                </span>
              </div>
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
                  max={paymentItem.remaining_amount}
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
        title="Delete Installment Plan"
        description="Are you sure you want to delete this EMI installment plan?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
