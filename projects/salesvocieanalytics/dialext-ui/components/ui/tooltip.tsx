import * as React from "react"

import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, children, content }, ref) => (
    <div
      ref={ref}
      className={cn("group relative inline-block", className)}
    >
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
        {content}
      </div>
    </div>
  )
)
Tooltip.displayName = "Tooltip"

export { Tooltip }
