import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";

describe("Dialog wrapper", () => {
  it("keeps aria labels when headings are hidden", () => {
    render(
      <Dialog
        open
        title="Редактирование сотрудника"
        description="Обновите данные"
        titleHidden
        descriptionHidden
        testId="dialog"
      >
        <div>Содержимое</div>
      </Dialog>
    );

    const dialog = screen.getByRole("dialog", { name: "Редактирование сотрудника" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("prevents closing when preventClose is set", () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={handleOpenChange}
        preventClose
        testId="dialog"
        title="Редактирование"
      >
        <div>Содержимое</div>
      </Dialog>
    );

    const content = screen.getByTestId("dialog");
    fireEvent.keyDown(content, { key: "Escape" });
    expect(handleOpenChange).not.toHaveBeenCalled();

    const overlay = screen.getByTestId("dialog-overlay");
    fireEvent.pointerDown(overlay);
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it("renders trigger when provided", async () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog
        open={false}
        onOpenChange={handleOpenChange}
        title="Редактирование"
        trigger={<Button>Открыть</Button>}
      >
        <div>Тело</div>
      </Dialog>
    );

    const trigger = screen.getByRole("button", { name: "Открыть" });
    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });
});
