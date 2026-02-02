import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type FormValues = z.infer<typeof schema>;

const schema = z.object({
  login: z
    .string()
    .min(4, "Минимум 4 символа")
    .regex(/^[a-z0-9_.-]+$/i, "Только латиница"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  email: z.string().email("Неверный email"),
});

export function ZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((values) => console.log(values))}>
      <label>
        Логин
        <input {...register("login")} aria-invalid={!!errors.login} />
      </label>
      {errors.login && <p role="alert">{errors.login.message}</p>}

      <label>
        Пароль
        <input
          type="password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
      </label>
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <label>
        Email
        <input type="email" {...register("email")} aria-invalid={!!errors.email} />
      </label>
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <button type="submit">Сохранить</button>
    </form>
  );
}
