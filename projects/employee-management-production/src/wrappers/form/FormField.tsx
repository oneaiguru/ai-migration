import type { FieldError } from "react-hook-form";
import { type ReactNode, useId } from "react";
import {
  colorVar,
  fontSizeVar,
  fontVar,
  fontWeightVar,
  lineHeightVar,
  spacingVar,
} from "../shared/tokens";

export function getFormFieldLabelId(controlId: string): string {
  return `${controlId}-label`;
}

interface FormFieldProps {
  fieldId?: string;
  label: string;
  children: ReactNode;
  error?: FieldError | string;
  hint?: string;
  required?: boolean;
  testId?: string;
}

const baseContainerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: spacingVar("xs"),
};

const labelStyle = {
  fontFamily: fontVar("fontFamily"),
  fontSize: fontSizeVar("sizeSm"),
  fontWeight: fontWeightVar("fontWeightSemibold"),
  color: colorVar("emphasisForeground"),
  display: "inline-flex",
  alignItems: "center",
  gap: spacingVar("2xs"),
};

const hintStyle = {
  fontFamily: fontVar("fontFamily"),
  fontSize: fontSizeVar("sizeXs"),
  lineHeight: lineHeightVar("lineHeightRelaxed"),
  color: colorVar("mutedForeground"),
};

const errorStyle = {
  ...hintStyle,
  color: colorVar("danger"),
};

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
    <div style={baseContainerStyle} data-testid={testId}>
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
  labelId?: string;
  hintId?: string;
  errorId?: string;
}

export interface FormFieldAriaResult {
  id: string;
  labelId: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export const formFieldAriaProps = ({
  controlId,
  hasError,
  labelId,
  hintId,
  errorId,
}: FormFieldAriaParams): FormFieldAriaResult => {
  const resolvedLabelId = labelId ?? getFormFieldLabelId(controlId);

  return {
    id: controlId,
    labelId: resolvedLabelId,
    "aria-invalid": hasError || undefined,
    "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
  };
};
