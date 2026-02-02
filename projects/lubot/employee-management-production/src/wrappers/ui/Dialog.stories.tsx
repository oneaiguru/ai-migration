import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog, type DialogProps } from "./Dialog";
import { Button } from "./Button";

type StoryDialogProps = DialogProps & { children?: React.ReactNode };

const meta: Meta<StoryDialogProps> = {
  title: "Wrappers/UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Редактирование сотрудника",
    description: "Обновите данные и сохраните изменения",
    variant: "modal",
    size: "md",
    children: <div style={{ minWidth: 360 }}>Содержимое модального окна</div>,
    footer: (
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="ghost">Отмена</Button>
        <Button variant="primary">Сохранить</Button>
      </div>
    ),
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["modal", "sheet"],
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
    },
    titleHidden: { control: "boolean" },
    descriptionHidden: { control: "boolean" },
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <Dialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Открыть</Button>}
      />
    );
  },
};

export default meta;

type Story = StoryObj<StoryDialogProps>;

export const Modal: Story = {
  args: {
    variant: "modal",
    titleHidden: false,
    descriptionHidden: false,
  },
};

export const SheetHiddenHeading: Story = {
  args: {
    variant: "sheet",
    titleHidden: true,
    descriptionHidden: true,
  },
};
