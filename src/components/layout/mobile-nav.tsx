"use client";

import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  Bell,
  Calendar,
  FileCheck,
  FileText,
  Grid,
  HandCoins,
  Home,
  LayoutDashboard,
  Megaphone,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  RefreshCw,
  ScrollText,
  SendHorizonal,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

/* ─── Bottom Tab Items (shown always) ─────────────────── */
const mobileItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

const adminMobileItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Activity", href: "/admin/activity", icon: Activity },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Health", href: "/admin/system-health", icon: ShieldAlert },
];

/* ─── "More" Drawer Items ──────────────────────────────── */
const moreItems = [
  { name: "Transfers", href: "/transfers", icon: ArrowRightLeft },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Bills", href: "/bills", icon: FileCheck },
  { name: "Net Worth", href: "/net-worth", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Debts", href: "/debts", icon: HandCoins },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Assets", href: "/assets", icon: Home },
  { name: "Installments", href: "/installments", icon: Calendar },
  { name: "Recurring", href: "/recurring", icon: RefreshCw },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminMoreItems = [
  { name: "Send Notification", href: "/admin/send-notification", icon: SendHorizonal },
  { name: "Logs", href: "/admin/logs", icon: ScrollText },
  { name: "Admins", href: "/admin/admins", icon: ShieldAlert },
];

/* ─── Component ────────────────────────────────────────── */
export function MobileNav() {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const [moreOpen, setMoreOpen] = useState(false);

  const isAdmin = user?.isAdmin;
  const tabItems = isAdmin ? adminMobileItems : mobileItems;
  const drawerItems = isAdmin
    ? adminMoreItems
    : moreItems;

  const isMoreActive = drawerItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <>
      {/* ── Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)", height: "calc(60px + env(safe-area-inset-bottom))" }}>
        {tabItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all duration-200 active:scale-95 select-none min-w-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "w-8 h-7 flex items-center justify-center rounded-xl transition-all duration-150",
                  isActive ? "bg-primary/12" : "",
                )}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] transition-transform duration-150",
                    isActive && "scale-110",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none truncate w-full text-center px-0.5",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all duration-200 active:scale-95 select-none min-w-0",
            isMoreActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div
            className={cn(
              "w-8 h-7 flex items-center justify-center rounded-xl transition-all duration-150",
              isMoreActive ? "bg-primary/12" : "",
            )}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" />
          </div>
          <span
            className={cn(
              "text-[10px] leading-none",
              isMoreActive ? "font-semibold" : "font-medium",
            )}
          >
            More
          </span>
        </button>
      </nav>

      {/* ── More Drawer (Slide-up Sheet) ── */}
      <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogPrimitive.Portal>
          {/* Backdrop */}
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden"
          />

          {/* Sheet Panel */}
          <DialogPrimitive.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 md:hidden focus:outline-none"
            style={{ paddingBottom: "env(safe-area-inset-bottom)", maxHeight: "80dvh" }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <DialogPrimitive.Title className="text-sm font-semibold text-foreground">
                All Features
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="w-4 h-4" />
              </DialogPrimitive.Close>
            </div>

            {/* Grid of routes */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(80dvh - 100px)" }}>
              <div className="grid grid-cols-3 gap-2.5 p-4">
                {drawerItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-2xl border transition-all duration-150 active:scale-95 select-none min-w-0",
                        isActive
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/80",
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center",
                          isActive
                            ? "bg-primary/15"
                            : "bg-background/80",
                        )}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                      </div>
                      <span className="text-[11px] font-medium leading-tight text-center line-clamp-2 w-full">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
