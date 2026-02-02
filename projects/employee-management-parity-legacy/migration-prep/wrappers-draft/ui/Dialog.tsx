import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { CSSProperties, ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15, 23, 42, 0.45)",
};

const contentStyle: CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  borderRadius: 16,
  padding: "28px 32px",
  minWidth: 360,
  maxWidth: 520,
  boxShadow: "0 40px 60px rgba(15,23,42,0.18)",
};

export function Dialog({ open, onOpenChange, title, description, children, footer }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay style={overlayStyle} />
        <DialogPrimitive.Content style={contentStyle} aria-describedby={description ? "dialog-description" : undefined}>
          <DialogPrimitive.Title style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{title}</DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description id="dialog-description" style={{ color: "#475569", marginBottom: 20 }}>
              {description}
            </DialogPrimitive.Description>
          )}
          <section style={{ marginBottom: footer ? 24 : 0 }}>{children}</section>
          {footer && <footer>{footer}</footer>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
