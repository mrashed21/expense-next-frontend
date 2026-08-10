"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtime } from "@/hooks/use-realtime";
import { logout } from "@/redux/slices/auth-slice";
import { RootState } from "@/redux/store";
import {
  useLogoutAllDevicesMutation,
  useLogoutMutation,
} from "@/services/auth-api";
import { useGetNotificationsQuery } from "@/services/notification-api";
import {
  LogOut,
  Plus,
  Settings,
  ShieldAlert,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { CommandPalette } from "./command-palette";
import { NotificationDropdown } from "./notification-dropdown";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutMutation();
  const [logoutAllApi] = useLogoutAllDevicesMutation();

  useRealtime();

  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    skip: user?.isAdmin,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });
  const unreadCount = useMemo(
    () => (notificationsData?.data || []).filter((n: any) => !n.is_read).length,
    [notificationsData],
  );

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
      dispatch(logout());
      toast.success("Logged out successfully.");
      router.push("/login");
    } catch {
      dispatch(logout());
      router.push("/login");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllApi({}).unwrap();
      dispatch(logout());
      toast.success("Logged out from all devices.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to logout all devices");
    }
  };

  const userInitials = user?.user_name
    ? user.user_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-20 h-14 bg-card border-b border-border px-4 md:px-5 flex items-center justify-between gap-3">
      {/* Left: Mobile Brand / Desktop Search */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile brand */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Expense Tracker</span>
        </div>

        {/* Desktop Search */}
        <div className="hidden sm:flex items-center gap-2">
          <CommandPalette />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Quick Add */}
        <Button
          asChild
          size="sm"
          className="hidden sm:inline-flex h-8 text-xs gap-1.5 px-3"
        >
          <Link href="/transactions?action=add">
            <Plus className="w-3.5 h-3.5" />
            Add
          </Link>
        </Button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle - hidden on mobile to save space */}
        <span className="hidden sm:inline-flex">
          <ThemeToggle />
        </span>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-1.5 gap-2 hover:bg-secondary"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={user?.user_profile_image}
                  alt={user?.user_name || "User"}
                />
                <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-22.5 truncate">
                {user?.user_name || "Account"}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="px-3 py-2">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.user_name || "Account"}
              </p>
              <p className="text-[11px] text-muted-foreground font-normal truncate mt-0.5">
                {user?.user_email || ""}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogoutAll}
              className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/20 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Logout all devices
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
              className="cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
