"use client";

import { useCurrency } from "@/hooks/use-currency";
import { useGetAccountsQuery } from "@/services/account-api";
import {
  useCloseDpsFdrMutation,
  useCreateDpsFdrMutation,
  useGetDpsFdrQuery,
  usePayDpsMutation,
} from "@/services/dps-fdr-api";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DpsFdrPage() {
  const { formatCurrency } = useCurrency();
  const { data, isLoading } = useGetDpsFdrQuery({});
  const { data: accountsData } = useGetAccountsQuery({});
  const [create, { isLoading: creating }] = useCreateDpsFdrMutation();
  const [pay] = usePayDpsMutation();
  const [close] = useCloseDpsFdrMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    name: "", type: "dps", account_id: "", principal_amount: "",
    monthly_installment: "", interest_rate: "", start_date: "",
    maturity_date: "", notes: "",
  });
  const items = data?.data || [];
  const accounts = accountsData?.data || [];
  const update = (key: string, value: string) => setForm((current: any) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await create({
        ...form,
        principal_amount: Number(form.principal_amount),
        monthly_installment: form.type === "dps" ? Number(form.monthly_installment) : undefined,
        interest_rate: Number(form.interest_rate),
      }).unwrap();
      toast.success("DPS/FDR created successfully.");
      setOpen(false);
    } catch (error: any) { toast.error(error?.data?.message || "Could not create DPS/FDR."); }
  };
  const run = async (action: any, id: string, message: string) => {
    try { await action(id).unwrap(); toast.success(message); }
    catch (error: any) { toast.error(error?.data?.message || "Action failed."); }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold">DPS & FDR Management</h1><p className="text-xs text-muted-foreground">Track deposits, installments, interest and maturity.</p></div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add Deposit</button>
      </div>
      {isLoading ? <Loader2 className="mx-auto animate-spin" /> : items.length === 0 ? <p className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">No DPS or FDR records yet.</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item: any) => <div key={item._id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex justify-between"><div><h2 className="font-bold">{item.name}</h2><p className="text-xs uppercase text-muted-foreground">{item.type} · {item.status}</p></div><span className="text-sm font-semibold">{formatCurrency(item.maturity_amount)}</span></div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>Paid: {formatCurrency(item.total_paid)}</span><span>Rate: {item.interest_rate}%</span><span>Maturity: {new Date(item.maturity_date).toLocaleDateString()}</span><span>{item.type === "dps" ? `Installments: ${item.paid_installments}` : "Principal deposit"}</span></div>
            {item.status === "active" && <div className="flex gap-2"><button onClick={() => item.type === "dps" ? run(pay, item._id, "DPS installment paid.") : run(close, item._id, "Deposit closed.")} className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold">{item.type === "dps" ? "Pay Installment" : "Close FDR"}</button></div>}
          </div>)}
        </div>
      )}
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-3 rounded-2xl bg-card p-6">
        <h2 className="text-lg font-bold">Add DPS/FDR</h2>
        {(["name", "principal_amount", "monthly_installment", "interest_rate", "start_date", "maturity_date", "notes"] as const).map((key) => key === "monthly_installment" && form.type === "fdr" ? null : <input key={key} required={["name", "principal_amount", "interest_rate", "start_date", "maturity_date"].includes(key)} type={key.includes("date") ? "date" : key.includes("amount") || key === "interest_rate" ? "number" : "text"} placeholder={key.replaceAll("_", " ")} value={form[key]} onChange={(e) => update(key, e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />)}
        <select value={form.type} onChange={(e) => update("type", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm"><option value="dps">DPS</option><option value="fdr">FDR</option></select>
        <select required value={form.account_id} onChange={(e) => update("account_id", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm"><option value="">Select account</option>{accounts.map((account: any) => <option key={account._id} value={account._id}>{account.name} ({formatCurrency(account.current_balance)})</option>)}</select>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm">Cancel</button><button disabled={creating} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">{creating ? "Saving..." : "Save"}</button></div>
      </form></div>}
    </div>
  );
}
