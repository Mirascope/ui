import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { Manifest } from "./types";

export class ManifestManager {
  private manifestPath: string;

  constructor(cwd: string = process.cwd()) {
    this.manifestPath = join(cwd, "src", "mirascope-ui", "manifest.json");
  }

  async exists(): Promise<boolean> {
    return existsSync(this.manifestPath);
  }

  async read(): Promise<Manifest> {
    if (!(await this.exists())) {
      return this.createDefault();
    }

    try {
      const content = await readFile(this.manifestPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read manifest: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async write(manifest: Manifest): Promise<void> {
    try {
      await writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to write manifest: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private createDefault(): Manifest {
    return {
      registryUrl: "https://ui.mirascope.com",
      components: {},
      lastFullSync: "",
    };
  }

  async addComponent(name: string, files: string[]): Promise<void> {
    const manifest = await this.read();
    manifest.components[name] = {
      version: "main",
      lastSync: new Date().toISOString(),
      files,
    };
    await this.write(manifest);
  }

  async removeComponent(name: string): Promise<void> {
    const manifest = await this.read();
    delete manifest.components[name];
    await this.write(manifest);
  }

  async updateComponentSync(name: string): Promise<void> {
    const manifest = await this.read();
    if (manifest.components[name]) {
      manifest.components[name].lastSync = new Date().toISOString();
      await this.write(manifest);
    }
  }

  async updateFullSync(): Promise<void> {
    const manifest = await this.read();
    manifest.lastFullSync = new Date().toISOString();
    await this.write(manifest);
  }
}
