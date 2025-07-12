"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "../../lib/utils"
const MyTooltipProvider = TooltipPrimitive.Provider
const MyTooltipRoot = TooltipPrimitive.Root
const MyTooltipTrigger = TooltipPrimitive.Trigger
const MyTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>((props, ref) => {
  const {
    className,
    sideOffset = 4,
    ...restProps
  } = props

  const mergedClasses = cn(
    "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    className
  )

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={mergedClasses}
      {...restProps}
    />
  )
})

MyTooltipContent.displayName = TooltipPrimitive.Content.displayName

export {
  MyTooltipRoot as Tooltip,
  MyTooltipTrigger as TooltipTrigger,
  MyTooltipContent as TooltipContent,
  MyTooltipProvider as TooltipProvider,
}
