"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Command, CreditCard, Folder, Wallet, FileText } from "lucide-react";
import { useLazyGlobalSearchQuery } from "@/services/searchApi";
import { useLazyGlobalAdminSearchQuery } from "@/services/adminApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce"; // Need to make sure this hook exists or use inline debounce

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [triggerUserSearch, { data: userData, isFetching: isUserFetching }] = useLazyGlobalSearchQuery();
  const [triggerAdminSearch, { data: adminData, isFetching: isAdminFetching }] = useLazyGlobalAdminSearchQuery();
  
  const isFetching = isUserFetching || isAdminFetching;
  const results = (user?.isAdmin ? adminData?.data : userData?.data) || [];

  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle with Ctrl+K / Cmd+K
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

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      if (user?.isAdmin) {
        triggerAdminSearch(debouncedQuery);
      } else {
        triggerUserSearch(debouncedQuery);
      }
    }
  }, [debouncedQuery, triggerUserSearch, triggerAdminSearch, user]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "transaction": return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "category": return <Folder className="w-4 h-4 text-indigo-500" />;
      case "account": return <Wallet className="w-4 h-4 text-blue-500" />;
      case "bill": return <FileText className="w-4 h-4 text-purple-500" />;
      case "user": return <Folder className="w-4 h-4 text-emerald-500" />;
      case "admin": return <Wallet className="w-4 h-4 text-rose-500" />;
      default: return <Command className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-medium font-mono text-muted-foreground ml-4">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl gap-0">
          <div className="flex items-center border-b border-border px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions, accounts, bills..."
              className="flex-1 bg-transparent border-none outline-none ring-0 px-3 py-2 text-foreground placeholder:text-muted-foreground text-base"
              autoFocus
            />
            {isFetching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />}
            {query && (
              <button onClick={() => setQuery("")} className="p-1 rounded-full hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.length < 2 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </div>
            ) : results.length === 0 && !isFetching ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No results found for <span className="font-bold text-foreground">"{query}"</span>
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
                      <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-border px-4 py-2 bg-secondary/30 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            <span>ExpenseVault Search</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
