import type { Preview } from "@storybook/react";
import "../src/styles/global.css";
import "../src/wrappers/ui/button.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "#ffffff" },
        { name: "muted", value: "#f1f5f9" }
      ],
    },
    a11y: {
      element: "#storybook-root",
      config: {},
      options: {},
      manual: false,
    },
  },
};

export default preview;
