import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type CSSProperties, type ReactNode } from "react";
import {
  colorVar,
  radiusVar,
  shadowVar,
  spacingVar,
  zIndexVar,
} from "../shared/tokens";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  collisionPadding?: number | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  testId?: string;
  portalContainer?: HTMLElement | null;
  contentStyles?: CSSProperties;
}

const contentStyle: CSSProperties = {
  borderRadius: radiusVar("md"),
  backgroundColor: colorVar("surface"),
  padding: spacingVar("md"),
  minWidth: "220px",
  maxWidth: "320px",
  boxShadow: shadowVar("md"),
  border: `1px solid ${colorVar("borderMuted")}`,
  zIndex: zIndexVar("popover"),
};

const arrowStyle: CSSProperties = {
  fill: colorVar("surface"),
  stroke: colorVar("borderMuted"),
  strokeWidth: 1,
};

export function Popover({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  align = "center",
  side = "bottom",
  sideOffset = 8,
  collisionPadding = 12,
  testId,
  portalContainer,
  contentStyles,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
        <PopoverPrimitive.Content
          data-testid={testId}
          align={align}
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          style={{ ...contentStyle, ...contentStyles }}
        >
          {children}
          <PopoverPrimitive.Arrow width={12} height={6} style={arrowStyle} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;
