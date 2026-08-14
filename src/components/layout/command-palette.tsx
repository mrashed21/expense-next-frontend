"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { getNavGroups } from "@/lib/navigation";
import { useGlobalAdminSearchQuery } from "@/services/admin-api";
import { useGlobalSearchQuery } from "@/services/search-api";
import {
  Command,
  CreditCard,
  FileText,
  Folder,
  LayoutDashboard,
  Loader2,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: userData, isFetching: isUserFetching } =
    useGlobalSearchQuery(debouncedQuery, {
      skip: !debouncedQuery || debouncedQuery.length < 2 || !!user?.isAdmin,
    });
  const { data: adminData, isFetching: isAdminFetching } =
    useGlobalAdminSearchQuery(debouncedQuery, {
      skip: !debouncedQuery || debouncedQuery.length < 2 || !user?.isAdmin,
    });

  const isFetching = isUserFetching || isAdminFetching;
  
  // Get frontend routes
  const routeResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    
    const allGroups = getNavGroups(user);
    const searchLower = debouncedQuery.toLowerCase();
    const matches: any[] = [];
    
    allGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.name.toLowerCase().includes(searchLower)) {
          matches.push({
            id: item.href,
            type: "route",
            title: item.name,
            subtitle: `Route • ${group.label}`,
            url: item.href,
          });
        }
      });
    });
    
    return matches;
  }, [debouncedQuery, user]);

  const apiResults = (user?.isAdmin ? adminData?.data : userData?.data) || [];
  const results = [...routeResults, ...apiResults];

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);


  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "category":
        return <Folder className="w-4 h-4 text-indigo-500" />;
      case "account":
        return <Wallet className="w-4 h-4 text-blue-500" />;
      case "bill":
        return <FileText className="w-4 h-4 text-purple-500" />;
      case "user":
        return <Folder className="w-4 h-4 text-emerald-500" />;
      case "admin":
        return <Wallet className="w-4 h-4 text-rose-500" />;
      case "route":
        return <LayoutDashboard className="w-4 h-4 text-sky-500" />;
      default:
        return <Command className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg sm:border sm:border-border sm:bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Global Search"
      >
        <Search className="w-5 h-5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline-block text-sm">Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-medium font-mono text-muted-foreground ml-4">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-137.5 p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl gap-0 [&>button.absolute]:hidden">
          <div className="flex items-center border-b border-border px-3 sm:px-4 py-3 gap-2">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                user?.isAdmin
                  ? "Search users and admins by name or email..."
                  : "Search transactions, accounts, bills..."
              }
              className="flex-1 min-w-0 bg-transparent border-none outline-none ring-0 py-1 text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-muted-foreground shrink-0" />
            )}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="sm:hidden text-xs font-medium text-muted-foreground hover:text-foreground px-1 py-1.5 shrink-0"
            >
              Cancel
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.length < 2 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </div>
            ) : results.length === 0 && !isFetching ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No results found for{" "}
                <span className="font-bold text-foreground">"{query}"</span>
                {user?.isAdmin && (
                  <p className="mt-2 text-xs opacity-70">
                    Admin search only looks for Users and Admins.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((item: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-2 bg-secondary/30 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            <span>Expense Tracker Search</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
