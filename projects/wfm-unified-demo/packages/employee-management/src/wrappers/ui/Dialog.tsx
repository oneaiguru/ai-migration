import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { type CSSProperties, type ReactNode, useId } from "react";
import {
  colorVar,
  focusRing,
  fontSizeVar,
  fontVar,
  fontWeightVar,
  lineHeightVar,
  durationVar,
  radiusVar,
  shadowVar,
  spacingVar,
  zIndexVar,
} from "../shared/tokens";

export type DialogSize = "sm" | "md" | "lg";
export type DialogVariant = "modal" | "sheet";

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  variant?: DialogVariant;
  testId?: string;
  closeLabel?: string;
  preventClose?: boolean;
  overlayStyles?: CSSProperties;
  contentStyles?: CSSProperties;
  overlayClassName?: string;
  contentClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  portalContainer?: HTMLElement | null;
  titleHidden?: boolean;
  descriptionHidden?: boolean;
}

const sizeStyles: Record<DialogSize, CSSProperties> = {
  sm: {
    width: "min(420px, calc(100vw - 2 * var(--em-spacing-xl)))",
  },
  md: {
    width: "min(560px, calc(100vw - 2 * var(--em-spacing-xl)))",
  },
  lg: {
    width: "min(720px, calc(100vw - 2 * var(--em-spacing-xl)))",
  },
};

const modalContentBase: CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: colorVar("surface"),
  borderRadius: radiusVar("lg"),
  padding: `${spacingVar("xl")} ${spacingVar("2xl")}`,
  maxHeight: "calc(100vh - 2 * var(--em-spacing-2xl))",
  overflowY: "auto",
  boxShadow: shadowVar("lg"),
  zIndex: zIndexVar("modal"),
};

const sheetContentBase: CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  width: "min(720px, 100vw)",
  backgroundColor: colorVar("surface"),
  borderTopLeftRadius: radiusVar("lg"),
  borderBottomLeftRadius: radiusVar("lg"),
  borderLeft: `1px solid ${colorVar("borderMuted")}`,
  padding: `${spacingVar("xl")} ${spacingVar("2xl")}`,
  overflowY: "auto",
  boxShadow: shadowVar("lg"),
  zIndex: zIndexVar("modal"),
};

const overlayStyles: Record<DialogVariant, CSSProperties> = {
  modal: {
    position: "fixed",
    inset: 0,
    backgroundColor: colorVar("backdrop"),
    zIndex: zIndexVar("modal"),
  },
  sheet: {
    position: "fixed",
    inset: 0,
    backgroundColor: colorVar("backdrop"),
    zIndex: zIndexVar("modal"),
  },
};

const contentVariants: Record<DialogVariant, CSSProperties> = {
  modal: modalContentBase,
  sheet: sheetContentBase,
};

const closeButtonStyle: CSSProperties = {
  position: "absolute",
  top: spacingVar("sm"),
  right: spacingVar("sm"),
  border: "none",
  borderRadius: radiusVar("pill"),
  backgroundColor: "transparent",
  color: colorVar("mutedForeground"),
  padding: spacingVar("xs"),
  cursor: "pointer",
  lineHeight: 1,
  fontSize: "20px",
  transition: `color ${durationVar("fast")} ease`,
};

const titleStyle: CSSProperties = {
  fontFamily: fontVar("fontFamilyHeading"),
  fontSize: fontSizeVar("sizeXl"),
  fontWeight: fontWeightVar("fontWeightSemibold"),
  color: colorVar("emphasisForeground"),
  margin: 0,
  marginBottom: spacingVar("sm"),
};

const descriptionStyle: CSSProperties = {
  fontFamily: fontVar("fontFamily"),
  fontSize: fontSizeVar("sizeSm"),
  lineHeight: lineHeightVar("lineHeightRelaxed"),
  color: colorVar("mutedForeground"),
  margin: 0,
  marginBottom: spacingVar("lg"),
};

const bodyStyle: CSSProperties = {
  display: "grid",
  gap: spacingVar("lg"),
  marginBottom: spacingVar("xl"),
};

const footerStyle: CSSProperties = {
  display: "flex",
  gap: spacingVar("sm"),
  justifyContent: "flex-end",
  alignItems: "center",
};

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = "md",
  variant = "modal",
  testId,
  closeLabel = "Закрыть",
  preventClose = false,
  overlayStyles: overlayOverrides,
  contentStyles: contentOverrides,
  overlayClassName,
  contentClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  ariaLabelledBy,
  ariaDescribedBy,
  portalContainer,
  titleHidden = false,
  descriptionHidden = false,
}: DialogProps) {
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();

  const hasTitle = Boolean(title && title.trim().length > 0);
  const hasDescription = Boolean(description && description.trim().length > 0);

  const contentLabelledBy = ariaLabelledBy ?? (hasTitle ? generatedTitleId : undefined);
  const contentDescribedBy = ariaDescribedBy ?? (hasDescription ? `${generatedDescriptionId}-desc` : undefined);
  const shouldAttachGeneratedTitleId = ariaLabelledBy === undefined && hasTitle;
  const shouldAttachGeneratedDescriptionId = ariaDescribedBy === undefined && hasDescription;

  const contentBase = contentVariants[variant];
  const overlayBase = overlayStyles[variant];
  const mergedContentStyle: CSSProperties = {
    ...contentBase,
    ...sizeStyles[size],
    ...contentOverrides,
  };
  const mergedOverlayStyle: CSSProperties = {
    ...overlayBase,
    ...overlayOverrides,
  };

  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal container={portalContainer ?? undefined}>
        <DialogPrimitive.Overlay
          data-testid={testId ? `${testId}-overlay` : undefined}
          style={mergedOverlayStyle}
          className={overlayClassName}
        />
        <DialogPrimitive.Content
          data-testid={testId}
          aria-describedby={contentDescribedBy}
          aria-labelledby={contentLabelledBy}
          data-variant={variant}
          style={mergedContentStyle}
          className={contentClassName}
          onPointerDownOutside={(event) => {
            if (preventClose || !closeOnOverlayClick) {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (preventClose || !closeOnEscape) {
              event.preventDefault();
            }
          }}
        >
          {!preventClose && showCloseButton && (
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                style={closeButtonStyle}
                onFocus={(event) => {
                  event.currentTarget.style.boxShadow = `0 0 0 2px ${focusRing()}`;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.boxShadow = "none";
                }}
              >
                ×
              </button>
            </DialogPrimitive.Close>
          )}

          {hasTitle ? (
            <DialogPrimitive.Title
              id={shouldAttachGeneratedTitleId ? generatedTitleId : undefined}
              style={titleHidden ? undefined : titleStyle}
              asChild={titleHidden}
            >
              {titleHidden ? <VisuallyHidden>{title}</VisuallyHidden> : title}
            </DialogPrimitive.Title>
          ) : null}

          {hasDescription ? (
            <DialogPrimitive.Description
              id={shouldAttachGeneratedDescriptionId ? `${generatedDescriptionId}-desc` : undefined}
              style={descriptionHidden ? undefined : descriptionStyle}
              asChild={descriptionHidden}
            >
              {descriptionHidden ? <VisuallyHidden>{description}</VisuallyHidden> : description}
            </DialogPrimitive.Description>
          ) : null}

          <section style={bodyStyle}>{children}</section>

          {footer ? <footer style={footerStyle}>{footer}</footer> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
