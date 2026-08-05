"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { RootState } from "@/redux/store";
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from "@/services/admin-api";
import {
  Ban,
  CheckCircle,
  Loader2,
  MoreVertical,
  Search,
  ShieldAlert,
  Trash2,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Action Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "active" | "deactive" | "banned" | "delete" | null
  >(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const {
    data: usersResponse,
    isLoading: usersLoading,
    refetch,
  } = useGetUsersQuery({
    limit: 10,
    page,
    search,
    filter,
  });

  const [updateUserStatus, { isLoading: updatingStatus }] =
    useUpdateUserStatusMutation();

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  const users = usersResponse?.data?.users || [];
  const pagination = usersResponse?.data?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
  };

  const handleActionConfirm = async () => {
    if (!selectedUserId || !actionType) return;

    try {
      if (actionType === "delete") {
        // Implement delete mutation here if needed (e.g. useDeleteUserMutation)
        toast.info("Delete user API not implemented here yet.");
      } else {
        await updateUserStatus({
          id: selectedUserId,
          status: actionType,
        }).unwrap();
        toast.success(`User status updated successfully`);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to perform action");
    }
  };

  const openActionDialog = (id: string, type: typeof actionType) => {
    setSelectedUserId(id);
    setActionType(type);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage system users, view activity, and update roles.
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-6 border border-border shadow-sm bg-card/50">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filter}
              onValueChange={(val) => {
                setFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="font-bold">User Details</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-center">Txns</TableHead>
                <TableHead className="font-bold text-center">
                  Categories
                </TableHead>
                <TableHead className="font-bold">Joined Date</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u: any) => (
                  <TableRow key={u._id} className="hover:bg-secondary/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                          {u.user_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{u.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.user_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.user_status === "active" && (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-md uppercase tracking-wider border border-emerald-500/20">
                          Active
                        </span>
                      )}
                      {u.user_status === "deactive" && (
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-md uppercase tracking-wider border border-orange-500/20">
                          Inactive
                        </span>
                      )}
                      {u.user_status === "banned" && (
                        <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded-md uppercase tracking-wider border border-destructive/20">
                          Banned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {u.total_transactions || 0}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {u.total_categories || 0}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.user_status !== "active" && (
                            <DropdownMenuItem
                              onClick={() => openActionDialog(u._id, "active")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />{" "}
                              Activate
                            </DropdownMenuItem>
                          )}
                          {u.user_status !== "deactive" && (
                            <DropdownMenuItem
                              onClick={() =>
                                openActionDialog(u._id, "deactive")
                              }
                            >
                              <UserCog className="h-4 w-4 mr-2 text-orange-500" />{" "}
                              Inactivate
                            </DropdownMenuItem>
                          )}
                          {u.user_status !== "banned" && (
                            <DropdownMenuItem
                              onClick={() => openActionDialog(u._id, "banned")}
                            >
                              <Ban className="h-4 w-4 mr-2 text-destructive" />{" "}
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openActionDialog(u._id, "delete")}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {actionType === "delete"
                ? "delete this user permanently"
                : `change this user's status to ${actionType}`}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionType === "delete" || actionType === "banned"
                  ? "destructive"
                  : "default"
              }
              onClick={handleActionConfirm}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
