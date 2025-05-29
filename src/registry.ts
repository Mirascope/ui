import { join } from "path";
import { readFile } from "fs/promises";
import { RegistryComponent } from "./types";

export interface Registry {
  fetchRegistry(): Promise<{ items: RegistryComponent[] }>;
  fetchComponentFile(filePath: string): Promise<string>;
}

export class FileRegistry implements Registry {
  constructor(private basePath: string) {}

  async fetchRegistry(): Promise<{ items: RegistryComponent[] }> {
    try {
      const registryPath = join(this.basePath, "registry.json");
      const content = await readFile(registryPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read local registry: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async fetchComponentFile(filePath: string): Promise<string> {
    try {
      const fullPath = join(this.basePath, filePath);
      return await readFile(fullPath, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to read local file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export class RemoteRegistry implements Registry {
  constructor(private baseUrl: string) {}

  async fetchRegistry(): Promise<{ items: RegistryComponent[] }> {
    const url = `${this.baseUrl}/registry.json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to fetch registry from ${url}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async fetchComponentFile(filePath: string): Promise<string> {
    const url = `${this.baseUrl}/${filePath}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(
        `Failed to fetch file from ${url}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export async function findComponent(
  registry: Registry,
  name: string
): Promise<RegistryComponent | null> {
  const registryData = await registry.fetchRegistry();
  return registryData.items.find((item) => item.name === name) || null;
}

export async function findComponents(
  registry: Registry,
  names: string[]
): Promise<RegistryComponent[]> {
  const registryData = await registry.fetchRegistry();
  const found = names.map((name) => {
    const component = registryData.items.find((item) => item.name === name);
    if (!component) {
      throw new Error(`Component "${name}" not found in registry`);
    }
    return component;
  });
  return found;
}
