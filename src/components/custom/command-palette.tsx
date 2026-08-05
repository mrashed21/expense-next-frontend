import { useLazySearchDataQuery } from "@/services/data-api";
import { ArrowRight, FileText, Folder, Loader2, Search, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [searchData, { data, isFetching }] = useLazySearchDataQuery();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const timeoutId = setTimeout(() => {
        searchData(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [query, searchData]);

  if (!isOpen) return null;

  const results = data?.data || { transactions: [], accounts: [], categories: [] };
  const hasResults =
    results.transactions.length > 0 ||
    results.accounts.length > 0 ||
    results.categories.length > 0;

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 sm:px-0">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Input area */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Search transactions, accounts, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isFetching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground ml-3" />}
          <button 
            onClick={onClose}
            className="ml-3 p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {query.trim().length <= 1 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search globally across your vault.
            </div>
          ) : !hasResults && !isFetching ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No results found for "{query}".
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {results.accounts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Accounts
                  </h3>
                  {results.accounts.map((acc: any) => (
                    <button
                      key={acc._id}
                      onClick={() => handleNavigate('/accounts')}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: acc.color + "20", color: acc.color }}>
                          <Wallet className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{acc.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.categories.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Categories
                  </h3>
                  {results.categories.map((cat: any) => (
                    <button
                      key={cat._id}
                      onClick={() => handleNavigate('/categories')}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.transactions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Transactions
                  </h3>
                  {results.transactions.map((tx: any) => (
                    <button
                      key={tx._id}
                      onClick={() => handleNavigate('/transactions')}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{tx.notes || "Unnamed Transaction"}</span>
                        <span className="text-xs text-muted-foreground">
                          {tx.category_id?.name || "Uncategorized"} • {new Date(tx.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {tx.type === 'expense' ? '-' : '+'}{tx.amount}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer shortcuts helper */}
        <div className="bg-secondary/50 px-4 py-2 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 bg-background border border-border rounded-md shadow-sm">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-background border border-border rounded-md shadow-sm">↓</kbd>
            <span>to navigate</span>
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 bg-background border border-border rounded-md shadow-sm">Enter</kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Close</span>
            <kbd className="px-1.5 py-0.5 bg-background border border-border rounded-md shadow-sm">Esc</kbd>
          </div>
        </div>

      </div>
    </div>
  );
}
