import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, formFieldAriaProps } from "./FormField";

/** Demo-only form showing RHF + Zod wiring for planners. */
const schema = z.object({
  login: z.string().min(1, "Укажите логин"),
  email: z.string().email("Введите корректный email"),
  status: z.enum(["active", "trial", "dismissed"]),
});

type EmployeeFormValues = z.infer<typeof schema>;

export function EmployeeForm({ onSubmit }: { onSubmit?: (values: EmployeeFormValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      login: "",
      email: "",
      status: "active",
    },
  });

  const loginIds = formFieldAriaProps({
    controlId: "demo-login",
    hasError: Boolean(errors.login),
    errorId: errors.login ? "demo-login-error" : undefined,
  });

  const emailIds = formFieldAriaProps({
    controlId: "demo-email",
    hasError: Boolean(errors.email),
    hintId: "demo-email-hint",
    errorId: errors.email ? "demo-email-error" : undefined,
  });

  const statusIds = formFieldAriaProps({
    controlId: "demo-status",
    hasError: Boolean(errors.status),
    errorId: errors.status ? "demo-status-error" : undefined,
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit?.(values))} style={{ display: "grid", gap: 16 }}>
      <FormField fieldId={loginIds.id} label="Логин" error={errors.login} required>
        <input
          {...register("login")}
          id={loginIds.id}
          aria-labelledby={loginIds.labelId}
          aria-invalid={loginIds["aria-invalid"]}
          aria-describedby={loginIds["aria-describedby"]}
        />
      </FormField>

      <FormField
        fieldId={emailIds.id}
        label="Email"
        error={errors.email}
        hint="Используйте корпоративный адрес"
        required
      >
        <input
          type="email"
          {...register("email")}
          id={emailIds.id}
          aria-labelledby={emailIds.labelId}
          aria-invalid={emailIds["aria-invalid"]}
          aria-describedby={emailIds["aria-describedby"]}
        />
      </FormField>

      <FormField fieldId={statusIds.id} label="Статус" error={errors.status}>
        <select
          {...register("status")}
          id={statusIds.id}
          aria-labelledby={statusIds.labelId}
          aria-invalid={statusIds["aria-invalid"]}
          aria-describedby={statusIds["aria-describedby"]}
        >
          <option value="active">Активен</option>
          <option value="trial">Испытательный</option>
          <option value="dismissed">Уволен</option>
        </select>
      </FormField>

      <button type="submit" style={{ justifySelf: "end" }}>
        Сохранить
      </button>
    </form>
  );
}
