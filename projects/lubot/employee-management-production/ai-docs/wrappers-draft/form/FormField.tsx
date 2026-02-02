import type { FieldError } from "react-hook-form";
import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";

/**
 * Draft helper mirroring the accessible pattern used in production drawers.
 * Production version adds tokens + VisuallyHidden support – see src/wrappers/form/FormField.tsx.
 */
interface FormFieldProps {
  fieldId?: string;
  label: string;
  children: ReactNode;
  error?: FieldError | string;
  hint?: string;
  required?: boolean;
  testId?: string;
}

const containerStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  display: "inline-flex",
  gap: 4,
};

const hintStyle: CSSProperties = {
  fontSize: 12,
  color: "#64748b",
};

const errorStyle: CSSProperties = {
  ...hintStyle,
  color: "#dc2626",
};

export function getFormFieldLabelId(controlId: string): string {
  return `${controlId}-label`;
}

export function FormField({
  fieldId,
  label,
  children,
  error,
  hint,
  required,
  testId,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = fieldId ?? generatedId;
  const labelId = getFormFieldLabelId(controlId);
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorMessage = typeof error === "string" ? error : error?.message;
  const errorId = errorMessage ? `${controlId}-error` : undefined;

  return (
    <div style={containerStyle} data-testid={testId}>
      <label id={labelId} htmlFor={controlId} style={labelStyle}>
        <span>{label}</span>
        {required ? <span aria-hidden>*</span> : null}
      </label>
      {children}
      {errorMessage ? (
        <span id={errorId} role="alert" style={errorStyle}>
          {errorMessage}
        </span>
      ) : hint ? (
        <span id={hintId} style={hintStyle}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export interface FormFieldAriaParams {
  controlId: string;
  hasError: boolean;
  hintId?: string;
  errorId?: string;
  labelId?: string;
}

export interface FormFieldAriaResult {
  id: string;
  labelId: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function formFieldAriaProps({
  controlId,
  hasError,
  hintId,
  errorId,
  labelId,
}: FormFieldAriaParams): FormFieldAriaResult {
  const resolvedLabelId = labelId ?? getFormFieldLabelId(controlId);

  return {
    id: controlId,
    labelId: resolvedLabelId,
    "aria-invalid": hasError || undefined,
    "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
  };
}
