"use client";

import FormSelect from "@/components/custom/form-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDate } from "@/lib/utils";
import { useGetAccountsQuery } from "@/services/accountApi";
import { useGetCategoriesQuery } from "@/services/categoryApi";
import { useGetSavedFiltersQuery, useCreateSavedFilterMutation } from "@/services/savedFilterApi";
import {
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
  useBulkDeleteTransactionsMutation,
  useRestoreTransactionMutation,
  useBulkRestoreTransactionsMutation,
  useCreateTransactionMutation,
  useBulkEditTransactionsMutation,
} from "@/services/transactionApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import { Bookmark, ChevronLeft, ChevronRight, Loader2, Plus, Save, Search, Trash2, X, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/custom/EmptyState";
import { TableSkeleton } from "@/components/custom/TableSkeleton";

const transactionSchema = z.object({
  account_id: z.string().min(1, "Select an account"),
  category_id: z.string().optional(),
  type: z.enum([
    "income",
    "expense",
    "refund",
    "adjustment",
    "opening_balance",
  ]),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  reference_number: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function TransactionsPage() {
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [dateRange, setDateRange] = useState("thisMonth");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilterId, setActiveFilterId] = useState<string>("none");

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, dateRange, typeFilter]);

  const { data: transactionsData, isLoading } = useGetTransactionsQuery({
    search: debouncedSearch,
    dateRange,
    type: typeFilter,
    page,
    limit: 20,
  });

  const { data: accountsData } = useGetAccountsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: savedFiltersData } = useGetSavedFiltersQuery("transaction");

  const [createTransactionApi, { isLoading: isCreating }] =
    useCreateTransactionMutation();
  const [deleteTransactionApi] = useDeleteTransactionMutation();
  const [bulkDeleteApi, { isLoading: isBulkDeleting }] = useBulkDeleteTransactionsMutation();
  const [bulkEditApi, { isLoading: isBulkEditing }] = useBulkEditTransactionsMutation();
  const [restoreApi] = useRestoreTransactionMutation();
  const [bulkRestoreApi] = useBulkRestoreTransactionsMutation();
  const [createSavedFilterApi] = useCreateSavedFilterMutation();

  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta;
  const accounts = accountsData?.data || [];
  const categories = categoriesData?.data || [];
  const savedFilters = savedFiltersData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "expense", payment_method: "Cash" },
  });

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await createTransactionApi(data).unwrap();
      toast.success("Transaction recorded successfully!");
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record transaction");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransactionApi(id).unwrap();
      
      toast.success("Transaction deleted.", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await restoreApi(id).unwrap();
              toast.success("Transaction restored.");
            } catch (err: any) {
              toast.error("Failed to restore transaction");
            }
          }
        },
        duration: 5000,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete transaction");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) return;
    try {
      await bulkDeleteApi(selectedIds).unwrap();
      const idsToRestore = [...selectedIds];
      setSelectedIds([]);
      
      toast.success(`${idsToRestore.length} transactions deleted.`, {
        action: {
          label: "Undo All",
          onClick: async () => {
            try {
              await bulkRestoreApi(idsToRestore).unwrap();
              toast.success("Transactions restored.");
            } catch (err: any) {
              toast.error("Failed to restore some transactions");
            }
          }
        },
        duration: 6000,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to bulk delete");
    }
  };

  const handleBulkEdit = async (data: any) => {
    try {
      await bulkEditApi({ ids: selectedIds, ...data }).unwrap();
      toast.success(`${selectedIds.length} transactions updated.`);
      setIsBulkEditOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to bulk edit");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t: any) => t._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSaveFilter = async () => {
    const name = prompt("Enter a name for this filter:");
    if (!name) return;
    try {
      await createSavedFilterApi({
        name,
        type: "transaction",
        filter_payload: { search, dateRange, typeFilter },
      }).unwrap();
      toast.success("Filter saved successfully!");
    } catch (err) {
      toast.error("Failed to save filter");
    }
  };

  const applySavedFilter = (filterId: string) => {
    setActiveFilterId(filterId);
    if (filterId === "none") {
      setSearch("");
      setDateRange("thisMonth");
      setTypeFilter("all");
      return;
    }
    const filter = savedFilters.find((f: any) => f._id === filterId);
    if (filter) {
      setSearch(filter.filter_payload.search || "");
      setDateRange(filter.filter_payload.dateRange || "thisMonth");
      setTypeFilter(filter.filter_payload.typeFilter || "all");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Transactions Log
          </h1>
          <p className="text-xs text-muted-foreground">
            Search, filter, and audit all recorded financial transactions
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Filter Control Panel */}
      <div className="glass-card p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, tags, ref #..."
            className="bg-transparent text-xs text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </div>

        {/* Date & Type Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-35 px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground font-medium outline-none">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-35 px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground font-medium outline-none">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expense">Expense Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Saved Filters Dropdown */}
          <Select value={activeFilterId} onValueChange={applySavedFilter}>
            <SelectTrigger className="w-35 px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground font-medium outline-none">
              <Bookmark className="w-3.5 h-3.5 mr-2 inline-block text-primary" />
              <SelectValue placeholder="Saved Filters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Filter</SelectItem>
              {savedFilters.map((f: any) => (
                <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button 
            onClick={handleSaveFilter}
            className="p-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 text-muted-foreground transition-colors"
            title="Save current filters"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border shadow-xl">
        {isLoading ? (
          <TableSkeleton columns={7} rows={10} />
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b border-border">
                <th scope="col" className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-border bg-background accent-primary"
                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th scope="col" className="p-4">Date</th>
                <th scope="col" className="p-4">Description / Notes</th>
                <th scope="col" className="p-4">Category</th>
                <th scope="col" className="p-4">Account</th>
                <th scope="col" className="p-4">Type</th>
                <th scope="col" className="p-4 text-right">Amount</th>
                <th scope="col" className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {transactions.map((tx: any) => (
                <tr
                  key={tx._id}
                    className={`transition-colors ${selectedIds.includes(tx._id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/30'}`}
                  >
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-border bg-background accent-primary"
                        checked={selectedIds.includes(tx._id)}
                        onChange={() => toggleSelect(tx._id)}
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground font-semibold">
                      {formatDate(tx.date)}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {tx.notes || tx.category_id?.name || "Transaction"}
                      {tx.reference_number && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          Ref: {tx.reference_number}
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-secondary border border-border font-semibold text-[11px] text-foreground">
                        {tx.category_id?.name || "General"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-foreground font-semibold">
                      {tx.account_id?.name || "Account"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`p-4 text-right whitespace-nowrap font-black text-sm ${
                        tx.type === "income"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        ) : (
          <EmptyState 
            title="No transactions found" 
            description="We couldn't find any transactions matching your current filters."
            icon={<Receipt className="w-8 h-8" />}
            actionLabel="Record Transaction"
            onAction={() => setIsAddOpen(true)}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPage > 1 && (
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm">
          <div className="text-xs text-muted-foreground font-medium">
            Showing page <span className="text-foreground font-bold">{meta.page}</span> of <span className="text-foreground font-bold">{meta.totalPage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
              disabled={meta.page >= meta.totalPage}
              className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <span className="text-sm font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
            {selectedIds.length} selected
          </span>
          <div className="w-px h-6 bg-border mx-2"></div>
          <button 
            onClick={() => setIsBulkEditOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary px-3 py-1.5 rounded-xl transition-colors"
          >
            Edit All
          </button>
          <button 
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete All
          </button>
          <button 
            onClick={() => setSelectedIds([])}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 id="modal-title" className="text-base font-bold text-foreground">
                Record New Transaction
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FormSelect
                    label="Type"
                    name="type"
                    control={control}
                    options={[
                      { label: "Expense", value: "expense" },
                      { label: "Income", value: "income" },
                      { label: "Refund", value: "refund" },
                    ]}
                    searchable={false}
                    clearErrors={clearErrors}
                    error={errors.type}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Amount
                  </label>
                  <input
                    {...register("amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Account"
                  name="account_id"
                  control={control}
                  options={accounts.map((acc: any) => ({
                    label: `${acc.name} (${formatCurrency(acc.current_balance)})`,
                    value: acc._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.account_id}
                />
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Category"
                  name="category_id"
                  control={control}
                  options={categories.map((cat: any) => ({
                    label: `${cat.name} (${cat.type})`,
                    value: cat._id,
                  }))}
                  searchable={true}
                  clearErrors={clearErrors}
                  error={errors.category_id}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Notes / Description
                </label>
                <input
                  {...register("notes")}
                  placeholder="e.g. Grocery shopping at Supermarket"
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
                  "Save Transaction"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="bulk-modal-title" className="w-full max-w-sm bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 id="bulk-modal-title" className="text-base font-bold text-foreground">
                Bulk Edit ({selectedIds.length} selected)
              </h3>
              <button
                onClick={() => setIsBulkEditOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const catId = formData.get("category_id") as string;
              if (!catId || catId === "none") return;
              handleBulkEdit({ category_id: catId });
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Update Category</label>
                <select 
                  name="category_id"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select a new category...</option>
                  {categories.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Note: Only category updating is supported in MVP for bulk operations.</p>
              
              <button
                type="submit"
                disabled={isBulkEditing}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 transition-colors flex justify-center"
              >
                {isBulkEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
