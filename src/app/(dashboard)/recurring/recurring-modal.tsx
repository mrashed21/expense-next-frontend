"use client";

import { useCreateRecurringMutation, useUpdateRecurringMutation } from "@/services/recurringApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useGetCategoriesQuery } from "@/services/categoryApi";
import { useGetAccountsQuery } from "@/services/accountApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function RecurringModal({ isOpen, onClose, item }: Props) {
  const [createRecurring, { isLoading: isCreating }] = useCreateRecurringMutation();
  const [updateRecurring, { isLoading: isUpdating }] = useUpdateRecurringMutation();
  
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: accountsData } = useGetAccountsQuery({});

  const [formData, setFormData] = useState({
    title: "",
    type: "expense",
    frequency: "monthly",
    next_run_date: new Date().toISOString().split("T")[0],
    template_amount: "",
    template_category: "",
    template_account: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        type: item.type,
        frequency: item.frequency,
        next_run_date: new Date(item.next_run_date).toISOString().split("T")[0],
        template_amount: item.template.amount.toString(),
        template_category: item.template.category_id || "",
        template_account: item.template.account_id || "",
      });
    } else {
      setFormData({
        title: "",
        type: "expense",
        frequency: "monthly",
        next_run_date: new Date().toISOString().split("T")[0],
        template_amount: "",
        template_category: "",
        template_account: "",
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.template_amount || !formData.template_category || !formData.template_account) {
      return toast.error("Please fill in all required fields.");
    }

    const payload = {
      title: formData.title,
      type: formData.type === "income" || formData.type === "expense" ? "transaction" : formData.type, // Map UI type to internal type
      frequency: formData.frequency,
      next_run_date: new Date(formData.next_run_date).toISOString(),
      template: {
        type: formData.type,
        amount: Number(formData.template_amount),
        category_id: formData.template_category,
        account_id: formData.template_account,
      },
    };

    try {
      if (item) {
        await updateRecurring({ id: item._id, ...payload }).unwrap();
        toast.success("Automation updated");
      } else {
        await createRecurring(payload).unwrap();
        toast.success("Automation created");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {item ? "Edit Automation" : "New Automation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Netflix Subscription"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Frequency</label>
              <Select value={formData.frequency} onValueChange={(val) => setFormData({ ...formData, frequency: val })}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start / Next Run Date</label>
            <Input
              type="date"
              value={formData.next_run_date}
              onChange={(e) => setFormData({ ...formData, next_run_date: e.target.value })}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Template Details</h4>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</label>
            <Input
              type="number"
              value={formData.template_amount}
              onChange={(e) => setFormData({ ...formData, template_amount: e.target.value })}
              placeholder="0.00"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account</label>
            <Select value={formData.template_account} onValueChange={(val) => setFormData({ ...formData, template_account: val })}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accountsData?.data?.map((acc: any) => (
                  <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
            <Select value={formData.template_category} onValueChange={(val) => setFormData({ ...formData, template_category: val })}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.data?.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl mt-4 flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : item ? "Update Automation" : "Create Automation"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
