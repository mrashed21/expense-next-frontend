"use client";

import { Card } from "@/components/ui/card";
import { TablePagination } from "@/components/custom/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RootState } from "@/redux/store";
import {
  useGetAuditLogsQuery,
  useGetErrorLogsQuery,
} from "@/services/admin-api";
import { format } from "date-fns";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AdminLogsPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<"audit" | "error">("audit");
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 10;
  const [errorPage, setErrorPage] = useState(1);
  const errorPageSize = 10;

  useEffect(() => {
    if (user && user.user_role !== "super_admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  const { data: auditData, isLoading: auditLoading } = useGetAuditLogsQuery({
    limit: 100,
  });
  const { data: errorData, isLoading: errorLoading } = useGetErrorLogsQuery({
    limit: 100,
  });

  if (!user || user.user_role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">
          Only Super Administrators can view system logs.
        </p>
      </div>
    );
  }

  const auditLogs = auditData?.data || [];
  const errorLogs = errorData?.data || [];
  const totalAuditPages = Math.ceil(auditLogs.length / auditPageSize);
  const paginatedAuditLogs = auditLogs.slice(
    (auditPage - 1) * auditPageSize,
    auditPage * auditPageSize,
  );
  const totalErrorPages = Math.ceil(errorLogs.length / errorPageSize);
  const paginatedErrorLogs = errorLogs.slice(
    (errorPage - 1) * errorPageSize,
    errorPage * errorPageSize,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          System Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor administrative actions and backend server errors.
        </p>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab("error")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "error"
              ? "border-destructive text-destructive"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Error Logs (Exceptions)
        </button>
      </div>

      <Card className="overflow-hidden">
        {activeTab === "audit" && (
          <div className="overflow-x-auto">
            {auditLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No audit logs found.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                    <TableRow>
                      <TableHead className="px-4 py-4 font-semibold w-12 text-center">
                        #
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Timestamp
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Admin
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Action
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Target / Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {paginatedAuditLogs.map((log: any, idx: number) => (
                      <TableRow
                        key={log._id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <TableCell className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground w-12">
                          {(auditPage - 1) * auditPageSize + idx + 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {log.admin_id?.admin_email || log.admin_id}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium text-primary">
                          {log.action}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-xs text-muted-foreground">
                            {log.target_id && <div>Target: {log.target_id}</div>}
                            {log.details && (
                              <pre className="mt-1 bg-background p-2 rounded-md overflow-x-auto max-w-sm border border-border">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={auditPage}
                  totalPages={totalAuditPages}
                  totalItems={auditLogs.length}
                  pageSize={auditPageSize}
                  onPageChange={(p) => setAuditPage(p)}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "error" && (
          <div className="overflow-x-auto">
            {errorLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-destructive" />
              </div>
            ) : errorLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No system errors captured.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                    <TableRow>
                      <TableHead className="px-4 py-4 font-semibold w-12 text-center">
                        #
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Timestamp
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Path / Method
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Error Message
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {paginatedErrorLogs.map((log: any, idx: number) => (
                      <TableRow
                        key={log._id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <TableCell className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground w-12 align-top">
                          {(errorPage - 1) * errorPageSize + idx + 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-muted-foreground align-top">
                          {format(
                            new Date(log.timestamp),
                            "MMM d, yyyy HH:mm:ss",
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-top">
                          <div className="font-mono text-xs mb-1 bg-secondary inline-block px-2 py-0.5 rounded">
                            {log.method}
                          </div>
                          <div
                            className="text-xs text-muted-foreground truncate"
                            title={log.path}
                          >
                            {log.path}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 max-w-lg">
                          <div className="font-semibold text-destructive mb-2">
                            {log.message}
                          </div>
                          {log.stack && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                                View Stack Trace
                              </summary>
                              <pre className="bg-background p-3 rounded-md overflow-x-auto border border-border text-muted-foreground">
                                {log.stack}
                              </pre>
                            </details>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={errorPage}
                  totalPages={totalErrorPages}
                  totalItems={errorLogs.length}
                  pageSize={errorPageSize}
                  onPageChange={(p) => setErrorPage(p)}
                />
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
