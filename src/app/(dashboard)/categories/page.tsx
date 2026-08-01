"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Grid, Plus, Trash2, X, Loader2, Tag, Layers } from "lucide-react";
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from "../../../services/categoryApi";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"]),
  color: z.string().default("#6366F1"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});
  const [createCategoryApi, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategoryApi] = useDeleteCategoryMutation();

  const [isOpen, setIsOpen] = useState(false);
  const categories = categoriesData?.data || [];

  const incomeCategories = categories.filter((c: any) => c.type === "income");
  const expenseCategories = categories.filter((c: any) => c.type === "expense");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: "expense", color: "#6366F1" },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await createCategoryApi(data).unwrap();
      toast.success("Category created!");
      setIsOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategoryApi(id).unwrap();
      toast.success("Category deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Category Manager</h1>
          <p className="text-xs text-muted-foreground">Organize your income & expense classification hierarchy</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h2 className="text-base font-bold text-foreground">Expense Categories</h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{expenseCategories.length} Categories</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {expenseCategories.map((cat: any) => (
              <div
                key={cat._id}
                className="p-3 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: cat.color || "#EF4444" }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">{cat.name}</span>
                </div>
                {!cat.is_default && (
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="text-base font-bold text-foreground">Income Categories</h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{incomeCategories.length} Categories</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {incomeCategories.map((cat: any) => (
              <div
                key={cat._id}
                className="p-3 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: cat.color || "#10B981" }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">{cat.name}</span>
                </div>
                {!cat.is_default && (
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Add Custom Category</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category Name</label>
                <input
                  {...register("name")}
                  placeholder="e.g. Subscriptions, Groceries"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Type</label>
                <select
                  {...register("type")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
