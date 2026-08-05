"use client";

import { Card } from "@/components/ui/card";
import { RootState } from "@/redux/store";
import { useGetAuditLogsQuery, useGetErrorLogsQuery } from "@/services/admin-api";
import { format } from "date-fns";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AdminLogsPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<"audit" | "error">("audit");

  useEffect(() => {
    if (user && user.user_role !== "super_admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  const { data: auditData, isLoading: auditLoading } = useGetAuditLogsQuery({ limit: 100 });
  const { data: errorData, isLoading: errorLoading } = useGetErrorLogsQuery({ limit: 100 });

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
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Timestamp</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Admin</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Action</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Target / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {log.admin_id?.admin_email || log.admin_id}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">
                        {log.action}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-muted-foreground">
                          {log.target_id && <div>Target: {log.target_id}</div>}
                          {log.details && (
                            <pre className="mt-1 bg-background p-2 rounded-md overflow-x-auto max-w-sm border border-border">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Timestamp</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Path / Method</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Error Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {errorLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground align-top">
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-mono text-xs mb-1 bg-secondary inline-block px-2 py-0.5 rounded">
                          {log.method}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={log.path}>
                          {log.path}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-lg">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
