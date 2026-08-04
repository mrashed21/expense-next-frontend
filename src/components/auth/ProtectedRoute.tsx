"use client";

import { useSocket } from "@/hooks/useSocket";
import { RootState } from "@/redux/store";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useSelector(
    (state: RootState) => state.auth,
  );

  // Initialize Socket.io connection for authenticated users
  useSocket();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      } else if (
        user?.isAdmin && 
        !pathname?.startsWith("/admin") && 
        !pathname?.startsWith("/profile") && 
        !pathname?.startsWith("/settings")
      ) {
        router.replace("/admin");
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary/30 animate-pulse">
          $
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
