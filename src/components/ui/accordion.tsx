"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  openItems: Set<string>;
  toggleItem: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

type AccordionProps = {
  type?: AccordionType;
  defaultValue?: string | string[];
  className?: string;
  children: ReactNode;
};

export function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
}: AccordionProps) {
  const initialOpen = useMemo(() => {
    if (!defaultValue) return new Set<string>();
    if (Array.isArray(defaultValue)) return new Set(defaultValue);
    return new Set([defaultValue]);
  }, [defaultValue]);

  const [openItems, setOpenItems] = useState<Set<string>>(initialOpen);

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(value);

      if (type === "single") {
        next.clear();
        if (!isOpen) next.add(value);
      } else {
        if (isOpen) {
          next.delete(value);
        } else {
          next.add(value);
        }
      }

      return next;
    });
  };

  const contextValue = useMemo(
    () => ({ type, openItems, toggleItem }),
    [type, openItems]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

type AccordionItemProps = {
  value: string;
  className?: string;
  children: ReactNode;
};

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  const accordion = useAccordionContext();
  const isOpen = accordion.openItems.has(value);

  return (
    <AccordionItemContext.Provider value={value}>
      <div
        data-state={isOpen ? "open" : "closed"}
        className={cn("border-b", className)}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

type AccordionTriggerProps = {
  className?: string;
  children: ReactNode;
};

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const accordion = useAccordionContext();
  const value = useAccordionItemContext();
  const isOpen = accordion.openItems.has(value);

  return (
    <button
      type="button"
      onClick={() => accordion.toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between gap-2 py-4 font-medium transition-all hover:underline text-left",
        className
      )}
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      <IconChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

type AccordionContentProps = {
  className?: string;
  children: ReactNode;
};

export function AccordionContent({ className, children }: AccordionContentProps) {
  const accordion = useAccordionContext();
  const value = useAccordionItemContext();
  const isOpen = accordion.openItems.has(value);

  if (!isOpen) return null;

  return (
    <div className={cn("px-4 pb-4 pt-1", className)} data-state="open">
      {children}
    </div>
  );
}

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used inside <Accordion>");
  }
  return context;
}

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionTrigger and AccordionContent must be used inside <AccordionItem>");
  }
  return context;
}
