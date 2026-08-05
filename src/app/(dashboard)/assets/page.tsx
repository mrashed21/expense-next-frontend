"use client";

import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import {
  useCreateAssetMutation,
  useDeleteAssetMutation,
  useGetAssetsQuery,
  useUpdateAssetMutation,
} from "@/services/asset-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Loader2, Pencil, Plus, Trash2, X, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";

const assetTypes = [
  { label: "Real Estate", value: "real_estate" },
  { label: "Vehicle", value: "vehicle" },
  { label: "Valuable", value: "valuable" },
  { label: "Other", value: "other" },
];

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  type: z.string().min(1, "Asset type is required"),
  value: z.coerce.number().min(0, "Value cannot be negative"),
  purchase_price: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchase_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function AssetsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: assetsData, isLoading: assetsLoading } = useGetAssetsQuery({
    search: searchTerm,
  });
  
  const [createAssetApi, { isLoading: isCreatingAsset }] = useCreateAssetMutation();
  const [updateAssetApi, { isLoading: isUpdatingAsset }] = useUpdateAssetMutation();
  const [deleteAssetApi] = useDeleteAssetMutation();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<any>(null);

  const assets = assetsData?.data || [];

  const {
    register: registerAsset,
    handleSubmit: handleSubmitAsset,
    reset: resetAsset,
    control: controlAsset,
    clearErrors: clearErrorsAsset,
    formState: { errors: assetErrors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: { value: 0, name: "", type: "", purchase_price: 0, purchase_date: "", notes: "" },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    clearErrors: clearErrorsEdit,
    formState: { errors: editErrors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: { value: 0, name: "", type: "", purchase_price: 0, purchase_date: "", notes: "" },
  });

  const onAddAssetSubmit = async (data: AssetFormValues) => {
    try {
      const payload = { ...data };
      if (payload.purchase_date) {
        payload.purchase_date = new Date(payload.purchase_date).toISOString();
      } else {
        delete payload.purchase_date;
      }
      
      await createAssetApi(payload).unwrap();
      toast.success("Asset recorded successfully!");
      setIsAddAssetOpen(false);
      resetAsset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create asset");
    }
  };

  const openEditAsset = (asset: any) => {
    setEditAsset(asset);
    resetEdit({
      name: asset.name,
      type: asset.type,
      value: asset.value,
      purchase_price: asset.purchase_price || 0,
      purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toISOString().split('T')[0] : "",
      notes: asset.notes || "",
    });
  };

  const onEditAssetSubmit = async (data: AssetFormValues) => {
    if (!editAsset) return;
    try {
      const payload = { ...data };
      if (payload.purchase_date) {
        payload.purchase_date = new Date(payload.purchase_date).toISOString();
      } else {
        delete payload.purchase_date;
      }
      await updateAssetApi({ id: editAsset._id, data: payload }).unwrap();
      toast.success("Asset updated successfully!");
      setEditAsset(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update asset");
    }
  };

  const handleDeleteAsset = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAssetApi(deleteId).unwrap();
      toast.success("Asset deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete asset.");
    } finally {
      setDeleteId(null);
    }
  };

  const totalValue = assets.reduce(
    (sum: number, asset: any) => sum + (asset.value || 0),
    0,
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Asset Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Track real estate, vehicles, and valuables for your net worth
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setIsAddAssetOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Asset</span>
          </button>
        </div>
      </div>

      {/* Total Value Summary */}
      {assets.length > 0 && (
        <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Asset Portfolio Value
          </p>
          <p className="text-3xl font-black text-foreground mt-1">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {assets.length} tracked asset{assets.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetsLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : assets.length === 0 ? (
          <div className="col-span-full glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No Assets Found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {searchTerm ? "No assets match your search criteria." : "Start tracking your physical assets and valuables here."}
              </p>
            </div>
          </div>
        ) : (
          assets.map((asset: any) => (
            <div
              key={asset._id}
              className="glass-card p-5 rounded-3xl space-y-3 relative group overflow-hidden border border-border hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500 text-white font-bold text-lg shadow-md"
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">
                      {asset.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-semibold uppercase text-muted-foreground">
                      {asset.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditAsset(asset)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    title="Edit Asset"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(asset._id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Current Value
                  </span>
                  <p className="text-xl font-black text-foreground">
                    {formatCurrency(asset.value)}
                  </p>
                </div>
                {asset.purchase_price > 0 && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Purchased: {formatCurrency(asset.purchase_price)}
                  </span>
                )}
              </div>

              {asset.notes && (
                <p className="text-[10px] text-muted-foreground border-t border-border pt-2 line-clamp-2">
                  {asset.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Asset Modal */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Add New Asset
              </h3>
              <button
                onClick={() => setIsAddAssetOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitAsset(onAddAssetSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Asset Name
                </label>
                <input
                  {...registerAsset("name")}
                  placeholder="e.g. Primary Residence, 2023 Honda Civic"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {assetErrors.name && (
                  <p className="text-[10px] text-destructive">
                    {assetErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Asset Type"
                  name="type"
                  control={controlAsset}
                  options={assetTypes}
                  searchable={false}
                  clearErrors={clearErrorsAsset}
                  error={assetErrors.type}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Current Value
                  </label>
                  <input
                    {...registerAsset("value", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {assetErrors.value && (
                    <p className="text-[10px] text-destructive">
                      {assetErrors.value.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Purchase Price (Opt)
                  </label>
                  <input
                    {...registerAsset("purchase_price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Purchase Date (Opt)
                </label>
                <input
                  {...registerAsset("purchase_date")}
                  type="date"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Notes (Optional)
                </label>
                <input
                  {...registerAsset("notes")}
                  placeholder="e.g. Located in downtown"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingAsset}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isCreatingAsset ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Asset"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Edit Asset
              </h3>
              <button
                onClick={() => setEditAsset(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEdit(onEditAssetSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Asset Name
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

              <div className="space-y-1">
                <FormSelect
                  label="Asset Type"
                  name="type"
                  control={controlEdit}
                  options={assetTypes}
                  searchable={false}
                  clearErrors={clearErrorsEdit}
                  error={editErrors.type}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Current Value
                  </label>
                  <input
                    {...registerEdit("value", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {editErrors.value && (
                    <p className="text-[10px] text-destructive">
                      {editErrors.value.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Purchase Price (Opt)
                  </label>
                  <input
                    {...registerEdit("purchase_price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Purchase Date (Opt)
                </label>
                <input
                  {...registerEdit("purchase_date")}
                  type="date"
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Notes (Optional)
                </label>
                <input
                  {...registerEdit("notes")}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingAsset}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isUpdatingAsset ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Asset"
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
        title="Delete Asset"
        description="Are you sure you want to delete this asset entry from your net worth overview?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
