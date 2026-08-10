"use client";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import FormDatePicker from "@/components/custom/form-date-picker";
import FormSelect from "@/components/custom/form-select";
import { useCurrency } from "@/hooks/use-currency";
import {
  useCreateInvestmentMutation,
  useDeleteInvestmentMutation,
  useGetInvestmentsQuery,
  useUpdateInvestmentMutation,
} from "@/services/investment-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { z } from "zod";

const investmentTypes = [
  { label: "Stock", value: "stock" },
  { label: "Crypto", value: "crypto" },
  { label: "Bond", value: "bond" },
  { label: "Mutual Fund", value: "mutual_fund" },
  { label: "Other", value: "other" },
];

const investmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  purchase_price: z.coerce.number().min(0, "Purchase price cannot be negative"),
  current_price: z.coerce.number().min(0, "Current price cannot be negative"),
  purchase_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type InvestmentFormValues = z.infer<typeof investmentSchema>;

export default function InvestmentsPage() {
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: investmentsData, isLoading: investmentsLoading } =
    useGetInvestmentsQuery({
      search: searchTerm,
    });

  const [createInvestmentApi, { isLoading: isCreating }] =
    useCreateInvestmentMutation();
  const [updateInvestmentApi, { isLoading: isUpdating }] =
    useUpdateInvestmentMutation();
  const [deleteInvestmentApi] = useDeleteInvestmentMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const investments = investmentsData?.data || [];
  const metrics = investmentsData?.meta?.metrics || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalPnL: 0,
  };
  const pnlPercentage =
    metrics.totalInvested > 0
      ? (metrics.totalPnL / metrics.totalInvested) * 100
      : 0;

  const chartData = investments
    .map((inv: any) => ({
      name: inv.symbol || inv.name,
      invested: inv.purchase_price * inv.quantity,
      current: inv.current_price * inv.quantity,
      isProfit: inv.current_price - inv.purchase_price >= 0,
    }))
    .slice(0, 10);

  const {
    register: registerForm,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      quantity: 0,
      purchase_price: 0,
      current_price: 0,
      name: "",
      symbol: "",
      type: "",
      purchase_date: "",
      notes: "",
    },
  });

  const onAddSubmit = async (data: InvestmentFormValues) => {
    try {
      const payload = { ...data };
      if (payload.purchase_date) {
        payload.purchase_date = new Date(payload.purchase_date).toISOString();
      } else {
        delete payload.purchase_date;
      }

      await createInvestmentApi(payload).unwrap();
      toast.success("Investment recorded successfully!");
      setIsAddOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create investment");
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    reset({
      name: item.name,
      symbol: item.symbol || "",
      type: item.type,
      quantity: item.quantity,
      purchase_price: item.purchase_price,
      current_price: item.current_price,
      purchase_date: item.purchase_date
        ? new Date(item.purchase_date).toISOString().split("T")[0]
        : "",
      notes: item.notes || "",
    });
  };

  const onEditSubmit = async (data: InvestmentFormValues) => {
    if (!editItem) return;
    try {
      const payload = { ...data };
      if (payload.purchase_date) {
        payload.purchase_date = new Date(payload.purchase_date).toISOString();
      } else {
        delete payload.purchase_date;
      }
      await updateInvestmentApi({ id: editItem._id, data: payload }).unwrap();
      toast.success("Investment updated successfully!");
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update investment");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInvestmentApi(deleteId).unwrap();
      toast.success("Investment deleted.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete investment.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Investment Portfolio
          </h1>
          <p className="text-xs text-muted-foreground">
            Track stocks, crypto, and mutual funds
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or symbol..."
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
            <span className="hidden sm:inline">Add Holding</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Invested
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {formatCurrency(metrics.totalInvested)}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Value
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {formatCurrency(metrics.totalCurrentValue)}
          </p>
        </div>
        <div
          className={`p-5 rounded-2xl border ${metrics.totalPnL >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-destructive/10 border-destructive/20"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Profit / Loss
              </p>
              <p
                className={`text-2xl font-black mt-1 ${metrics.totalPnL >= 0 ? "text-emerald-500" : "text-destructive"}`}
              >
                {metrics.totalPnL > 0 ? "+" : ""}
                {formatCurrency(metrics.totalPnL)}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${metrics.totalPnL >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-destructive/20 text-destructive"}`}
            >
              {metrics.totalPnL >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {pnlPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {investments.length > 0 && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-foreground">
            Top Holdings Value
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <RechartsTooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#1f2937",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="current" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isProfit ? "#10b981" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-md text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">
                  Holdings
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">
                  Avg Price
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">
                  Market Price
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">
                  Return
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {investmentsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        No Investments Found
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Start building your portfolio by adding a new holding.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                investments.map((inv: any) => {
                  const invested = inv.purchase_price * inv.quantity;
                  const current = inv.current_price * inv.quantity;
                  const pnl = current - invested;
                  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
                  const isProfit = pnl >= 0;

                  return (
                    <tr
                      key={inv._id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-sm">
                            {inv.symbol || inv.name.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">
                              {inv.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {inv.type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-foreground">
                          {inv.quantity.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Qty</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(inv.purchase_price)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Total: {formatCurrency(invested)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(inv.current_price)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Total: {formatCurrency(current)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p
                          className={`font-bold ${isProfit ? "text-emerald-500" : "text-destructive"}`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(pnl)}
                        </p>
                        <div
                          className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 ${isProfit ? "text-emerald-500" : "text-destructive"}`}
                        >
                          {isProfit ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(inv)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
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
            className="w-full max-w-lg bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-3 sticky top-0 bg-card z-10">
              <h3 className="text-base font-bold text-foreground">
                {editItem ? "Edit Holding" : "Add New Holding"}
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Asset Name
                  </label>
                  <input
                    {...registerForm("name")}
                    placeholder="e.g. Apple Inc."
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.name && (
                    <p className="text-[10px] text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Ticker Symbol (Opt)
                  </label>
                  <input
                    {...registerForm("symbol")}
                    placeholder="e.g. AAPL"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FormSelect
                  label="Investment Type"
                  name="type"
                  control={control}
                  options={investmentTypes}
                  searchable={false}
                  clearErrors={clearErrors}
                  error={errors.type}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Quantity
                  </label>
                  <input
                    {...registerForm("quantity", { valueAsNumber: true })}
                    type="number"
                    step="0.00000001"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.quantity && (
                    <p className="text-[10px] text-destructive">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Avg Buy Price
                  </label>
                  <input
                    {...registerForm("purchase_price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.purchase_price && (
                    <p className="text-[10px] text-destructive">
                      {errors.purchase_price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Market Price
                  </label>
                  <input
                    {...registerForm("current_price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.current_price && (
                    <p className="text-[10px] text-destructive">
                      {errors.current_price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <FormDatePicker
                  name="purchase_date"
                  control={control}
                  error={errors.purchase_date}
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
                  "Update Holding"
                ) : (
                  "Save Holding"
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
        title="Delete Investment"
        description="Are you sure you want to delete this investment holding? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
