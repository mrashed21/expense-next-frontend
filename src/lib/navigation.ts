import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  Bell,
  CalendarDays,
  FileCheck,
  FileText,
  Grid,
  HandCoins,
  Home,
  Landmark,
  LayoutDashboard,
  Megaphone,
  PiggyBank,
  Receipt,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Sections shown to a regular user, in sidebar / drawer order. */
export const userNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Money",
    items: [
      { name: "Transactions", href: "/transactions", icon: Receipt },
      { name: "Accounts", href: "/accounts", icon: Wallet },
      { name: "Transfers", href: "/transfers", icon: ArrowRightLeft },
      { name: "Lending", href: "/lending", icon: Landmark },
      { name: "Categories", href: "/categories", icon: Grid },
    ],
  },
  {
    label: "Planning",
    items: [
      { name: "Budgets", href: "/budgets", icon: PiggyBank },
      { name: "Goals", href: "/goals", icon: Target },
      { name: "Bills", href: "/bills", icon: FileCheck },
      { name: "Recurring", href: "/recurring", icon: RefreshCw },
      { name: "Installments", href: "/installments", icon: CalendarDays },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { name: "Net Worth", href: "/net-worth", icon: TrendingUp },
      { name: "Investments", href: "/investments", icon: TrendingUp },
      { name: "Assets", href: "/assets", icon: Home },
      { name: "Debts", href: "/debts", icon: HandCoins },
    ],
  },
];

/** Sections shown to an admin, in sidebar / drawer order. */
export const adminNavGroups: NavGroup[] = [
  {
    label: "Administration",
    items: [
      { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Activity", href: "/admin/activity", icon: Activity },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      {
        name: "System Health",
        href: "/admin/system-health",
        icon: ShieldAlert,
      },
    ],
  },
];

/** Extra admin sections only a super admin may open. */
export const superAdminNavGroups: NavGroup[] = [
  {
    label: "Super Admin",
    items: [
      { name: "Logs", href: "/admin/logs", icon: ScrollText },
      { name: "Broadcast", href: "/admin/broadcast", icon: Megaphone },
      { name: "Admins", href: "/admin/admins", icon: ShieldAlert },
    ],
  },
];

/** Personal section, pinned to the bottom of the sidebar for every role. */
export const accountNavItems: NavItem[] = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

/**
 * The four routes that get a permanent slot in the mobile bottom bar.
 * Everything else lives one tap away behind the "More" drawer.
 */
export const mobileTabs: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export const adminMobileTabs: NavItem[] = [
  { name: "Home", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Activity", href: "/admin/activity", icon: Activity },
  { name: "Health", href: "/admin/system-health", icon: ShieldAlert },
];

type Role = { isAdmin?: boolean; user_role?: string } | null | undefined;

/** Every group a given user is allowed to see, account section included. */
export function getNavGroups(user: Role): NavGroup[] {
  const groups = user?.isAdmin
    ? [
        ...adminNavGroups,
        ...(user?.user_role === "super_admin" ? superAdminNavGroups : []),
      ]
    : userNavGroups;

  const accountItems = user?.isAdmin
    ? accountNavItems.filter((item) => item.href !== "/notifications")
    : accountNavItems;

  return [...groups, { label: "Account", items: accountItems }];
}

export function getMobileTabs(user: Role): NavItem[] {
  return user?.isAdmin ? adminMobileTabs : mobileTabs;
}

/** Active when the path is the route itself or any of its children. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
