import { Registry } from "./registry";
import { RegistryComponent } from "./types";
import { ExecutionContext } from "./commands/base";

export class TestRegistry implements Registry {
  private components: RegistryComponent[] = [];
  private files: Map<string, string> = new Map();

  constructor(components: RegistryComponent[] = [], files: Record<string, string> = {}) {
    this.components = components;
    this.files = new Map(Object.entries(files));
  }

  async fetchRegistry(): Promise<{ items: RegistryComponent[] }> {
    return { items: this.components };
  }

  async fetchComponentFile(filePath: string): Promise<string> {
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`Test file not found: ${filePath}`);
    }
    return content;
  }

  // Helper methods for testing
  addComponent(component: RegistryComponent): void {
    this.components.push(component);
  }

  addFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  clear(): void {
    this.components = [];
    this.files.clear();
  }
}

export function createTestContext(
  components: RegistryComponent[] = [],
  files: Record<string, string> = {}
): ExecutionContext {
  return {
    registry: new TestRegistry(components, files),
  };
}
