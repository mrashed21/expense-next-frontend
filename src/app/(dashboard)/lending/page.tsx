"use client";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { EmptyState } from "@/components/custom/empty-state";
import PhonesInput from "@/components/custom/phone-input";
import DatePicker from "@/components/custom/date-picker";
import { SearchableSelect } from "@/components/custom/searchable-select";
import { TableSkeleton } from "@/components/custom/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate } from "@/lib/utils";
import { useGetAccountsQuery } from "@/services/account-api";
import {
  useAddRepaymentMutation,
  useCancelLoanMutation,
  useCreateBorrowerMutation,
  useCreateLoanMutation,
  useDeleteLoanMutation,
  useGetBorrowersQuery,
  useGetLoanByIdQuery,
  useGetLoansQuery,
  useReverseRepaymentMutation,
  useUpdateLoanMutation,
  useWriteOffLoanMutation,
} from "@/services/loan-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  HandCoins,
  History,
  Landmark,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createLoanSchema = z.object({
  borrower_name: z.string().min(1, "Borrower name is required"),
  borrower_id: z.string().optional(),
  principal_amount: z.coerce
    .number()
    .positive("Principal amount must be greater than zero"),
  source_account_id: z.string().min(1, "Source account is required"),
  lent_date: z.string().min(1, "Lending date is required"),
  expected_return_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

const addRepaymentSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Repayment amount must be greater than zero"),
  account_id: z.string().min(1, "Receiving account is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

const editLoanSchema = z.object({
  expected_return_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

const writeOffSchema = z.object({
  reason: z.string().min(1, "Write-off reason is required"),
});

const createBorrowerSchema = z.object({
  name: z.string().min(1, "Borrower name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  note: z.string().optional(),
});

type CreateLoanValues = z.infer<typeof createLoanSchema>;
type AddRepaymentValues = z.infer<typeof addRepaymentSchema>;
type EditLoanValues = z.infer<typeof editLoanSchema>;
type WriteOffValues = z.infer<typeof writeOffSchema>;
type CreateBorrowerValues = z.infer<typeof createBorrowerSchema>;

const STATUS_TABS = [
  { label: "All Loans", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Partially Paid", value: "PARTIALLY_PAID" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Written Off", value: "WRITTEN_OFF" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function LendingPage() {
  const { formatCurrency } = useCurrency();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedBorrowerFilter, setSelectedBorrowerFilter] = useState<string>("");

  // Modals state
  const [isCreateLoanOpen, setIsCreateLoanOpen] = useState(false);
  const [isAddRepaymentOpen, setIsAddRepaymentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  const [isWriteOffOpen, setIsWriteOffOpen] = useState(false);
  const [isBorrowersListOpen, setIsBorrowersListOpen] = useState(false);
  const [isCreateBorrowerOpen, setIsCreateBorrowerOpen] = useState(false);

  // Selected Loan / Repayment for actions
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [actionLoan, setActionLoan] = useState<any>(null);
  const [reversalInfo, setReversalInfo] = useState<{
    loanId: string;
    repaymentId: string;
    amount: number;
  } | null>(null);
  const [cancelLoanId, setCancelLoanId] = useState<string | null>(null);
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: accountsData } = useGetAccountsQuery({});
  const { data: borrowersData } = useGetBorrowersQuery({});
  const { data: loansData, isLoading: isLoansLoading } = useGetLoansQuery({
    search: searchTerm || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    borrowerId: selectedBorrowerFilter || undefined,
  });

  const { data: singleLoanData, isLoading: isSingleLoanLoading } =
    useGetLoanByIdQuery(selectedLoanId || "", {
      skip: !selectedLoanId || !isDetailsOpen,
    });

  const [createLoanApi, { isLoading: isCreatingLoan }] =
    useCreateLoanMutation();
  const [updateLoanApi, { isLoading: isUpdatingLoan }] =
    useUpdateLoanMutation();
  const [addRepaymentApi, { isLoading: isAddingRepayment }] =
    useAddRepaymentMutation();
  const [reverseRepaymentApi, { isLoading: isReversingRepayment }] =
    useReverseRepaymentMutation();
  const [cancelLoanApi, { isLoading: isCancellingLoan }] =
    useCancelLoanMutation();
  const [writeOffLoanApi, { isLoading: isWritingOff }] =
    useWriteOffLoanMutation();
  const [deleteLoanApi, { isLoading: isDeletingLoan }] =
    useDeleteLoanMutation();
  const [createBorrowerApi, { isLoading: isCreatingBorrower }] =
    useCreateBorrowerMutation();

  const accounts = useMemo(
    () => (accountsData?.data || []).filter((a: any) => !a.is_deleted),
    [accountsData],
  );
  const borrowers = useMemo(
    () => borrowersData?.data || [],
    [borrowersData],
  );
  const loans = loansData?.data || [];
  const summary = loansData?.meta?.summary || {
    totalLent: 0,
    totalRecovered: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    totalWrittenOff: 0,
    activeLoansCount: 0,
    totalLoansCount: 0,
  };

  // Forms
  const createLoanForm = useForm<CreateLoanValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      borrower_name: "",
      borrower_id: "",
      principal_amount: "" as any,
      source_account_id: "",
      lent_date: new Date().toISOString().split("T")[0],
      expected_return_date: "",
      notes: "",
    },
  });

  const repaymentForm = useForm<AddRepaymentValues>({
    resolver: zodResolver(addRepaymentSchema),
    defaultValues: {
      amount: "" as any,
      account_id: "",
      payment_method: "Cash",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const editLoanForm = useForm<EditLoanValues>({
    resolver: zodResolver(editLoanSchema),
    defaultValues: {
      expected_return_date: "",
      notes: "",
    },
  });

  const writeOffForm = useForm<WriteOffValues>({
    resolver: zodResolver(writeOffSchema),
    defaultValues: {
      reason: "",
    },
  });

  const createBorrowerForm = useForm<CreateBorrowerValues>({
    resolver: zodResolver(createBorrowerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      note: "",
    },
  });

  // Watched form values for live preview calculation
  const watchedSourceAccountId = createLoanForm.watch("source_account_id");
  const watchedPrincipalAmount = Number(createLoanForm.watch("principal_amount")) || 0;
  const selectedSourceAccount = accounts.find(
    (a: any) => a._id === watchedSourceAccountId,
  );

  const watchedRepaymentAccountId = repaymentForm.watch("account_id");
  const watchedRepaymentAmount = Number(repaymentForm.watch("amount")) || 0;
  const selectedRepaymentAccount = accounts.find(
    (a: any) => a._id === watchedRepaymentAccountId,
  );

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/30 gap-1 font-medium">
            <Clock className="w-3 h-3" /> Active
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30 gap-1 font-medium">
            <RotateCcw className="w-3 h-3" /> Partial
          </Badge>
        );
      case "PAID":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Fully Paid
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border-rose-500/30 gap-1 font-medium animate-pulse">
            <AlertCircle className="w-3 h-3" /> Overdue
          </Badge>
        );
      case "WRITTEN_OFF":
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25 border-slate-500/30 gap-1 font-medium">
            <Ban className="w-3 h-3" /> Written Off
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/25 border-zinc-500/30 gap-1 font-medium">
            <X className="w-3 h-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Form Handlers
  const onCreateLoanSubmit = async (values: CreateLoanValues) => {
    if (
      selectedSourceAccount &&
      selectedSourceAccount.current_balance < values.principal_amount
    ) {
      toast.error(
        `Insufficient balance in ${selectedSourceAccount.name}. Available: ${formatCurrency(
          selectedSourceAccount.current_balance,
        )}`,
      );
      return;
    }

    try {
      await createLoanApi(values).unwrap();
      toast.success(
        `Successfully lent ${formatCurrency(values.principal_amount)} to ${
          values.borrower_name
        }`,
      );
      createLoanForm.reset();
      setIsCreateLoanOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to record loan.");
    }
  };

  const onAddRepaymentSubmit = async (values: AddRepaymentValues) => {
    if (!actionLoan) return;

    if (values.amount > actionLoan.outstanding_amount) {
      toast.error(
        `Repayment amount (${formatCurrency(
          values.amount,
        )}) cannot exceed remaining outstanding amount (${formatCurrency(
          actionLoan.outstanding_amount,
        )})`,
      );
      return;
    }

    try {
      await addRepaymentApi({
        id: actionLoan._id,
        data: values,
      }).unwrap();
      toast.success(
        `Received repayment of ${formatCurrency(values.amount)} from ${
          actionLoan.borrower_name
        }`,
      );
      repaymentForm.reset();
      setIsAddRepaymentOpen(false);
      setActionLoan(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add repayment.");
    }
  };

  const onEditLoanSubmit = async (values: EditLoanValues) => {
    if (!actionLoan) return;

    try {
      await updateLoanApi({
        id: actionLoan._id,
        data: values,
      }).unwrap();
      toast.success("Loan details updated successfully.");
      setIsEditLoanOpen(false);
      setActionLoan(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update loan.");
    }
  };

  const onWriteOffSubmit = async (values: WriteOffValues) => {
    if (!actionLoan) return;

    try {
      await writeOffLoanApi({
        id: actionLoan._id,
        data: values,
      }).unwrap();
      toast.success(
        `Remaining balance of ${formatCurrency(
          actionLoan.outstanding_amount,
        )} for ${actionLoan.borrower_name} written off.`,
      );
      writeOffForm.reset();
      setIsWriteOffOpen(false);
      setActionLoan(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to write off loan.");
    }
  };

  const handleCancelLoan = async () => {
    if (!cancelLoanId) return;
    try {
      await cancelLoanApi({
        id: cancelLoanId,
        data: { reason: "User cancelled loan entry" },
      }).unwrap();
      toast.success("Loan cancelled and account balance restored.");
      setCancelLoanId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel loan.");
    }
  };

  const handleDeleteLoan = async () => {
    if (!deleteLoanId) return;
    try {
      await deleteLoanApi(deleteLoanId).unwrap();
      toast.success("Loan deleted successfully.");
      setDeleteLoanId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete loan.");
    }
  };

  const handleReverseRepayment = async () => {
    if (!reversalInfo) return;
    try {
      await reverseRepaymentApi({
        loanId: reversalInfo.loanId,
        repaymentId: reversalInfo.repaymentId,
      }).unwrap();
      toast.success("Repayment reversed and balance updated.");
      setReversalInfo(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reverse repayment.");
    }
  };

  const onCreateBorrowerSubmit = async (values: CreateBorrowerValues) => {
    try {
      const res = await createBorrowerApi(values).unwrap();
      toast.success(`Borrower ${values.name} added.`);
      createBorrowerForm.reset();
      setIsCreateBorrowerOpen(false);

      if (isCreateLoanOpen) {
        createLoanForm.setValue("borrower_name", res.data?.name || values.name);
        createLoanForm.setValue("borrower_id", res.data?._id || "");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create borrower.");
    }
  };

  const openRepaymentModal = (loan: any) => {
    setActionLoan(loan);
    repaymentForm.reset({
      amount: loan.outstanding_amount,
      account_id: loan.source_account_id?._id || accounts[0]?._id || "",
      payment_method: loan.source_account_id?.type || "Cash",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setIsAddRepaymentOpen(true);
  };

  const openEditModal = (loan: any) => {
    setActionLoan(loan);
    editLoanForm.reset({
      expected_return_date: loan.expected_return_date
        ? new Date(loan.expected_return_date).toISOString().split("T")[0]
        : "",
      notes: loan.notes || "",
    });
    setIsEditLoanOpen(true);
  };

  const openWriteOffModal = (loan: any) => {
    setActionLoan(loan);
    writeOffForm.reset({ reason: "" });
    setIsWriteOffOpen(true);
  };

  const openDetailsModal = (loanId: string) => {
    setSelectedLoanId(loanId);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Lending
              </h1>
              <p className="text-sm text-muted-foreground">
                Track money lent, manage partial recoveries & monitor outstanding balances.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsBorrowersListOpen(true)}
            className="gap-2 border-border/80 hover:bg-secondary/80 text-sm font-medium"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>Borrowers ({borrowers.length})</span>
          </Button>

          <Button
            onClick={() => {
              createLoanForm.reset({
                borrower_name: "",
                borrower_id: "",
                principal_amount: "" as any,
                source_account_id: accounts[0]?._id || "",
                lent_date: new Date().toISOString().split("T")[0],
                expected_return_date: "",
                notes: "",
              });
              setIsCreateLoanOpen(true);
            }}
            className="gap-2 shadow-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Give Loan</span>
          </Button>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lent */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden shadow-xs hover:border-border transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ArrowUpRight className="w-14 h-14 text-primary" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Total Lent
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(summary.totalLent)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40">
              <span>Total loans:</span>
              <span className="font-medium text-foreground">
                {summary.totalLoansCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Recovered */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden shadow-xs hover:border-border transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ArrowDownLeft className="w-14 h-14 text-emerald-500" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Total Recovered
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalRecovered)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40">
              <span>Recovery rate:</span>
              <span className="font-medium text-foreground">
                {summary.totalLent > 0
                  ? `${Math.round(
                      (summary.totalRecovered / summary.totalLent) * 100,
                    )}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Receivable */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden shadow-xs hover:border-border transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Clock className="w-14 h-14 text-amber-500" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Outstanding Due
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.totalOutstanding)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40">
              <span>Active loans:</span>
              <span className="font-medium text-foreground">
                {summary.activeLoansCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Amount */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden shadow-xs hover:border-border transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <AlertCircle className="w-14 h-14 text-rose-500" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Overdue Amount
            </div>
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(summary.totalOverdue)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40">
              <span>Written off:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(summary.totalWrittenOff)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by borrower name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card border-border/80 h-9 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {borrowers.length > 0 && (
              <div className="w-44">
                <SearchableSelect
                  options={[
                    { label: "All Borrowers", value: "" },
                    ...borrowers.map((b: any) => ({
                      label: b.name,
                      value: b._id,
                    })),
                  ]}
                  value={selectedBorrowerFilter}
                  onChange={(val) => setSelectedBorrowerFilter(val)}
                  placeholder="Filter Borrower"
                />
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode("grid")}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 select-none ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loan Records List ── */}
      {isLoansLoading ? (
        <TableSkeleton />
      ) : loans.length === 0 ? (
        <EmptyState
          title="No Lending Records Found"
          description={
            searchTerm || statusFilter !== "ALL"
              ? "No loans match your search or filter criteria."
              : "You haven't given any loans yet. Click below to record your first loan."
          }
          icon={<HandCoins className="w-8 h-8" />}
          actionLabel="Give Loan"
          onAction={() => {
            createLoanForm.reset({
              borrower_name: "",
              borrower_id: "",
              principal_amount: "" as any,
              source_account_id: accounts[0]?._id || "",
              lent_date: new Date().toISOString().split("T")[0],
              expected_return_date: "",
              notes: "",
            });
            setIsCreateLoanOpen(true);
          }}
        />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-secondary/40 text-muted-foreground border-b border-border font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Borrower</th>
                  <th className="py-3.5 px-4">Principal</th>
                  <th className="py-3.5 px-4 min-w-40">Progress</th>
                  <th className="py-3.5 px-4 font-semibold text-foreground">
                    Due / Outstanding
                  </th>
                  <th className="py-3.5 px-4">Source Account</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loans.map((loan: any) => {
                  const progressPct =
                    loan.principal_amount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (loan.recovered_amount / loan.principal_amount) * 100,
                          ),
                        )
                      : 0;

                  const isOverdue =
                    loan.expected_return_date &&
                    new Date(loan.expected_return_date).getTime() < Date.now() &&
                    loan.outstanding_amount > 0;

                  return (
                    <tr
                      key={loan._id}
                      className="hover:bg-secondary/30 transition-colors group cursor-pointer"
                      onClick={() => openDetailsModal(loan._id)}
                    >
                      {/* Borrower */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                            {loan.borrower_name?.charAt(0)?.toUpperCase() || "B"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {loan.borrower_name}
                            </div>
                            {loan.notes && (
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                                {loan.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Principal */}
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {formatCurrency(loan.principal_amount)}
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Paid: {formatCurrency(loan.recovered_amount)}</span>
                            <span className="font-medium">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progressPct === 100
                                  ? "bg-emerald-500"
                                  : progressPct > 0
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Outstanding */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            loan.outstanding_amount > 0
                              ? isOverdue
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatCurrency(loan.outstanding_amount)}
                        </span>
                        {loan.write_off_amount > 0 && (
                          <div className="text-[10px] text-slate-500">
                            Written off: {formatCurrency(loan.write_off_amount)}
                          </div>
                        )}
                      </td>

                      {/* Source Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                loan.source_account_id?.color || "#4F46E5",
                            }}
                          />
                          <span className="text-xs text-foreground font-medium truncate max-w-[120px]">
                            {loan.source_account_name ||
                              loan.source_account_id?.name ||
                              "Account"}
                          </span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-muted-foreground">
                          Lent: {formatDate(loan.lent_date)}
                        </div>
                        {loan.expected_return_date && (
                          <div
                            className={`flex items-center gap-1 mt-0.5 ${
                              isOverdue
                                ? "text-rose-600 font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>Due: {formatDate(loan.expected_return_date)}</span>
                            {isOverdue && (
                              <span className="px-1 py-0.2 rounded bg-rose-500/10 text-rose-600 text-[10px]">
                                Late
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(loan.display_status || loan.status)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {loan.outstanding_amount > 0 &&
                            loan.status !== "CANCELLED" &&
                            loan.status !== "WRITTEN_OFF" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-medium"
                                onClick={() => openRepaymentModal(loan)}
                              >
                                <Plus className="w-3 h-3" />
                                Repay
                              </Button>
                            )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={() => openDetailsModal(loan._id)}
                                className="gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                View Details
                              </DropdownMenuItem>

                              {loan.outstanding_amount > 0 &&
                                loan.status !== "CANCELLED" &&
                                loan.status !== "WRITTEN_OFF" && (
                                  <DropdownMenuItem
                                    onClick={() => openRepaymentModal(loan)}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                    Add Repayment
                                  </DropdownMenuItem>
                                )}

                              <DropdownMenuItem
                                onClick={() => openEditModal(loan)}
                                className="gap-2 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                Edit Note/Due Date
                              </DropdownMenuItem>

                              {loan.outstanding_amount > 0 &&
                                loan.status !== "CANCELLED" &&
                                loan.status !== "WRITTEN_OFF" && (
                                  <DropdownMenuItem
                                    onClick={() => openWriteOffModal(loan)}
                                    className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    Write Off
                                  </DropdownMenuItem>
                                )}

                              <DropdownMenuSeparator />

                              {loan.recovered_amount === 0 &&
                                loan.status !== "CANCELLED" &&
                                loan.status !== "WRITTEN_OFF" && (
                                  <DropdownMenuItem
                                    onClick={() => setCancelLoanId(loan._id)}
                                    className="gap-2 cursor-pointer text-rose-600"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Cancel Loan
                                  </DropdownMenuItem>
                                )}

                              {(loan.status === "CANCELLED" ||
                                loan.status === "PAID") && (
                                <DropdownMenuItem
                                  onClick={() => setDeleteLoanId(loan._id)}
                                  className="gap-2 cursor-pointer text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan: any) => {
            const progressPct =
              loan.principal_amount > 0
                ? Math.min(
                    100,
                    Math.round(
                      (loan.recovered_amount / loan.principal_amount) * 100,
                    ),
                  )
                : 0;

            const isOverdue =
              loan.expected_return_date &&
              new Date(loan.expected_return_date).getTime() < Date.now() &&
              loan.outstanding_amount > 0;

            return (
              <Card
                key={loan._id}
                className="border-border/80 bg-card hover:border-primary/40 transition-all cursor-pointer shadow-xs group"
                onClick={() => openDetailsModal(loan._id)}
              >
                <CardContent className="p-4 space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                        {loan.borrower_name?.charAt(0)?.toUpperCase() || "B"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {loan.borrower_name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{formatDate(loan.lent_date)}</span>
                          <span>•</span>
                          <span className="truncate">{loan.source_account_name}</span>
                        </div>
                      </div>
                    </div>

                    <div>{getStatusBadge(loan.display_status || loan.status)}</div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/40">
                    <div>
                      <div className="text-[11px] text-muted-foreground">
                        Principal
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatCurrency(loan.principal_amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">
                        Outstanding
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          loan.outstanding_amount > 0
                            ? isOverdue
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatCurrency(loan.outstanding_amount)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Recovered: {formatCurrency(loan.recovered_amount)}</span>
                      <span className="font-medium text-foreground">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          progressPct === 100
                            ? "bg-emerald-500"
                            : progressPct > 0
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer info & quick button */}
                  <div
                    className="flex items-center justify-between pt-2 border-t border-border/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-xs text-muted-foreground">
                      {loan.expected_return_date ? (
                        <span
                          className={
                            isOverdue
                              ? "text-rose-600 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          Due: {formatDate(loan.expected_return_date)}
                        </span>
                      ) : (
                        <span>No due date</span>
                      )}
                    </div>

                    {loan.outstanding_amount > 0 &&
                      loan.status !== "CANCELLED" &&
                      loan.status !== "WRITTEN_OFF" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 font-medium"
                          onClick={() => openRepaymentModal(loan)}
                        >
                          <Plus className="w-3 h-3" />
                          Repay
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 1: Create Loan Dialog                             ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isCreateLoanOpen} onOpenChange={setIsCreateLoanOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-secondary/30">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Give Loan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Money lent reduces the source account balance immediately, tracked as loan receivable.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={createLoanForm.handleSubmit(onCreateLoanSubmit)}
            className="p-5 space-y-4"
          >
            {/* Borrower Selection / Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Borrower Name <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setIsCreateBorrowerOpen(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <UserPlus className="w-3 h-3" /> Add New Borrower
                </button>
              </div>

              {borrowers.length > 0 ? (
                <div className="space-y-2">
                  <Controller
                    control={createLoanForm.control}
                    name="borrower_name"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Input
                          placeholder="Type or select borrower name..."
                          list="borrower-datalist"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            const matched = borrowers.find(
                              (b: any) =>
                                b.name.toLowerCase() ===
                                e.target.value.trim().toLowerCase(),
                            );
                            createLoanForm.setValue(
                              "borrower_id",
                              matched ? matched._id : "",
                            );
                          }}
                        />
                        <datalist id="borrower-datalist">
                          {borrowers.map((b: any) => (
                            <option key={b._id} value={b.name} />
                          ))}
                        </datalist>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <Input
                  placeholder="Enter borrower name (e.g. Rahim)"
                  {...createLoanForm.register("borrower_name")}
                />
              )}
              {createLoanForm.formState.errors.borrower_name && (
                <p className="text-xs text-destructive">
                  {createLoanForm.formState.errors.borrower_name.message}
                </p>
              )}
            </div>

            {/* Principal Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Lending Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...createLoanForm.register("principal_amount")}
              />
              {createLoanForm.formState.errors.principal_amount && (
                <p className="text-xs text-destructive">
                  {createLoanForm.formState.errors.principal_amount.message}
                </p>
              )}
            </div>

            {/* Source Account */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Source Account <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={createLoanForm.control}
                name="source_account_id"
                render={({ field }) => (
                  <SearchableSelect
                    options={accounts.map((acc: any) => ({
                      label: `${acc.name} (${formatCurrency(acc.current_balance)})`,
                      value: acc._id,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select source account"
                  />
                )}
              />
              {createLoanForm.formState.errors.source_account_id && (
                <p className="text-xs text-destructive">
                  {createLoanForm.formState.errors.source_account_id.message}
                </p>
              )}
            </div>

            {/* Live Balance Preview Card */}
            {selectedSourceAccount && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                  selectedSourceAccount.current_balance < watchedPrincipalAmount
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                    : "bg-secondary/50 border-border/60 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Account Balance:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedSourceAccount.current_balance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">After Lending Balance:</span>
                  <span
                    className={`font-bold ${
                      selectedSourceAccount.current_balance < watchedPrincipalAmount
                        ? "text-rose-600 font-bold"
                        : "text-foreground"
                    }`}
                  >
                    {formatCurrency(
                      selectedSourceAccount.current_balance - watchedPrincipalAmount,
                    )}
                  </span>
                </div>
                {selectedSourceAccount.current_balance < watchedPrincipalAmount && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium pt-1 border-t border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Insufficient balance in {selectedSourceAccount.name}!
                  </div>
                )}
              </div>
            )}

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Lending Date <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={createLoanForm.control}
                  name="lent_date"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Expected Return Date (Optional)
                </Label>
                <Controller
                  control={createLoanForm.control}
                  name="expected_return_date"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes / Purpose (Optional)</Label>
              <Textarea
                placeholder="Add any note or terms..."
                rows={2}
                {...createLoanForm.register("notes")}
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateLoanOpen(false)}
                disabled={isCreatingLoan}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreatingLoan ||
                  !watchedSourceAccountId ||
                  (selectedSourceAccount &&
                    selectedSourceAccount.current_balance < watchedPrincipalAmount)
                }
                className="gap-2"
              >
                {isCreatingLoan && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm & Give Loan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 2: Add Repayment Dialog                           ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isAddRepaymentOpen} onOpenChange={setIsAddRepaymentOpen}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-secondary/30">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-500" />
              Add Loan Repayment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Receiving repayment will credit the selected account and reduce the outstanding balance.
            </DialogDescription>
          </DialogHeader>

          {actionLoan && (
            <form
              onSubmit={repaymentForm.handleSubmit(onAddRepaymentSubmit)}
              className="p-5 space-y-4"
            >
              {/* Loan Context Card */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Borrower:</span>
                  <span className="font-semibold text-foreground">
                    {actionLoan.borrower_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Principal:</span>
                  <span>{formatCurrency(actionLoan.principal_amount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Current Outstanding:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {formatCurrency(actionLoan.outstanding_amount)}
                  </span>
                </div>
              </div>

              {/* Repayment Amount */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">
                    Repayment Amount <span className="text-destructive">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() =>
                      repaymentForm.setValue("amount", actionLoan.outstanding_amount)
                    }
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Full Amount ({formatCurrency(actionLoan.outstanding_amount)})
                  </button>
                </div>
                <Input
                  type="number"
                  step="any"
                  max={actionLoan.outstanding_amount}
                  placeholder="0.00"
                  {...repaymentForm.register("amount")}
                />
                {repaymentForm.formState.errors.amount && (
                  <p className="text-xs text-destructive">
                    {repaymentForm.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Receiving Account */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Receiving Account <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={repaymentForm.control}
                  name="account_id"
                  render={({ field }) => (
                    <SearchableSelect
                      options={accounts.map((acc: any) => ({
                        label: `${acc.name} (${acc.type})`,
                        value: acc._id,
                      }))}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        const matched = accounts.find((a: any) => a._id === val);
                        if (matched) {
                          repaymentForm.setValue(
                            "payment_method",
                            matched.type || "Cash",
                          );
                        }
                      }}
                      placeholder="Select receiving account"
                    />
                  )}
                />
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Payment Method</Label>
                  <Input
                    placeholder="Cash, bKash, Bank..."
                    {...repaymentForm.register("payment_method")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Payment Date <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={repaymentForm.control}
                    name="payment_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Live Preview */}
              {watchedRepaymentAmount > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1 text-emerald-700 dark:text-emerald-300">
                  <div className="flex justify-between">
                    <span>Remaining Outstanding:</span>
                    <span className="font-bold">
                      {formatCurrency(
                        Math.max(
                          0,
                          actionLoan.outstanding_amount - watchedRepaymentAmount,
                        ),
                      )}
                    </span>
                  </div>
                  {selectedRepaymentAccount && (
                    <div className="flex justify-between">
                      <span>{selectedRepaymentAccount.name} Balance:</span>
                      <span className="font-bold">
                        {formatCurrency(
                          selectedRepaymentAccount.current_balance +
                            Number(watchedRepaymentAmount),
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Notes (Optional)</Label>
                <Input
                  placeholder="e.g. Received via bKash TrxID..."
                  {...repaymentForm.register("notes")}
                />
              </div>

              <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddRepaymentOpen(false)}
                  disabled={isAddingRepayment}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isAddingRepayment ||
                    !watchedRepaymentAccountId ||
                    watchedRepaymentAmount <= 0 ||
                    watchedRepaymentAmount > actionLoan.outstanding_amount
                  }
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isAddingRepayment && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Repayment
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 3: Loan Details & Repayments History Modal        ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Loan Details & Repayment History
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Complete breakdown of money lent, progress, and payment records.
                </DialogDescription>
              </div>
              {singleLoanData?.data && (
                <div>
                  {getStatusBadge(
                    singleLoanData.data.display_status || singleLoanData.data.status,
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {isSingleLoanLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            </div>
          ) : singleLoanData?.data ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Borrower & Loan Info Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-secondary/40 border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground">Borrower</span>
                  <div className="font-bold text-sm text-foreground">
                    {singleLoanData.data.borrower_name}
                  </div>
                  {singleLoanData.data.borrower_id?.phone && (
                    <div className="text-[11px] text-muted-foreground">
                      {singleLoanData.data.borrower_id.phone}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground">Source Account</span>
                  <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          singleLoanData.data.source_account_id?.color ||
                          "#4F46E5",
                      }}
                    />
                    {singleLoanData.data.source_account_name ||
                      singleLoanData.data.source_account_id?.name}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Lending Date</span>
                  <div className="font-semibold text-foreground mt-0.5">
                    {formatDate(singleLoanData.data.lent_date)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Principal Amount</span>
                  <div className="font-bold text-sm text-foreground mt-0.5">
                    {formatCurrency(singleLoanData.data.principal_amount)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Recovered Amount</span>
                  <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(singleLoanData.data.recovered_amount)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Outstanding Balance</span>
                  <div className="font-bold text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatCurrency(singleLoanData.data.outstanding_amount)}
                  </div>
                </div>

                {singleLoanData.data.expected_return_date && (
                  <div className="col-span-2 sm:col-span-3 pt-2 border-t border-border/40 flex justify-between">
                    <span className="text-muted-foreground">
                      Expected Return Date:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDate(singleLoanData.data.expected_return_date)}
                    </span>
                  </div>
                )}

                {singleLoanData.data.notes && (
                  <div className="col-span-2 sm:col-span-3 pt-1 text-muted-foreground">
                    <span className="font-medium text-foreground">Note:</span>{" "}
                    {singleLoanData.data.notes}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Recovery Progress
                  </span>
                  <span className="font-bold text-foreground">
                    {singleLoanData.data.principal_amount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (singleLoanData.data.recovered_amount /
                              singleLoanData.data.principal_amount) *
                              100,
                          ),
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        singleLoanData.data.principal_amount > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (singleLoanData.data.recovered_amount /
                                  singleLoanData.data.principal_amount) *
                                  100,
                              ),
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Repayments History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Repayment History ({singleLoanData.data.repayments?.length || 0})
                  </h4>

                  {singleLoanData.data.outstanding_amount > 0 &&
                    singleLoanData.data.status !== "CANCELLED" &&
                    singleLoanData.data.status !== "WRITTEN_OFF" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1 font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => openRepaymentModal(singleLoanData.data)}
                      >
                        <Plus className="w-3 h-3" />
                        Add Repayment
                      </Button>
                    )}
                </div>

                {singleLoanData.data.repayments?.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                    No repayment received yet.
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-secondary/40 text-muted-foreground border-b border-border font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Method & Account</th>
                          <th className="py-2.5 px-3">Note</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {singleLoanData.data.repayments.map((rep: any) => (
                          <tr key={rep._id} className="hover:bg-secondary/20">
                            <td className="py-2.5 px-3 font-medium">
                              {formatDate(rep.payment_date)}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                              +{formatCurrency(rep.amount)}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-foreground">
                                {rep.payment_method}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {rep.account_id?.name || "Account"}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-[150px] truncate">
                              {rep.notes || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[11px] text-rose-600 hover:bg-rose-500/10"
                                onClick={() =>
                                  setReversalInfo({
                                    loanId: singleLoanData.data._id,
                                    repaymentId: rep._id,
                                    amount: rep.amount,
                                  })
                                }
                                title="Reverse this repayment"
                              >
                                Reverse
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {singleLoanData?.data?.outstanding_amount > 0 &&
                singleLoanData?.data?.status !== "CANCELLED" &&
                singleLoanData?.data?.status !== "WRITTEN_OFF" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => openWriteOffModal(singleLoanData.data)}
                  >
                    Write Off Remaining
                  </Button>
                )}

              {singleLoanData?.data?.recovered_amount === 0 &&
                singleLoanData?.data?.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                    onClick={() => {
                      setCancelLoanId(singleLoanData.data._id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Cancel Loan
                  </Button>
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 4: Edit Loan Dialog                               ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isEditLoanOpen} onOpenChange={setIsEditLoanOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-secondary/30">
            <DialogTitle className="text-base font-bold text-foreground">
              Edit Loan Details
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={editLoanForm.handleSubmit(onEditLoanSubmit)}
            className="p-5 space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expected Return Date</Label>
              <Controller
                control={editLoanForm.control}
                name="expected_return_date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea rows={3} {...editLoanForm.register("notes")} />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditLoanOpen(false)}
                disabled={isUpdatingLoan}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingLoan}>
                {isUpdatingLoan && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 5: Write Off Dialog                               ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isWriteOffOpen} onOpenChange={setIsWriteOffOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-amber-500/10">
            <DialogTitle className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Write Off Loan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will forgive the remaining receivable and mark the loan as written off. History will be retained.
            </DialogDescription>
          </DialogHeader>

          {actionLoan && (
            <form
              onSubmit={writeOffForm.handleSubmit(onWriteOffSubmit)}
              className="p-5 space-y-4"
            >
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Borrower:</span>
                  <span className="font-semibold text-foreground">
                    {actionLoan.borrower_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Amount to write off:
                  </span>
                  <span className="font-bold text-rose-600">
                    {formatCurrency(actionLoan.outstanding_amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Reason for write-off <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="e.g. Borrower unable to pay, settlement reached..."
                  rows={3}
                  {...writeOffForm.register("reason")}
                />
                {writeOffForm.formState.errors.reason && (
                  <p className="text-xs text-destructive">
                    {writeOffForm.formState.errors.reason.message}
                  </p>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWriteOffOpen(false)}
                  disabled={isWritingOff}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isWritingOff}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isWritingOff && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Write Off
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 6: Borrowers Directory Modal                      ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isBorrowersListOpen} onOpenChange={setIsBorrowersListOpen}>
        <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Borrowers Directory
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Manage all recurring borrowers and view lifetime borrowing totals.
                </DialogDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCreateBorrowerOpen(true)}
                className="gap-1.5 text-xs font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Borrower
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {borrowers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                No borrowers recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60 border border-border/80 rounded-xl bg-card overflow-hidden">
                {borrowers.map((b: any) => (
                  <div
                    key={b._id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                        {b.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {b.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {b.phone && <span>{b.phone}</span>}
                          {b.phone && b.email && <span>•</span>}
                          {b.email && <span className="truncate">{b.email}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">
                        Outstanding:{" "}
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(b.outstandingAmount || 0)}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Total borrowed: {formatCurrency(b.totalBorrowed || 0)} (
                        {b.loansCount || 0} loans)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border bg-secondary/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBorrowersListOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL 7: Create Borrower Dialog                         ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={isCreateBorrowerOpen} onOpenChange={setIsCreateBorrowerOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border bg-secondary/30">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Add New Borrower
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={createBorrowerForm.handleSubmit(onCreateBorrowerSubmit)}
            className="p-5 space-y-3.5"
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Borrower Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. Rahim Chowdhury"
                {...createBorrowerForm.register("name")}
              />
              {createBorrowerForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createBorrowerForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Controller
                name="phone"
                control={createBorrowerForm.control}
                render={({ field }) => (
                  <PhonesInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="e.g. 01700000000"
                    error={createBorrowerForm.formState.errors.phone}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                placeholder="e.g. rahim@example.com"
                {...createBorrowerForm.register("email")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address / Notes</Label>
              <Input
                placeholder="Address or contact details"
                {...createBorrowerForm.register("address")}
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateBorrowerOpen(false)}
                disabled={isCreatingBorrower}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingBorrower}>
                {isCreatingBorrower && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Borrower
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation Dialogs ── */}
      {/* Cancel Loan Dialog */}
      <ConfirmDialog
        isOpen={!!cancelLoanId}
        onClose={() => setCancelLoanId(null)}
        onConfirm={handleCancelLoan}
        title="Cancel Loan Entry?"
        description="Cancelling this loan will restore the principal amount to the source account and mark the loan as cancelled."
        confirmText="Confirm & Cancel Loan"
        isLoading={isCancellingLoan}
      />

      {/* Reverse Repayment Dialog */}
      <ConfirmDialog
        isOpen={!!reversalInfo}
        onClose={() => setReversalInfo(null)}
        onConfirm={handleReverseRepayment}
        title="Reverse Repayment Record?"
        description={`This will reverse the repayment of ${formatCurrency(
          reversalInfo?.amount || 0,
        )}, debit the receiving account, and restore the loan outstanding amount.`}
        confirmText="Reverse Repayment"
        isLoading={isReversingRepayment}
      />

      {/* Delete Loan Dialog */}
      <ConfirmDialog
        isOpen={!!deleteLoanId}
        onClose={() => setDeleteLoanId(null)}
        onConfirm={handleDeleteLoan}
        title="Delete Loan Record?"
        description="Are you sure you want to delete this completed/cancelled loan record? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingLoan}
      />
    </div>
  );
}
