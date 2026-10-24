"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  SendHorizonal,
  Settings,
  ShieldAlert,
  Star,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "../../lib/utils";
import { accountNavItems, userNavGroups } from "../../lib/navigation";
import { toggleSidebar } from "../../redux/slices/layout-slice";
import { RootState } from "../../redux/store";

const adminItems = [
  { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Send Notification", href: "/admin/send-notification", icon: SendHorizonal },
  { name: "Activity", href: "/admin/activity", icon: Activity },
  { name: "Feedbacks", href: "/admin/feedbacks", icon: MessageSquare },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "System Health", href: "/admin/system-health", icon: ShieldAlert },
];

const superAdminItems = [
  { name: "Logs", href: "/admin/logs", icon: ScrollText },
  { name: "Admins", href: "/admin/admins", icon: ShieldAlert },
];

const bottomItems = [
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

import React, { useMemo } from "react";

const NavItem = React.memo(
  ({
    item,
    pathname,
    sidebarCollapsed,
    isSubItem = false,
  }: {
    item: { name: string; href: string; icon: React.ElementType };
    pathname: string;
    sidebarCollapsed: boolean;
    isSubItem?: boolean;
  }) => {
    const isActive =
      item.href === "/admin" || item.href === "/dashboard"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    const link = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-150 group",
          isSubItem && !sidebarCollapsed ? "ml-3 text-xs" : "text-sm",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0",
            isActive
              ? "text-primary-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        />
        {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  },
);
NavItem.displayName = "NavItem";

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state: RootState) => state.layout);
  const { user } = useSelector((state: RootState) => state.auth);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        userNavGroups.map((group) => [
          group.label,
          group.items.some(
            (item) =>
              pathname === item.href || pathname.startsWith(`${item.href}/`),
          ),
        ]),
      ),
  );

  React.useEffect(() => {
    const activeGroup = userNavGroups.find((group) =>
      group.items.some(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      ),
    );
    if (activeGroup && !openGroups[activeGroup.label]) {
      setOpenGroups((current) => ({ ...current, [activeGroup.label]: true }));
    }
  }, [pathname, openGroups]);

  const renderNavItems = useMemo(() => {
    if (user?.isAdmin) {
      return (
        <>
          <div className="my-2 px-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
            {!sidebarCollapsed && "Administration"}
          </div>
          {adminItems.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              pathname={pathname}
              sidebarCollapsed={sidebarCollapsed}
              isSubItem
            />
          ))}
          {user?.user_role === "super_admin" &&
            superAdminItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
              />
            ))}
        </>
      );
    }
    return userNavGroups.map((group) => {
      const isOpen = openGroups[group.label] ?? true;
      return (
        <div key={group.label} className="space-y-1">
          <button
            type="button"
            onClick={() =>
              setOpenGroups((current) => ({
                ...current,
                [group.label]: !isOpen,
              }))
            }
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground",
              sidebarCollapsed && "justify-center px-0",
            )}
            title={sidebarCollapsed ? group.label : undefined}
          >
            <Folder className="h-3.5 w-3.5 shrink-0" />
            {!sidebarCollapsed && <span>{group.label}</span>}
            {!sidebarCollapsed && (
              <ChevronDown
                className={cn(
                  "ml-auto h-3.5 w-3.5 transition-transform",
                  !isOpen && "-rotate-90",
                )}
              />
            )}
          </button>
          {isOpen &&
            group.items.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
              />
            ))}
        </div>
      );
    });
  }, [user, pathname, sidebarCollapsed, openGroups]);

  const renderBottomItems = useMemo(() => {
    const items = user?.isAdmin
      ? bottomItems.filter((item) => item.href !== "/feedback")
      : [
          accountNavItems.find((item) => item.href === "/notifications")!,
          ...bottomItems,
        ];
    return items.map((item) => (
      <NavItem
        key={item.name}
        item={item}
        pathname={pathname}
        sidebarCollapsed={sidebarCollapsed}
      />
    ));
  }, [user, pathname, sidebarCollapsed]);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 z-30 sticky top-0 self-start h-screen shadow-[1px_0_4px_hsl(214_25%_20%/0.04)]",
          sidebarCollapsed ? "w-15" : "w-60",
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-border shrink-0",
            sidebarCollapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          {!sidebarCollapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-sm">
                  E
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                  Expense Tracker
                </span>
              </div>
            </Link>
          )}

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebar())}
                className="w-7 h-7 shrink-0 text-muted-foreground hover:text-foreground"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {renderNavItems}
        </div>

        {/* Bottom Nav */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          {renderBottomItems}
        </div>
      </aside>
    </TooltipProvider>
  );
}
