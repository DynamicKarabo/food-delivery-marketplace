import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SheetContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = (value: boolean) => {
    setUncontrolledOpen(value)
    onOpenChange?.(value)
  }
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ children, asChild, className }: { children: React.ReactNode; asChild?: boolean; className?: string }) {
  const { setOpen } = React.useContext(SheetContext)
  if (asChild && React.isValidElement(children)) {
    return (
      <span className={className} onClick={() => setOpen(true)}>
        {React.cloneElement(children as React.ReactElement, {})}
      </span>
    )
  }
  return (
    <button className={className} onClick={() => setOpen(true)}>{children}</button>
  )
}

function SheetClose({ children, asChild, className }: { children: React.ReactNode; asChild?: boolean; className?: string }) {
  const { setOpen } = React.useContext(SheetContext)
  if (asChild && React.isValidElement(children)) {
    return (
      <span className={className} onClick={() => setOpen(false)}>
        {React.cloneElement(children as React.ReactElement, {})}
      </span>
    )
  }
  return (
    <button className={className} onClick={() => setOpen(false)}>{children}</button>
  )
}

interface SheetContentProps {
  children: React.ReactNode
  side?: "left" | "right" | "top" | "bottom"
  className?: string
}

function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const { open, setOpen } = React.useContext(SheetContext)

  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
    top: "inset-x-0 top-0 w-full h-auto max-h-[50vh] border-b",
    bottom: "inset-x-0 bottom-0 w-full h-auto max-h-[50vh] border-t",
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/80 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed z-50 bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          sideClasses[side],
          open
            ? "translate-x-0 translate-y-0"
            : side === "left"
            ? "-translate-x-full"
            : side === "right"
            ? "translate-x-full"
            : side === "top"
            ? "-translate-y-full"
            : "translate-y-full",
          className
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
