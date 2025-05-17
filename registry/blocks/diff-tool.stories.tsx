import { Meta, StoryObj } from "@storybook/react";
import { DiffTool } from "@/registry/blocks/diff-tool";

const meta = {
  title: "Components/DiffTool",
  component: DiffTool,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A tool for visualizing code differences with two display modes: unified view and side-by-side split view.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    incomingCodeBlock: {
      control: "text",
      description: "The new/incoming code block to compare",
    },
    baseCodeBlock: {
      control: "text",
      description: "The original/base code block to compare against",
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
  },
} satisfies Meta<typeof DiffTool>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic example with simple changes
export const SimpleChanges: Story = {
  args: {
    baseCodeBlock: `function add(a, b) {
  return a + b;
}`,
    incomingCodeBlock: `function add(a, b) {
  // Add two numbers
  return a + b;
}`,
    language: "javascript",
  },
};

// Example with added lines
export const AddedLines: Story = {
  args: {
    baseCodeBlock: `function fetchData() {
  const url = 'https://api.example.com/data';
  return fetch(url);
}`,
    incomingCodeBlock: `function fetchData() {
  const url = 'https://api.example.com/data';
  
  // Log the request
  console.log('Fetching data from:', url);
  
  return fetch(url)
    .then(response => response.json());
}`,
    language: "javascript",
  },
};

// Example with removed lines
export const RemovedLines: Story = {
  args: {
    baseCodeBlock: `function calculateTotal(items) {
  // Apply sales tax rate
  const taxRate = 0.08;
  
  // Discount for orders over $100
  const discountThreshold = 100;
  const discountRate = 0.1;
  
  // Calculate subtotal
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  
  // Apply discount if eligible
  if (subtotal >= discountThreshold) {
    subtotal = subtotal * (1 - discountRate);
  }
  
  // Apply tax
  const total = subtotal * (1 + taxRate);
  
  return total;
}`,
    incomingCodeBlock: `function calculateTotal(items) {
  // Apply sales tax rate
  const taxRate = 0.08;
  
  // Calculate subtotal
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  
  // Apply tax
  const total = subtotal * (1 + taxRate);
  
  return total;
}`,
    language: "javascript",
  },
};

// Example with modified lines
export const ModifiedLines: Story = {
  args: {
    baseCodeBlock: `class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id, data) {
    const user = await this.getUser(id);
    Object.assign(user, data);
    return this.userRepository.save(user);
  }
}`,
    incomingCodeBlock: `class UserService {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async getUser(id) {
    this.logger.info('Fetching user by id:', id);
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn('User not found:', id);
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id, data) {
    this.logger.info('Updating user:', id, data);
    const user = await this.getUser(id);
    Object.assign(user, data);
    return this.userRepository.save(user);
  }
}`,
    language: "javascript",
  },
};

// Example with TypeScript code
export const TypeScriptExample: Story = {
  args: {
    baseCodeBlock: `interface User {
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
      return response.json();
    });
}`,
    incomingCodeBlock: `interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  lastLogin?: Date;
}

async function getUser(id: number): Promise<User> {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw new Error(\`User not found: \${id}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}`,
    language: "typescript",
  },
};

// Example with Python code
export const PythonExample: Story = {
  args: {
    baseCodeBlock: `def process_data(data):
    """Process the input data."""
    results = []
    for item in data:
        if item.get('active', False):
            processed = {
                'id': item['id'],
                'value': item['value'] * 2
            }
            results.append(processed)
    return results`,
    incomingCodeBlock: `def process_data(data, multiplier=2):
    """
    Process the input data.
    
    Args:
        data: List of dictionaries containing items to process
        multiplier: Value to multiply by (default: 2)
    
    Returns:
        List of processed items
    """
    results = []
    
    # Validate input
    if not isinstance(data, list):
        raise TypeError("Expected data to be a list")
        
    for item in data:
        if item.get('active', False):
            processed = {
                'id': item['id'],
                'value': item['value'] * multiplier,
                'processed_at': datetime.now().isoformat()
            }
            results.append(processed)
            
    return results`,
    language: "python",
  },
};

