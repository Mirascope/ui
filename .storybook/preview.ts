import type { Preview } from "@storybook/react";
import { ModeDecorator } from "./modeDecorator";
export const decorators = [ModeDecorator];
import "../registry/styles/index.css";
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
