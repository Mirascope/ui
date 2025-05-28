import { join } from "path";
import { readFile } from "fs/promises";
import { RegistryComponent } from "./types";

export interface RegistryOptions {
  local?: boolean | string; // boolean for current dir, string for specific path
  registryUrl?: string;
}

export class RegistryFetcher {
  private options: RegistryOptions;

  constructor(options: RegistryOptions = {}) {
    this.options = options;
  }

  private getRegistryUrl(): string {
    // Explicit CLI option has highest priority
    if (this.options.registryUrl) return this.options.registryUrl;

    // Environment variable as fallback
    const envUrl = process.env.MIRASCOPE_REGISTRY_URL;
    if (envUrl) return envUrl;

    // Default to production registry
    return "https://ui.mirascope.com";
  }

  async fetchRegistry(): Promise<{ items: RegistryComponent[] }> {
    if (this.options.local) {
      return this.fetchLocalRegistry();
    }
    return this.fetchRemoteRegistry();
  }

  private async fetchLocalRegistry(): Promise<{ items: RegistryComponent[] }> {
    try {
      const registryPath = join(process.cwd(), "registry.json");
      const content = await readFile(registryPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read local registry: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async fetchRemoteRegistry(): Promise<{ items: RegistryComponent[] }> {
    const url = `${this.getRegistryUrl()}/registry.json`;

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
    if (this.options.local) {
      return this.fetchLocalFile(filePath);
    }
    return this.fetchRemoteFile(filePath);
  }

  private async fetchLocalFile(filePath: string): Promise<string> {
    try {
      const fullPath = join(process.cwd(), filePath);
      return await readFile(fullPath, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to read local file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async fetchRemoteFile(filePath: string): Promise<string> {
    const url = `${this.getRegistryUrl()}/${filePath}`;

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

  async findComponent(name: string): Promise<RegistryComponent | null> {
    const registry = await this.fetchRegistry();
    return registry.items.find((item) => item.name === name) || null;
  }

  async findComponents(names: string[]): Promise<RegistryComponent[]> {
    const registry = await this.fetchRegistry();
    const found = names.map((name) => {
      const component = registry.items.find((item) => item.name === name);
      if (!component) {
        throw new Error(`Component "${name}" not found in registry`);
      }
      return component;
    });
    return found;
  }
}
