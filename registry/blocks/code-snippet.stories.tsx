import { Meta, StoryObj } from "@storybook/react";
import { CodeSnippet } from "@/registry/blocks/code-snippet";

const meta = {
  title: "Components/CodeSnippet",
  component: CodeSnippet,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A wrapper component for CodeBlock that handles automatic code formatting, whitespace trimming, and offers simplified usage with string children or code prop.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    code: {
      control: "text",
      description: "The code string to display, alternative to using children",
    },
    children: {
      control: "text",
      description:
        "Code content as a string child, alternative to using the code prop",
    },
    language: {
      control: "select",
      options: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "html",
        "css",
        "python",
        "java",
        "c",
        "cpp",
        "csharp",
        "go",
        "rust",
        "ruby",
        "php",
        "text",
      ],
      description: "The programming language for syntax highlighting",
    },
    showLineNumbers: {
      control: "boolean",
      description: "Whether to display line numbers",
    },
    className: {
      control: "text",
      description: "Custom CSS class names to apply to the wrapper",
    },
  },
} satisfies Meta<typeof CodeSnippet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Example using the code prop
export const WithCodeProp: Story = {
  args: {
    code: `def hello_world():
    print("Hello, world!")
    return True`,
    language: "python",
    showLineNumbers: true,
  },
};

// Example using children
export const WithChildren: Story = {
  args: {
    children: `function helloWorld() {
  console.log("Hello, world!");
  return true;
}`,
    language: "javascript",
    showLineNumbers: true,
  },
};

// Example showing automatic whitespace handling
export const WhitespaceHandling: Story = {
  args: {
    code: `
      // Notice how this code has extra indentation
      // that will be automatically trimmed
      function processData(data) {
        if (!data) {
          return null;
        }
        
        return {
          processed: true,
          value: data.value * 2
        };
      }
    `,
    language: "javascript",
    showLineNumbers: true,
  },
};

// JavaScript example with line numbers hidden
export const NoLineNumbers: Story = {
  args: {
    code: `const user = {
  name: 'John Doe',
  email: 'john@example.com',
  roles: ['user', 'admin']
};

console.log(user.name);`,
    language: "javascript",
    showLineNumbers: false,
  },
};

// HTML example
export const HTMLExample: Story = {
  args: {
    code: `<nav class="navbar">
  <div class="logo">
    <img src="logo.svg" alt="Company Logo">
  </div>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>`,
    language: "html",
    showLineNumbers: true,
  },
};

// CSS example
export const CSSExample: Story = {
  args: {
    code: `.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  transition: background-color 0.2s ease;
}

.button-primary {
  background-color: #3f51b5;
  color: white;
}

.button-primary:hover {
  background-color: #303f9f;
}`,
    language: "css",
    showLineNumbers: true,
  },
};

// TypeScript example
export const TypeScriptExample: Story = {
  args: {
    code: `interface Product {
  id: string;
  name: string;
  price: number;
  category: 'electronics' | 'clothing' | 'books';
  inStock: boolean;
}

function applyDiscount(product: Product, discountPercent: number): Product {
  return {
    ...product,
    price: product.price * (1 - discountPercent / 100)
  };
}`,
    language: "typescript",
    showLineNumbers: true,
  },
};

// Example with custom class
export const CustomStyling: Story = {
  args: {
    code: `// This code block has custom styling
const message = "Hello, Storybook!";`,
    language: "javascript",
    showLineNumbers: true,
    className: "border-2 border-purple-500 rounded-xl shadow-lg p-1",
  },
};

// Example with no code (fallback)
export const NoCodeProvided: Story = {
  args: {
    language: "javascript",
    showLineNumbers: true,
  },
};
