"use client"

import * as React from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  openItems: string[]
  toggleItem: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)
const AccordionItemContext = React.createContext<string>("")

interface AccordionProps {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children: React.ReactNode
  className?: string
}

function Accordion({ 
  type = "single", 
  defaultValue, 
  value: controlledValue,
  onValueChange,
  children,
  className 
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
    defaultValue 
      ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue])
      : []
  )
  
  const openItems = controlledValue !== undefined 
    ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue]).filter(Boolean)
    : uncontrolledValue

  const toggleItem = React.useCallback((itemValue: string) => {
    let newValue: string[]
    if (type === "multiple") {
      newValue = openItems.includes(itemValue)
        ? openItems.filter((v) => v !== itemValue)
        : [...openItems, itemValue]
    } else {
      newValue = openItems.includes(itemValue) ? [] : [itemValue]
    }
    
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(type === "single" ? newValue[0] || "" : newValue)
  }, [openItems, type, controlledValue, onValueChange])

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn("space-y-1", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("border-b", className)} data-value={value}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { itemValue: value } as any)
          }
          return child
        })}
      </div>
    </AccordionItemContext.Provider>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  itemValue?: string
}

function AccordionTrigger({ children, className, itemValue: propItemValue }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionTrigger must be used within Accordion")
  
  const contextItemValue = React.useContext(AccordionItemContext)
  const itemValue = propItemValue || contextItemValue
  const isOpen = context.openItems.includes(itemValue)

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(itemValue || "")}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left",
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <IconChevronDown 
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )} 
      />
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  itemValue?: string
}

function AccordionContent({ children, className, itemValue: propItemValue }: AccordionContentProps) {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionContent must be used within Accordion")
  
  const contextItemValue = React.useContext(AccordionItemContext)
  const itemValue = propItemValue || contextItemValue
  const isOpen = context.openItems.includes(itemValue)

  if (!isOpen) return null

  return (
    <div className={cn("overflow-hidden text-sm pb-4 pt-0", className)}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
