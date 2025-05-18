import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDays } from "date-fns";

import { Calendar } from "@/registry/ui/calendar";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["default", "range", "single", "multiple"],
      description: "The selection mode of the calendar",
    },
    showOutsideDays: {
      control: "boolean",
      description: "Whether to show days from the previous/next month",
    },
    disabled: {
      control: "object",
      description: "Disabled dates (can be a Date, range, or matcher function)",
    },
    selected: {
      control: "object",
      description: "Selected date(s)",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
  args: {
    showOutsideDays: true,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default calendar with no selection mode.
 */
export const Default: Story = {};

/**
 * Calendar with a single date selected.
 */
export const SingleSelection: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
    );
  },
};

/**
 * Calendar with date range selection mode.
 */
export const RangeSelection: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date; to?: Date }>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={(value) => {
          if (value && value.from) {
            setRange({ from: value.from, to: value.to });
          }
        }}
        className="rounded-md border"
      />
    );
  },
};

/**
 * Calendar with multiple date selection mode.
 */
export const MultipleSelection: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([
      new Date(),
      addDays(new Date(), 2),
      addDays(new Date(), 5),
    ]);
    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={(value) => {
          if (value) setDates(value);
        }}
        required
        className="rounded-md border"
      />
    );
  },
};

/**
 * Calendar with disabled dates (weekends).
 */
export const DisabledDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Disable weekends
    const disabledDays = { dayOfWeek: [0, 6] };

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={disabledDays}
        className="rounded-md border"
      />
    );
  },
};

/**
 * Calendar with a custom CSS class to control the size.
 */
export const CustomSized: Story = {
  render: () => (
    <div className="flex gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Default Size</h3>
        <Calendar className="rounded-md border" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Large Size</h3>
        <Calendar className="rounded-md border p-5 text-lg" />
      </div>
    </div>
  ),
};

/**
 * Calendar grid showing multiple months.
 */
export const MultiMonth: Story = {
  render: () => (
    <div className="space-y-4">
      <Calendar numberOfMonths={2} className="rounded-md border" />
    </div>
  ),
};
