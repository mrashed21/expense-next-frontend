"use client";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import FormSelect from "@/components/custom/form-select";
import { RootState } from "@/redux/store";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/services/category-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"]),
  color: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});
  const [createCategoryApi, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategoryApi, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategoryApi] = useDeleteCategoryMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const categories = categoriesData?.data || [];

  const incomeCategories = categories.filter((c: any) => c.type === "income");
  const expenseCategories = categories.filter((c: any) => c.type === "expense");

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: "expense", color: "#6366F1" },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    clearErrors: clearErrorsEdit,
    formState: { errors: editErrors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
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

  const openEdit = (cat: any) => {
    setEditCategory(cat);
    resetEdit({
      name: cat.name,
      type: cat.type,
      color: cat.color || "#6366F1",
    });
  };

  const onEditSubmit = async (data: CategoryFormValues) => {
    if (!editCategory) return;
    try {
      await updateCategoryApi({ id: editCategory._id, ...data }).unwrap();
      toast.success("Category updated!");
      setEditCategory(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategoryApi(deleteId).unwrap();
      toast.success("Category deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    } finally {
      setDeleteId(null);
    }
  };

  const CategoryCard = ({ cat }: { cat: any }) => (
    <div className="p-3 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-2 truncate">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ backgroundColor: cat.color || "#6366F1" }}
        >
          {cat.name.charAt(0)}
        </div>
        <span className="text-xs font-semibold text-foreground truncate">
          {cat.name}
        </span>
        {cat.is_default && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold shrink-0">
            DEFAULT
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {(!cat.is_default || user?.isAdmin) && (
          <>
            <button
              onClick={() => openEdit(cat)}
              className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(cat._id)}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Category Manager
          </h1>
          <p className="text-xs text-muted-foreground">
            Organize your income & expense classification hierarchy
          </p>
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
              <h2 className="text-base font-bold text-foreground">
                Expense Categories
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {expenseCategories.length} Categories
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {expenseCategories.map((cat: any) => (
                <CategoryCard key={cat._id} cat={cat} />
              ))}
              {expenseCategories.length === 0 && (
                <p className="col-span-2 text-xs text-muted-foreground text-center py-4">
                  No expense categories yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Income Categories */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="text-base font-bold text-foreground">
                Income Categories
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {incomeCategories.length} Categories
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {incomeCategories.map((cat: any) => (
                <CategoryCard key={cat._id} cat={cat} />
              ))}
              {incomeCategories.length === 0 && (
                <p className="col-span-2 text-xs text-muted-foreground text-center py-4">
                  No income categories yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
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
                Add Custom Category
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
                <label className="text-xs font-semibold text-foreground">
                  Category Name
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. Subscriptions, Groceries"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {errors.name && (
                  <p className="text-[10px] text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FormSelect
                    label="Type"
                    name="type"
                    control={control}
                    options={[
                      { label: "Expense", value: "expense" },
                      { label: "Income", value: "income" },
                    ]}
                    searchable={false}
                    clearErrors={clearErrors}
                    error={errors.type}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Color
                  </label>
                  <input
                    {...register("color")}
                    type="color"
                    className="w-full h-9 px-1 py-1 rounded-xl bg-secondary border border-border cursor-pointer"
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
                  "Save Category"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCategory && (
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
                Edit Category
              </h3>
              <button
                onClick={() => setEditCategory(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEdit(onEditSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Category Name
                </label>
                <input
                  {...registerEdit("name")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {editErrors.name && (
                  <p className="text-[10px] text-destructive">
                    {editErrors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FormSelect
                    label="Type"
                    name="type"
                    control={controlEdit}
                    options={[
                      { label: "Expense", value: "expense" },
                      { label: "Income", value: "income" },
                    ]}
                    searchable={false}
                    clearErrors={clearErrorsEdit}
                    error={editErrors.type}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Color
                  </label>
                  <input
                    {...registerEdit("color")}
                    type="color"
                    className="w-full h-9 px-1 py-1 rounded-xl bg-secondary border border-border cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Category"
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
        title="Delete Category"
        description="Are you sure you want to delete this category? Existing transactions using this category will remain."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
