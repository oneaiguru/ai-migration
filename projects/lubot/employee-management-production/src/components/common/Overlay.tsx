import { type CSSProperties, type ReactNode } from 'react';
import { Dialog } from '../../wrappers/ui/Dialog';

export type OverlayVariant = 'modal' | 'sheet';

interface OverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: OverlayVariant;
  title: string;
  description?: string;
  preventClose?: boolean;
  children: ReactNode;
  testId?: string;
  contentClassName?: string;
  overlayClassName?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  contentStyles?: CSSProperties;
  overlayStyles?: CSSProperties;
  titleHidden?: boolean;
  descriptionHidden?: boolean;
}

export function Overlay({
  open,
  onOpenChange,
  variant = 'modal',
  title,
  description,
  preventClose = false,
  children,
  testId,
  contentClassName,
  overlayClassName,
  ariaLabelledBy,
  ariaDescribedBy,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  contentStyles,
  overlayStyles,
  titleHidden = false,
  descriptionHidden = false,
}: OverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          onOpenChange(false);
        }
      }}
      variant={variant === 'sheet' ? 'sheet' : 'modal'}
      title={title}
      description={description}
      preventClose={preventClose}
      testId={testId}
      contentStyles={{ backgroundColor: '#ffffff', ...(contentStyles ?? {}) }}
      overlayStyles={overlayStyles}
      overlayClassName={overlayClassName}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
      showCloseButton={showCloseButton}
      ariaLabelledBy={ariaLabelledBy}
      ariaDescribedBy={ariaDescribedBy}
      titleHidden={titleHidden}
      descriptionHidden={descriptionHidden}
    >
      <div
        className={
          variant === 'sheet'
            ? contentClassName ?? 'flex h-full flex-col overflow-y-auto'
            : contentClassName
        }
      >
        {children}
      </div>
    </Dialog>
  );
}
