import { useForm } from "react-hook-form";
import type { CSSProperties } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type EmployeeForm = z.infer<typeof schema>;

const schema = z.object({
  login: z.string().min(4, "Минимум 4 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
});

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const inputStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

export function FormDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeForm>({ resolver: zodResolver(schema) });

  return (
    <form
      onSubmit={handleSubmit((values) => alert(JSON.stringify(values, null, 2)))}
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}
    >
      <label style={fieldStyle}>
        <span>Логин WFM</span>
        <input
          {...register("login")}
          aria-invalid={!!errors.login}
          style={inputStyle}
        />
        {errors.login && (
          <span role="alert" style={{ color: "#dc2626", fontSize: 12 }}>
            {errors.login.message}
          </span>
        )}
      </label>

      <label style={fieldStyle}>
        <span>Email</span>
        <input
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          style={inputStyle}
        />
        {errors.email && (
          <span role="alert" style={{ color: "#dc2626", fontSize: 12 }}>
            {errors.email.message}
          </span>
        )}
      </label>

      <label style={fieldStyle}>
        <span>Пароль</span>
        <input
          type="password"
          {...register("password")}
          aria-invalid={!!errors.password}
          style={inputStyle}
        />
        {errors.password && (
          <span role="alert" style={{ color: "#dc2626", fontSize: 12 }}>
            {errors.password.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Сохранить
      </button>
    </form>
  );
}
