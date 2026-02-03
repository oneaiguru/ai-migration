import * as React from "react"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      className={cn(
        "h-6 w-11 appearance-none rounded-full bg-gray-300 transition-colors checked:bg-primary cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Switch.displayName = "Switch"

export { Switch }
