"use client";

import { CardSkeleton } from "@/components/custom/card-skeleton";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import {
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetsQuery,
} from "@/services/budget-api";
import { useGetCategoriesQuery } from "@/services/category-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const budgetSchema = z.object({
  category_id: z.string().min(1, "Select a category"),
  amount: z.coerce.number().positive("Amount must be positive"),
  warning_threshold: z.coerce.number(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: budgetsData, isLoading } = useGetBudgetsQuery(undefined);
  const { data: categoriesData } = useGetCategoriesQuery({});
  const [createBudgetApi, { isLoading: isCreating }] =
    useCreateBudgetMutation();
  const [deleteBudgetApi] = useDeleteBudgetMutation();

  const [isOpen, setIsOpen] = useState(false);
  const budgets = budgetsData?.data || [];
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { warning_threshold: 80, amount: "" as any },
  });

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      await createBudgetApi(data).unwrap();
      toast.success("Budget rule set successfully!");
      setIsOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to set budget");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBudgetApi(deleteId).unwrap();
      toast.success("Budget rule removed.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete budget");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Monthly Category Budgets
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor expenditure limits with automated warning thresholds
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : budgets.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="No Budgets Set"
              description="Set monthly category budgets to keep your expenditure in check."
              actionLabel="Set Budget"
              icon={<AlertTriangle className="w-8 h-8" />}
              onAction={() => setIsOpen(true)}
            />
          </div>
        ) : (
          <>
            {budgets.map((b: any) => {
              const isWarning = b.percentage >= b.warning_threshold;
              const isOver = b.percentage >= 100;

              return (
                <div
                  key={b._id}
                  className="glass-card p-5 rounded-3xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{
                          backgroundColor: b.category_id?.color || "#4F46E5",
                        }}
                      >
                        {b.category_id?.name?.charAt(0) || "B"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {b.category_id?.name || "Category"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Limit: {formatCurrency(b.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Exceeded (100%)
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-amber/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Warning (
                          {b.percentage}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> On Track
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        Spent: {formatCurrency(b.spent_amount)}
                      </span>
                      <span className="text-foreground">
                        Remaining: {formatCurrency(b.remaining_amount)}
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? "bg-rose-500"
                            : isWarning
                              ? "bg-amber-500"
                              : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
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
                Configure Category Budget
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
                  label="Target Category"
                  name="category_id"
                  control={control}
                  options={categories.map((c: any) => ({
                    label: `${c.name} (${c.type})`,
                    value: c._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.category_id}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Monthly Budget Limit
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
                <FormSelect
                  label="Alert Warning Threshold"
                  name="warning_threshold"
                  control={control}
                  options={[
                    { label: "50% of budget limit", value: "50" },
                    { label: "75% of budget limit", value: "75" },
                    { label: "80% of budget limit", value: "80" },
                    { label: "90% of budget limit", value: "90" },
                    { label: "100% (Strict Max)", value: "100" },
                  ]}
                  searchable={false}
                  clearErrors={clearErrors}
                  error={errors.warning_threshold as any} // Ensure any error is displayed
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
                  "Save Budget"
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
        title="Delete Budget Rule"
        description="Are you sure you want to delete this category budget limit?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
