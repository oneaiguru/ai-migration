import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { colorVar, radiusVar, spacingVar } from "../shared/tokens";
import { FormField, formFieldAriaProps } from "./FormField";

const schema = z.object({
  login: z.string().min(4, "Минимум 4 символа"),
  email: z.string().email("Некорректный email"),
  status: z.enum(["active", "trial", "dismissed"]),
});

export type EmployeeFormValues = z.infer<typeof schema>;

export interface EmployeeFormProps {
  onSubmit?: SubmitHandler<EmployeeFormValues>;
  testId?: string;
}

const inputStyle = {
  padding: spacingVar("sm"),
  borderRadius: radiusVar("md"),
  border: `1px solid ${colorVar("borderMuted")}`,
  fontSize: "14px",
  backgroundColor: colorVar("surface"),
  color: colorVar("emphasisForeground"),
};

const selectStyle = {
  ...inputStyle,
};

const formStyle = {
  display: "grid",
  gap: spacingVar("md"),
};

export function EmployeeForm({ onSubmit, testId }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  const {
    id: loginControlId,
    labelId: _loginLabelId,
    ...loginProps
  } = formFieldAriaProps({
    controlId: "employee-login",
    hasError: Boolean(errors.login),
    errorId: errors.login ? "employee-login-error" : undefined,
  });

  const {
    id: emailControlId,
    labelId: _emailLabelId,
    ...emailProps
  } = formFieldAriaProps({
    controlId: "employee-email",
    hasError: Boolean(errors.email),
    errorId: errors.email ? "employee-email-error" : undefined,
  });

  const {
    id: statusControlId,
    labelId: _statusLabelId,
    ...statusProps
  } = formFieldAriaProps({
    controlId: "employee-status",
    hasError: Boolean(errors.status),
    errorId: errors.status ? "employee-status-error" : undefined,
  });

  return (
    <form
      data-testid={testId}
      onSubmit={handleSubmit((values) => onSubmit?.(values))}
      noValidate
      style={formStyle}
    >
      <FormField
        label="Логин"
        required
        fieldId={loginControlId}
        error={errors.login}
      >
        <input
          {...register("login")}
          id={loginControlId}
          {...loginProps}
          style={inputStyle}
          autoComplete="username"
        />
      </FormField>

      <FormField
        label="Email"
        required
        fieldId={emailControlId}
        error={errors.email}
      >
        <input
          type="email"
          {...register("email")}
          id={emailControlId}
          {...emailProps}
          style={inputStyle}
          autoComplete="email"
        />
      </FormField>

      <FormField
        label="Статус"
        fieldId={statusControlId}
        error={errors.status}
      >
        <select
          id={statusControlId}
          {...register("status")}
          {...statusProps}
          style={selectStyle}
        >
          <option value="active">Активен</option>
          <option value="trial">Испытательный</option>
          <option value="dismissed">Уволен</option>
        </select>
      </FormField>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: spacingVar("sm") }}>
        <button
          type="submit"
          style={{
            padding: `${spacingVar("sm")} ${spacingVar("lg")}`,
            borderRadius: radiusVar("md"),
            border: "none",
            backgroundColor: colorVar("primary"),
            color: colorVar("primaryForeground"),
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Сохранить
        </button>
      </div>
    </form>
  );
}
