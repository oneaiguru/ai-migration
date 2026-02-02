import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { CSSProperties, ReactNode } from "react";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "transparent",
};

const contentStyle: CSSProperties = {
  borderRadius: 12,
  backgroundColor: "white",
  padding: 16,
  minWidth: 240,
  boxShadow: "0 20px 45px rgba(15,23,42,0.15)",
  border: "1px solid #e2e8f0",
};

export function Popover({ trigger, children, align = "center", side = "bottom" }: PopoverProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Overlay style={overlayStyle} />
        <PopoverPrimitive.Content style={contentStyle} sideOffset={8} align={align} side={side}>
          {children}
          <PopoverPrimitive.Arrow width={12} height={6} style={{ fill: "white" }} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
