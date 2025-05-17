import type { Meta, StoryObj } from "@storybook/react";

import { LilypadLogo } from "@/registry/blocks/lilypad-logo";

/**
 * Displays a callout for user attention.
 */
const meta = {
  title: "blocks/Lilypad Logo",
  component: LilypadLogo,
  tags: ["autodocs"],
  argTypes: {
    size: {
      options: [12, 24, 36],
      control: { type: "radio" },
    },
  },
  args: {
    size: 24,
  },
  render: (args) => <LilypadLogo {...args} />,
} satisfies Meta<typeof LilypadLogo>;

export default meta;

type Story = StoryObj<typeof meta>;
/**
 * The default form of the alert.
 */
export const Default: Story = {};
