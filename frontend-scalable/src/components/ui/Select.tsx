"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Select({
  children,
  defaultValue,
  value,
  onValueChange,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(
    value || defaultValue
  )
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref])

  return (
    <div className="relative" ref={ref}>
      <SelectContext.Provider
        value={{
          open,
          setOpen,
          selectedValue,
          setSelectedValue,
          onValueChange,
        }}
      >
        {children}
      </SelectContext.Provider>
    </div>
  )
}

interface SelectContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedValue: string | undefined
  setSelectedValue: React.Dispatch<React.SetStateAction<string | undefined>>
  onValueChange?: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined
)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select compound components must be used within Select")
  }
  return context
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, selectedValue } = useSelectContext()

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
      {open ? (
        <ChevronUp className="h-4 w-4 opacity-50" />
      ) : (
        <ChevronDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  )
}

interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { selectedValue } = useSelectContext()

  return (
    <span>{selectedValue ? selectedValue : placeholder || "Select an option"}</span>
  )
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function SelectContent({
  className,
  children,
  ...props
}: SelectContentProps) {
  const { open } = useSelectContext()

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-900 shadow-md animate-in fade-in-80 mt-1 w-full",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  value: string
}

export function SelectItem({
  className,
  children,
  value,
  ...props
}: SelectItemProps) {
  const { selectedValue, setSelectedValue, onValueChange, setOpen } = useSelectContext()
  const isSelected = selectedValue === value

  const handleSelect = () => {
    setSelectedValue(value)
    if (onValueChange) {
      onValueChange(value)
    }
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected ? "bg-gray-100" : "",
        className
      )}
      onClick={handleSelect}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export default Select
