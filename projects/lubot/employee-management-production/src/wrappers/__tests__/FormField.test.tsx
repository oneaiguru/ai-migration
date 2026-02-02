import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField, formFieldAriaProps } from "../form/FormField";

describe("FormField wrapper", () => {
  it("links hint text via aria-describedby", () => {
    const { id, labelId, ...ariaProps } = formFieldAriaProps({
      controlId: "login",
      hasError: false,
      hintId: "login-hint",
    });

    render(
      <FormField label="Логин" hint="Минимум 4 символа" fieldId={id}>
        <input id={id} aria-describedby={ariaProps["aria-describedby"]} />
      </FormField>
    );

    const label = screen.getByText("Логин").closest("label");
    expect(label).toHaveAttribute("id", labelId);
    const hint = screen.getByText("Минимум 4 символа");
    expect(hint).toHaveAttribute("id", "login-hint");
  });

  it("shows error message when provided", () => {
    render(
      <FormField label="Логин" fieldId="login" error="Ошибка">
        <input aria-describedby="login-error" />
      </FormField>
    );

    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Ошибка");
  });
});
