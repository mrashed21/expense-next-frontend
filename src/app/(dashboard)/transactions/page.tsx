"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  Loader2,
  Calendar,
  Tag,
  MapPin,
  FileText,
} from "lucide-react";
import { useGetTransactionsQuery, useCreateTransactionMutation, useDeleteTransactionMutation } from "../../../services/transactionApi";
import { useGetAccountsQuery } from "../../../services/accountApi";
import { useGetCategoriesQuery } from "../../../services/categoryApi";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { toast } from "sonner";

const transactionSchema = z.object({
  account_id: z.string().min(1, "Select an account"),
  category_id: z.string().optional(),
  type: z.enum(["income", "expense", "refund", "adjustment", "opening_balance"]),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  reference_number: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("thisMonth");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: transactionsData, isLoading } = useGetTransactionsQuery({
    search,
    dateRange,
    type: typeFilter,
  });

  const { data: accountsData } = useGetAccountsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});

  const [createTransactionApi, { isLoading: isCreating }] = useCreateTransactionMutation();
  const [deleteTransactionApi] = useDeleteTransactionMutation();

  const transactions = transactionsData?.data || [];
  const accounts = accountsData?.data || [];
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
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
      toast.success("Transaction deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete transaction");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Transactions Log</h1>
          <p className="text-xs text-muted-foreground">Search, filter, and audit all recorded financial transactions</p>
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
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground font-medium outline-none"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground font-medium outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b border-border">
                <th className="p-4">Date</th>
                <th className="p-4">Description / Notes</th>
                <th className="p-4">Category</th>
                <th className="p-4">Account</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-secondary/30 transition-colors">
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
                        tx.type === "income" ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No transactions match your search or filter options.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Record New Transaction</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Type</label>
                  <select
                    {...register("type")}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Amount</label>
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
                <label className="text-xs font-semibold text-foreground">Account</label>
                <select
                  {...register("account_id")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">-- Select Account --</option>
                  {accounts.map((acc: any) => (
                    <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.current_balance)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  {...register("category_id")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name} ({cat.type})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Notes / Description</label>
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
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
