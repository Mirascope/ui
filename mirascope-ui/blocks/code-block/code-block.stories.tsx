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

// Highlight inside a multiline string
export const PythonMultiline: Story = {
  args: {
    code: `a = inspect.cleandoc("""
    foo # [!code highlight]
    bar
    """)
}`,
    language: "python",
    showLineNumbers: true,
    meta: "{2}",
  },
};

// Basic JavaScript example without line numbers
export const JavaScriptNoLineNumbers: Story = {
  args: {
    code: `function hello() {
  console.log("Hello, world!"); // [!code highlight]
  return true;
}`,
    language: "javascript",
    showLineNumbers: false,
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

// Check that the code stays aligned as the # of lines increases
export const HundredLineNumbers: Story = {
  args: {
    code: `${"x\n".repeat(101)}`,
    language: "typescript",
    showLineNumbers: true,
  },
};

export const ThousandLineNumbers: Story = {
  args: {
    code: `${"x\n".repeat(1001)}`,
    language: "typescript",
    showLineNumbers: true,
  },
};

// Long Python code for scrolling demos
const longCodeSample = `def process_data(input_file, output_file):
    """Process data from input file and write results to output file."""
    print(f"Processing {input_file}...")
    
    # Read input data
    with open(input_file, 'r') as f:
        lines = f.readlines()
    
    # Process each line
    results = []
    for i, line in enumerate(lines):
        # Strip whitespace
        line = line.strip()
        
        # Skip empty lines
        if not line:
            continue
            
        # Skip comments
        if line.startswith('#'):
            continue
            
        # Process the line
        processed = line.upper()
        results.append(processed)
        
        # Print progress every 100 lines
        if i % 100 == 0:
            print(f"Processed {i} lines...")
    
    # Write results
    with open(output_file, 'w') as f:
        for result in results:
            f.write(result + '\\n')
    
    print(f"Finished! Processed {len(results)} lines.")
    print(f"Results written to {output_file}")
    
    return len(results)


def calculate_statistics(numbers):
    """Calculate basic statistics for a list of numbers."""
    if not numbers:
        return {
            'count': 0,
            'sum': 0,
            'mean': None,
            'min': None,
            'max': None,
            'median': None
        }
    
    sorted_numbers = sorted(numbers)
    count = len(numbers)
    total = sum(numbers)
    
    # Calculate median
    if count % 2 == 0:
        median = (sorted_numbers[count // 2 - 1] + sorted_numbers[count // 2]) / 2
    else:
        median = sorted_numbers[count // 2]
    
    return {
        'count': count,
        'sum': total,
        'mean': total / count,
        'min': min(numbers),
        'max': max(numbers),
        'median': median
    }


def main():
    """Main function to demonstrate usage."""
    # Example 1: Process a file
    input_file = 'data.txt'
    output_file = 'processed_data.txt'
    
    try:
        count = process_data(input_file, output_file)
        print(f"Successfully processed {count} lines")
    except FileNotFoundError:
        print(f"Error: Could not find {input_file}")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    # Example 2: Calculate statistics
    test_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    stats = calculate_statistics(test_numbers)
    
    print("\\nStatistics:")
    print(f"Count: {stats['count']}")
    print(f"Sum: {stats['sum']}")
    print(f"Mean: {stats['mean']}")
    print(f"Min: {stats['min']}")
    print(f"Max: {stats['max']}")
    print(f"Median: {stats['median']}")


if __name__ == "__main__":
    main()`;

export const ScrollingIssue: Story = {
  args: {
    code: longCodeSample,
    language: "python",
    showLineNumbers: true,
  },
  decorators: [
    (Story) => (
      <div className="flex h-[400px] flex-col rounded-lg border">
        <div className="border-b bg-gray-50 p-4">
          <h3 className="font-semibold">Code Panel (Scrolling Issue)</h3>
          <p className="text-sm text-gray-600">
            The code below doesn't scroll properly in this flex container
          </p>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "This demonstrates the scrolling issue when CodeBlock is placed in a height-constrained flex container. The code overflows and doesn't scroll properly.",
      },
    },
  },
};

export const ScrollingFixed: Story = {
  args: {
    code: longCodeSample,
    language: "python",
    showLineNumbers: true,
    className:
      "h-full flex flex-col [&_.highlight-container]:flex-1 [&_.highlight-container]:min-h-0",
  },
  decorators: [
    (Story) => (
      <div className="flex h-[400px] flex-col rounded-lg border">
        <div className="border-b bg-gray-50 p-4">
          <h3 className="font-semibold">Code Panel (Fixed)</h3>
          <p className="text-sm text-gray-600">
            Pass overflow-auto via className to enable scrolling
          </p>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "This demonstrates the fix: pass flex and overflow classes via className prop to enable internal scrolling. The arbitrary property selector targets the internal highlight-container.",
      },
    },
  },
};
