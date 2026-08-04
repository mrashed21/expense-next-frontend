"use client";

import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Receipt,
  ShieldAlert,
  User,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

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
  { name: "Health", href: "/admin/system-health", icon: ShieldAlert },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const itemsToRender = user?.isAdmin ? adminMobileItems : mobileItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 flex items-center px-2 shadow-2xl shadow-black/10 pb-[env(safe-area-inset-bottom)] box-content">
      {itemsToRender.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1.5 gap-1 rounded-xl transition-all duration-200 active:scale-95 select-none",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150",
                isActive ? "bg-primary/10" : "",
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 transition-transform duration-150",
                  isActive && "scale-110",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isActive && "font-semibold",
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
