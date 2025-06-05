import { LilypadPricing } from "@/mirascope-ui/blocks/lilypad-pricing";
import { ButtonLink } from "@/mirascope-ui/ui/button-link";
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
      button: (
        <ButtonLink href="/signup" variant="default">
          Get Started Free
        </ButtonLink>
      ),
    },
    pro: {
      button: (
        <ButtonLink href="/waitlist" variant="outline">
          Join Waitlist
        </ButtonLink>
      ),
    },
    team: {
      button: (
        <ButtonLink href="/contact" variant="outline">
          Contact Sales
        </ButtonLink>
      ),
    },
  },
  selfHosted: {
    free: {
      button: (
        <ButtonLink href="/download" variant="default">
          Download
        </ButtonLink>
      ),
    },
    pro: {
      button: (
        <ButtonLink href="/request-access" variant="outline">
          Request Access
        </ButtonLink>
      ),
    },
    team: {
      button: (
        <ButtonLink href="/contact" variant="outline">
          Contact Sales
        </ButtonLink>
      ),
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
          button: (
            <ButtonLink href="https://app.lilypad.com/signup" variant="default">
              Sign Up Now
            </ButtonLink>
          ),
        },
        pro: {
          button: (
            <ButtonLink href="https://forms.lilypad.com/beta" variant="outline">
              Join Beta
            </ButtonLink>
          ),
        },
        team: {
          button: (
            <ButtonLink href="https://calendly.com/lilypad-team" variant="outline">
              Schedule Demo
            </ButtonLink>
          ),
        },
      },
      selfHosted: {
        free: {
          button: (
            <ButtonLink href="https://github.com/mirascope/lilypad/releases" variant="default">
              GitHub Release
            </ButtonLink>
          ),
        },
        pro: {
          button: (
            <ButtonLink href="https://forms.lilypad.com/enterprise" variant="outline">
              Enterprise Inquiry
            </ButtonLink>
          ),
        },
        team: {
          button: (
            <ButtonLink href="https://calendly.com/lilypad-enterprise" variant="outline">
              Book Consultation
            </ButtonLink>
          ),
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
          button: (
            <ButtonLink href="/start" variant="default">
              Start Free
            </ButtonLink>
          ),
        },
        pro: {
          button: (
            <ButtonLink href="/upgrade-pro" variant="default">
              Upgrade to Pro
            </ButtonLink>
          ),
        },
        team: {
          button: (
            <ButtonLink href="/upgrade-team" variant="default">
              Get Team Plan
            </ButtonLink>
          ),
        },
      },
      selfHosted: {
        free: {
          button: (
            <ButtonLink href="/download" variant="default">
              Download Free
            </ButtonLink>
          ),
        },
        pro: {
          button: (
            <ButtonLink href="/license-pro" variant="default">
              Get Pro License
            </ButtonLink>
          ),
        },
        team: {
          button: (
            <ButtonLink href="/license-team" variant="default">
              Get Team License
            </ButtonLink>
          ),
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
