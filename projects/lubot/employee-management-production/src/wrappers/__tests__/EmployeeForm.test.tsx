import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmployeeForm } from "../form/EmployeeForm";

describe("EmployeeForm wrapper", () => {
  it("submits valid values", async () => {
    const handleSubmit = vi.fn();
    render(<EmployeeForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/Логин/i), "user123");
    await userEvent.type(screen.getByLabelText(/Email/i), "user@example.com");
    await userEvent.selectOptions(screen.getByLabelText(/Статус/i), "trial");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(handleSubmit).toHaveBeenCalledWith({
      login: "user123",
      email: "user@example.com",
      status: "trial",
    });
  });

  it("shows validation errors", async () => {
    const handleSubmit = vi.fn();
    render(<EmployeeForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/Логин/i), "123");
    await userEvent.type(screen.getByLabelText(/Email/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByText("Минимум 4 символа")).toBeVisible();
    expect(await screen.findByText("Некорректный email")).toBeVisible();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
