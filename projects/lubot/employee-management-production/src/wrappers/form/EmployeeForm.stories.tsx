import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EmployeeForm, type EmployeeFormProps, type EmployeeFormValues } from "./EmployeeForm";

const meta: Meta<EmployeeFormProps> = {
  title: "Wrappers/Form/EmployeeForm",
  component: EmployeeForm,
};

export default meta;

type Story = StoryObj<EmployeeFormProps>;

export const Default: Story = {
  render: (args) => {
    const [submitted, setSubmitted] = useState<EmployeeFormValues | null>(null);

    return (
      <div style={{ minWidth: 360, display: "grid", gap: 16 }}>
        <EmployeeForm
          {...args}
          onSubmit={(values) => {
            setSubmitted(values);
          }}
        />
        <pre style={{ background: "#f1f5f9", padding: 12, borderRadius: 8 }}>
          {submitted ? JSON.stringify(submitted, null, 2) : "Ожидается отправка"}
        </pre>
      </div>
    );
  },
};
