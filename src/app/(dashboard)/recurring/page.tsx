"use client";

import { CardSkeleton } from "@/components/custom/card-skeleton";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import {
  useDeleteRecurringMutation,
  useGetRecurringQuery,
  useToggleRecurringStatusMutation,
} from "@/services/recurring-api";
import {
  CalendarClock,
  Clock,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RecurringModal } from "./recurring-modal";

export default function RecurringPage() {
  const { formatCurrency } = useCurrency();
  const { data: recurringData, isLoading } = useGetRecurringQuery({});
  const [toggleStatus] = useToggleRecurringStatusMutation();
  const [deleteRecurring] = useDeleteRecurringMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const items = recurringData?.data || [];

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRecurring(deleteId).unwrap();
      toast.success("Automation deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-xl shadow-primary/20">
        <div>
          <h1 className="text-xl sm:text-xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="w-8 h-8" /> Automations
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Set it and forget it. Manage your recurring transactions and bills.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary font-bold text-sm sm:text-xs shadow-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-border">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <CardSkeleton count={3} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No Automations Found"
            description="Set up recurring transactions to automate your finances."
            actionLabel="New Automation"
            icon={<CalendarClock className="w-8 h-8" />}
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.status === "active"
                    ? "bg-card border-border shadow-sm hover:border-primary/50"
                    : "bg-secondary/30 border-dashed border-border opacity-70"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                      item.type === "income"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : item.type === "expense"
                          ? "bg-rose-500/10 text-rose-500"
                          : item.type === "bill"
                            ? "bg-purple-500/10 text-purple-500"
                            : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    <RefreshCw
                      className={`w-6 h-6 ${item.status === "active" ? "animate-spin-slow" : ""}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      {item.title}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                          item.status === "active"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.status}
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mt-1">
                      {item.frequency} {item.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-border pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 md:justify-end">
                      <Clock className="w-3.5 h-3.5" /> Next Run
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {formatDate(item.next_run_date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(item._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.status === "active"
                          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      }`}
                      title={item.status === "active" ? "Pause" : "Resume"}
                    >
                      {item.status === "active" ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Automation"
        description="Are you sure you want to delete this recurring automation? Future scheduled transactions will not be automatically generated."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
