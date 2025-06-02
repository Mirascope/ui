import { LilypadPricing } from "@/mirascope-ui/blocks/lilypad-pricing";
import type { Meta, StoryObj } from "@storybook/react";
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
  title: "Blocks/Lilypad Pricing",
  component: LilypadPricing,
  decorators: [withRouter],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    actions: {
      description: "Configuration for button actions across different hosting options and tiers",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LilypadPricing>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultActions = {
  hosted: {
    free: {
      buttonText: "Get Started Free",
      buttonLink: "/signup",
      variant: "default" as const,
    },
    pro: {
      buttonText: "Join Waitlist",
      buttonLink: "/waitlist",
      variant: "outline" as const,
    },
    team: {
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      variant: "outline" as const,
    },
  },
  selfHosted: {
    free: {
      buttonText: "Download",
      buttonLink: "/download",
      variant: "default" as const,
    },
    pro: {
      buttonText: "Request Access",
      buttonLink: "/request-access",
      variant: "outline" as const,
    },
    team: {
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      variant: "outline" as const,
    },
  },
};

export const Default: Story = {
  args: {
    actions: defaultActions,
  },
};

export const WithExternalLinks: Story = {
  args: {
    actions: {
      hosted: {
        free: {
          buttonText: "Sign Up Now",
          buttonLink: "https://app.lilypad.com/signup",
          variant: "default" as const,
        },
        pro: {
          buttonText: "Join Beta",
          buttonLink: "https://forms.lilypad.com/beta",
          variant: "outline" as const,
        },
        team: {
          buttonText: "Schedule Demo",
          buttonLink: "https://calendly.com/lilypad-team",
          variant: "outline" as const,
        },
      },
      selfHosted: {
        free: {
          buttonText: "GitHub Release",
          buttonLink: "https://github.com/mirascope/lilypad/releases",
          variant: "default" as const,
        },
        pro: {
          buttonText: "Enterprise Inquiry",
          buttonLink: "https://forms.lilypad.com/enterprise",
          variant: "outline" as const,
        },
        team: {
          buttonText: "Book Consultation",
          buttonLink: "https://calendly.com/lilypad-enterprise",
          variant: "outline" as const,
        },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with external links for a live deployment scenario",
      },
    },
  },
};

export const AllPrimaryButtons: Story = {
  args: {
    actions: {
      hosted: {
        free: {
          buttonText: "Start Free",
          buttonLink: "/start",
          variant: "default" as const,
        },
        pro: {
          buttonText: "Upgrade to Pro",
          buttonLink: "/upgrade-pro",
          variant: "default" as const,
        },
        team: {
          buttonText: "Get Team Plan",
          buttonLink: "/upgrade-team",
          variant: "default" as const,
        },
      },
      selfHosted: {
        free: {
          buttonText: "Download Free",
          buttonLink: "/download",
          variant: "default" as const,
        },
        pro: {
          buttonText: "Get Pro License",
          buttonLink: "/license-pro",
          variant: "default" as const,
        },
        team: {
          buttonText: "Get Team License",
          buttonLink: "/license-team",
          variant: "default" as const,
        },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "All tiers using primary button styling for a more aggressive CTA approach",
      },
    },
  },
};
