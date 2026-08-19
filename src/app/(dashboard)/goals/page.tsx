"use client";

import { CardSkeleton } from "@/components/custom/card-skeleton";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useDepositToGoalMutation,
  useGetGoalsQuery,
} from "@/services/goal-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Target, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const goalCategories = [
  "Savings Goal",
  "Emergency Fund",
  "Vacation",
  "Car",
  "House",
  "Laptop",
  "Custom Goal",
];

const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  category: z.string(),
  target_amount: z.number().positive("Target amount must be positive"),
  target_date: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: goalsData, isLoading } = useGetGoalsQuery({});
  const [createGoalApi, { isLoading: isCreating }] = useCreateGoalMutation();
  const [depositApi, { isLoading: isDepositing }] = useDepositToGoalMutation();
  const [deleteGoalApi] = useDeleteGoalMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const goals = goalsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: { category: "Savings Goal" },
  });

  const onSubmit = async (data: GoalFormValues) => {
    try {
      await createGoalApi(data).unwrap();
      toast.success("Goal created!");
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create goal");
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;
    try {
      await depositApi({
        id: depositGoalId,
        amount: Number(depositAmount),
      }).unwrap();
      toast.success("Funds added to goal!");
      setDepositGoalId(null);
      setDepositAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Deposit failed");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGoalApi(deleteId).unwrap();
      toast.success("Goal deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete goal");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Savings & Target Goals
          </h1>
          <p className="text-xs text-muted-foreground">
            Track financial milestones for emergency funds, vacations, car,
            house, or gadgets
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : goals.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              title="No Goals Set" 
              description="Start saving for your future by setting financial goals."
              actionLabel="New Goal"
              icon={<Target className="w-8 h-8" />}
              onAction={() => setIsAddOpen(true)}
            />
          </div>
        ) : (
          goals.map((g: any) => (
          <div
            key={g._id}
            className="glass-card p-5 rounded-3xl space-y-4 relative group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {g.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-semibold">
                    {g.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(g._id)}
                className="p-1 rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Saved: {formatCurrency(g.current_amount)}
                </span>
                <span className="text-foreground font-bold">
                  Target: {formatCurrency(g.target_amount)}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-indigo-500 transition-all duration-500"
                  style={{ width: `${g.percentage}%` }}
                />
              </div>
              <p className="text-[11px] font-semibold text-right text-primary">
                {g.percentage}% Achieved
              </p>
            </div>

            <button
              onClick={() => setDepositGoalId(g._id)}
              className="w-full py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary border border-border text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Funds / Deposit</span>
            </button>
            </div>
          ))
        )}
      </div>

      {/* Add Goal Modal */}
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
                Create Savings Goal
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
                  Goal Title
                </label>
                <input
                  {...register("title")}
                  placeholder="e.g. New Macbook Pro, Emergency Fund 2026"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Category"
                  name="category"
                  control={control}
                  options={goalCategories.map((c) => ({ label: c, value: c }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.category}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Target Amount
                </label>
                <input
                  {...register("target_amount", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50000"
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
                  "Save Goal"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Deposit Funds to Goal
              </h3>
              <button
                onClick={() => setDepositGoalId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isDepositing}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {isDepositing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Deposit"
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
        title="Delete Savings Goal"
        description="Are you sure you want to delete this financial goal?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
