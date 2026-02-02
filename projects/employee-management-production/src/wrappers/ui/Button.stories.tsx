import type { Meta, StoryObj } from "@storybook/react";
import { Button, type ButtonProps } from "./Button";

const meta: Meta<ButtonProps> = {
  title: "Wrappers/UI/Button",
  component: Button,
  parameters: {
    controls: { expanded: true },
  },
  args: {
    children: "Кнопка",
    variant: "primary",
    size: "md",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "icon"],
    },
    fullWidth: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Playground: Story = {};

export const Icon: Story = {
  args: {
    size: "icon",
    children: "🔍",
    "aria-label": "Поиск",
  },
};
