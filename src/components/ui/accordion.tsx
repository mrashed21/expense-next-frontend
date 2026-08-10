"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

const AccordionContext = React.createContext<{
  openValue: string | null;
  toggleValue: (value: string) => void;
}>({ openValue: null, toggleValue: () => {} });

export function Accordion({
  children,
  type = "single",
  collapsible = true,
  className,
}: {
  children: React.ReactNode;
  type?: "single";
  collapsible?: boolean;
  className?: string;
}) {
  const [openValue, setOpenValue] = React.useState<string | null>(null);

  const toggleValue = (value: string) => {
    setOpenValue((prev) => (prev === value && collapsible ? null : value));
  };

  return (
    <AccordionContext.Provider value={{ openValue, toggleValue }}>
      <div className={cn("divide-y divide-border", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
}: AccordionItemProps) {
  const { openValue, toggleValue } = React.useContext(AccordionContext);
  const isOpen = openValue === value;

  return (
    <div
      className={cn(
        "py-2 border-b border-border/60 last:border-b-0",
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            onClick: () => toggleValue(value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function AccordionTrigger({
  children,
  className,
  onClick,
  isOpen,
}: AccordionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between py-4 font-semibold text-left text-sm transition-all hover:text-primary",
        isOpen ? "text-primary font-bold" : "text-foreground",
        className,
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180 text-primary",
        )}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  className,
  isOpen,
}: AccordionContentProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "pb-4 pt-1 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}
