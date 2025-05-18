import { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "./code-block";

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile code display component that renders syntax-highlighted code with both light and dark theme support, copy functionality, and adaptive UI based on code block size.",
      },
    },
  },
  args: {
    onCopy: (content: string) => console.log("Code copied:", content),
  },
  tags: ["autodocs"],
  argTypes: {
    code: {
      control: "text",
      description: "The code string to display and highlight",
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
    meta: {
      control: "text",
      description: "Additional metadata for the code block",
    },
    className: {
      control: "text",
      description: "Custom CSS class names to apply to the wrapper",
    },
    showLineNumbers: {
      control: "boolean",
      description: "Whether to display line numbers",
    },
    onCopy: {
      action: "copied",
      description: "Callback function triggered when code is copied",
    },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic JavaScript example
export const JavaScript: Story = {
  args: {
    code: `function hello() {
  console.log("Hello, world!"); // [!code highlight]
  return true;
}`,
    language: "javascript",
    showLineNumbers: true,
  },
};

// Basic JavaScript example
export const JavaScriptHighlighting: Story = {
  args: {
    code: `function hello() {
      console.log("This is a really really really long line of code that should be highlighted");
      return true;
    }`,
    language: "javascript",
    showLineNumbers: true,
    meta: "{1-3}",
  },
  parameters: {
    docs: {
      source: {
        type: "code",
        format: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "600px", overflow: "auto" }}>
        <Story />
      </div>
    ),
  ],
};
// TypeScript example
export const TypeScript: Story = {
  args: {
    code: `interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`)
    .then(response => {
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json(); // [!code highlight]
    });
}`,
    language: "typescript",
    showLineNumbers: true,
  },
};

// HTML example without line numbers
export const HTML: Story = {
  args: {
    code: `<div class="card">
  <h2>Card Title</h2>
  <p>This is a paragraph with some <strong>bold text</strong>.</p>
  <button class="btn primary">Click me</button>
</div>`,
    language: "html",
    showLineNumbers: false,
  },
};

// CSS example
export const CSS: Story = {
  args: {
    code: `.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  background-color: white;
}`,
    language: "css",
    showLineNumbers: true,
  },
};

// Short code example to demonstrate small block behavior
export const ShortCode: Story = {
  args: {
    code: `const greeting = "Hello, world!";`,
    language: "javascript",
    showLineNumbers: true,
  },
};

// Long code example with custom class
export const LongCode: Story = {
  args: {
    code: `import React, { useState, useEffect } from 'react';

function DataFetcher({ url, renderItem }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(\`HTTP error: \${response.status}\`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(\`Error fetching data: \${err.message}\`);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="data-container">
      {data.length === 0 ? (
        <p>No data available</p>
      ) : (
        data.map((item, index) => renderItem(item, index))
      )}
    </div>
  );
}

export default DataFetcher;`,
    language: "jsx",
    showLineNumbers: true,
    className: "max-h-[400px]",
  },
};

// Python example
export const Python: Story = {
  args: {
    code: `def fibonacci(n):
    """
    Calculate the Fibonacci sequence up to the nth term.
    
    Args:
        n: A positive integer
        
    Returns:
        A list containing the Fibonacci sequence up to the nth term
    """
    result = [0, 1]
    
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    for i in range(2, n):
        result.append(result[i-1] + result[i-2])
        
    return result

# Example usage
if __name__ == "__main__":
    sequence = fibonacci(10)
    print(sequence)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
    language: "python",
    showLineNumbers: true,
  },
};

// Example with custom class
export const CustomStyling: Story = {
  args: {
    code: `const greeting = "Hello, world!";
console.log(greeting);`,
    language: "javascript",
    showLineNumbers: true,
    className: "border-2 border-blue-500 rounded-xl shadow-lg",
  },
};
