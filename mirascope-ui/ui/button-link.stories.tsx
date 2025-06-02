import { ButtonLink } from "@/mirascope-ui/ui/button-link";
import type { Meta, StoryObj } from "@storybook/react";
import { ExternalLink, ArrowRight } from "lucide-react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

// Mock router setup for Storybook

const memoryHistory = createMemoryHistory({
  initialEntries: ["/"],
});

const withRouter = (Story: any) => {
  // Update the root route component to render the story
  const StoryRoute = createRootRoute({
    component: () => <Story />,
  });

  const storyRouteTree = StoryRoute.addChildren([
    createRoute({
      getParentRoute: () => StoryRoute,
      path: "/",
      component: () => <Story />,
    }),
  ]);

  const storyRouter = createRouter({
    routeTree: storyRouteTree,
    history: memoryHistory,
  });

  return <RouterProvider router={storyRouter} />;
};

const meta = {
  title: "UI/ButtonLink",
  component: ButtonLink,
  decorators: [withRouter],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style of the button link",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button link",
    },
    external: {
      control: "boolean",
      description: "Whether the link is external (forces anchor tag)",
    },
    href: {
      control: "text",
      description: "The URL or path to link to",
    },
  },
  args: {
    variant: "outline",
    size: "default",
    external: false,
    href: "#",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button Link",
    href: "#",
  },
};

export const External: Story = {
  args: {
    children: (
      <>
        Visit Website
        <ExternalLink />
      </>
    ),
    href: "https://example.com",
    external: true,
  },
};

export const InternalLink: Story = {
  args: {
    children: "Go to Dashboard",
    href: "/dashboard",
    external: false,
  },
};

export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Link",
    href: "#",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Link",
    href: "#",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete Item",
    href: "#",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Link",
    href: "#",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Link",
    href: "#",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Link",
    href: "#",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Next Page
        <ArrowRight />
      </>
    ),
    href: "/next",
  },
};

export const AutoDetectExternal: Story = {
  args: {
    children: "Auto External",
    href: "https://github.com",
  },
  parameters: {
    docs: {
      description: {
        story: "Automatically detects external links based on href starting with http/https",
      },
    },
  },
};

export const LinkVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <ButtonLink variant="default" href="#">
          Default
        </ButtonLink>
        <ButtonLink variant="secondary" href="#">
          Secondary
        </ButtonLink>
        <ButtonLink variant="outline" href="#">
          Outline
        </ButtonLink>
        <ButtonLink variant="ghost" href="#">
          Ghost
        </ButtonLink>
        <ButtonLink variant="link" href="#">
          Link
        </ButtonLink>
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink size="sm" href="#">
          Small
        </ButtonLink>
        <ButtonLink size="default" href="#">
          Default
        </ButtonLink>
        <ButtonLink size="lg" href="#">
          Large
        </ButtonLink>
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/internal">Internal Link</ButtonLink>
        <ButtonLink href="https://external.com" external>
          External Link <ExternalLink />
        </ButtonLink>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A showcase of all ButtonLink variants, sizes, and link types.",
      },
    },
  },
};
