import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./FormField";

const schema = z.object({
  login: z.string().min(4, "Минимум 4 символа"),
  email: z.string().email("Некорректный email"),
  status: z.enum(["active", "trial", "dismissed"]),
});

type EmployeeFormValues = z.infer<typeof schema>;

export function EmployeeForm({ onSubmit }: { onSubmit?: SubmitHandler<EmployeeFormValues> }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit?.(values))} style={{ display: "grid", gap: 16 }}>
      <FormField
        label="Логин"
        error={errors.login}
        input={<input {...register("login")} aria-invalid={!!errors.login} className="form-control" />}
      />
      <FormField
        label="Email"
        error={errors.email}
        input={<input type="email" {...register("email")} aria-invalid={!!errors.email} className="form-control" />}
      />
      <FormField
        label="Статус"
        error={errors.status}
        input={
          <select {...register("status")} className="form-control">
            <option value="active">Активен</option>
            <option value="trial">Испытательный</option>
            <option value="dismissed">Уволен</option>
          </select>
        }
      />
      <button type="submit" className="primary-button">
        Сохранить
      </button>
    </form>
  );
}
