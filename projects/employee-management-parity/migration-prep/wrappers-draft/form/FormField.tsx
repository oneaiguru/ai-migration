import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  input: ReactNode;
  error?: FieldError;
  hint?: string;
}

export function FormField({ label, input, error, hint }: FormFieldProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      {input}
      {error ? (
        <span role="alert" style={{ color: "#dc2626", fontSize: 12 }}>
          {error.message}
        </span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{hint}</span>
      ) : null}
    </label>
  );
}
