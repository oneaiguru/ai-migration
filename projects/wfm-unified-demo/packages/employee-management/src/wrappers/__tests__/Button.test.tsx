import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../ui/Button";

describe("Button wrapper", () => {
  it("applies variant and size modifiers", () => {
    render(
      <Button variant="danger" size="sm">
        Удалить
      </Button>
    );

    const button = screen.getByRole("button", { name: "Удалить" });
    expect(button.className).toContain("em-button--danger");
    expect(button.className).toContain("em-button--sm");
  });

  it("defaults to button type", () => {
    render(<Button>Сохранить</Button>);
    const button = screen.getByRole("button", { name: "Сохранить" });
    expect(button).toHaveAttribute("type", "button");
  });
});