// Example with HTML code
export const HTMLExample: Story = {
  args: {
    baseCodeBlock: `<div class="card">
  <div class="card-header">
    <h2>Product Title</h2>
  </div>
  <div class="card-body">
    <p class="description">Product description here</p>
    <div class="price">$99.99</div>
  </div>
  <div class="card-footer">
    <button class="btn">Add to Cart</button>
  </div>
</div>`,
    incomingCodeBlock: `<div class="card">
  <div class="card-header">
    <h2>Product Title</h2>
    <span class="badge">New</span>
  </div>
  <div class="card-body">
    <p class="description">Product description here</p>
    <div class="price">
      <span class="original-price">$129.99</span>
      <span class="current-price">$99.99</span>
    </div>
    <div class="rating">
      <i class="star filled"></i>
      <i class="star filled"></i>
      <i class="star filled"></i>
      <i class="star filled"></i>
      <i class="star empty"></i>
      <span>(42 reviews)</span>
    </div>
  </div>
  <div class="card-footer">
    <button class="btn primary">Add to Cart</button>
    <button class="btn secondary">Wishlist</button>
  </div>
</div>`,
    language: "html",
  },
};

// Example with CSS code
export const CSSExample: Story = {
  args: {
    baseCodeBlock: `.button {
  display: inline-block;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: #0069d9;
}`,
    incomingCodeBlock: `.button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.button:active {
  transform: translateY(0);
  box-shadow: none;
}

.button.secondary {
  background-color: #6c757d;
}

.button.secondary:hover {
  background-color: #5a6268;
}`,
    language: "css",
  },
};

// Complex example with many changes
export const ComplexChanges: Story = {
  args: {
    baseCodeBlock: `import React, { useState, useEffect } from 'react';

function DataTable({ endpoint, columns }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [endpoint]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.id}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => (
              <td key={col.id}>{row[col.id]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;`,
    incomingCodeBlock: `import React, { useState, useEffect, useMemo } from 'react';
import { Spinner, Alert, Table, Pagination } from './components';

function DataTable({ 
  endpoint, 
  columns,
  pageSize = 10,
  sortable = true,
  filterable = false,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState({ column: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  
  // Fetch data with pagination, sorting and filtering
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', pageSize.toString());
        
        if (sortBy.column) {
          params.append('sortBy', sortBy.column);
          params.append('direction', sortBy.direction);
        }
        
        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value.toString());
          }
        });
        
        const url = \`\${endpoint}?\${params.toString()}\`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(\`Server error: \${response.status}\`);
        }
        
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [endpoint, page, pageSize, sortBy, filters]);
  
  // Handle sorting
  const handleSort = (columnId) => {
    if (!sortable) return;
    
    setSortBy(prevSort => {
      if (prevSort.column === columnId) {
        // Toggle direction
        return { 
          column: columnId, 
          direction: prevSort.direction === 'asc' ? 'desc' : 'asc' 
        };
      }
      return { column: columnId, direction: 'asc' };
    });
  };
  
  // Handle filtering
  const handleFilterChange = (columnId, value) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
    setPage(1); // Reset to first page on filter change
  };
  
  // Compute column headers with sort indicators
  const columnHeaders = useMemo(() => {
    return columns.map(col => ({
      ...col,
      sortIndicator: sortBy.column === col.id 
        ? sortBy.direction === 'asc' ? '↑' : '↓' 
        : null
    }));
  }, [columns, sortBy]);
  
  if (loading) {
    return <Spinner />;
  }
  
  if (error) {
    return <Alert type="error" message={error} />;
  }
  
  return (
    <div className="data-table-container">
      {filterable && (
        <div className="filters">
          {columns.filter(col => col.filterable).map(col => (
            <input
              key={col.id}
              type="text"
              placeholder={\`Filter by \${col.label}\`}
              value={filters[col.id] || ''}
              onChange={(e) => handleFilterChange(col.id, e.target.value)}
            />
          ))}
        </div>
      )}
      
      <Table>
        <Table.Header>
          <Table.Row>
            {columnHeaders.map(col => (
              <Table.HeaderCell 
                key={col.id}
                onClick={() => handleSort(col.id)}
                className={sortable ? 'sortable' : ''}
              >
                {col.label}
                {col.sortIndicator && <span className="sort-indicator">{col.sortIndicator}</span>}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length} className="no-data">
                No data available
              </Table.Cell>
            </Table.Row>
          ) : (
            data.map(row => (
              <Table.Row key={row.id}>
                {columns.map(col => (
                  <Table.Cell key={col.id}>
                    {col.render ? col.render(row[col.id], row) : row[col.id]}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
      
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(data.total / pageSize)}
        onPageChange={setPage}
      />
    </div>
  );
}

export default DataTable;`,
    language: "jsx",
  },
};
