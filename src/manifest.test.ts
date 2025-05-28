import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import { ManifestManager } from "./manifest";
import type { Manifest } from "./types";

describe("ManifestManager", () => {
  const testDir = join(process.cwd(), "test-temp-manifest");
  const packageJsonPath = join(testDir, "package.json");
  const manifestPath = join(testDir, "src", "mirascope-ui", "manifest.json");

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(packageJsonPath, JSON.stringify({ name: "test" }));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("constructor", () => {
    test("should validate package.json exists", () => {
      expect(() => new ManifestManager(testDir)).not.toThrow();
    });

    test("should throw when package.json missing", async () => {
      await rm(packageJsonPath);
      expect(() => new ManifestManager(testDir)).toThrow(
        "No package.json found in current directory"
      );
    });
  });

  describe("exists", () => {
    test("should return false when manifest doesn't exist", async () => {
      const manager = new ManifestManager(testDir);
      expect(await manager.exists()).toBe(false);
    });

    test("should return true when manifest exists", async () => {
      await mkdir(join(testDir, "src", "mirascope-ui"), { recursive: true });
      await writeFile(manifestPath, "{}");

      const manager = new ManifestManager(testDir);
      expect(await manager.exists()).toBe(true);
    });
  });

  describe("read", () => {
    test("should return default manifest when file doesn't exist", async () => {
      const manager = new ManifestManager(testDir);
      const manifest = await manager.read();

      expect(manifest).toEqual({
        registryUrl: "https://ui.mirascope.com",
        components: {},
        lastFullSync: "",
      });
    });

    test("should parse existing manifest", async () => {
      const testManifest: Manifest = {
        registryUrl: "https://test.com",
        components: {
          button: {
            version: "main",
            lastSync: "2025-01-15T10:30:00Z",
            files: ["src/mirascope-ui/ui/button.tsx"],
          },
        },
        lastFullSync: "2025-01-15T10:30:00Z",
      };

      await mkdir(join(testDir, "src", "mirascope-ui"), { recursive: true });
      await writeFile(manifestPath, JSON.stringify(testManifest));

      const manager = new ManifestManager(testDir);
      const manifest = await manager.read();

      expect(manifest).toEqual(testManifest);
    });

    test("should throw on invalid JSON", async () => {
      await mkdir(join(testDir, "src", "mirascope-ui"), { recursive: true });
      await writeFile(manifestPath, "invalid json");

      const manager = new ManifestManager(testDir);
      await expect(manager.read()).rejects.toThrow("Failed to read manifest");
    });
  });

  describe("write", () => {
    test("should create directory and write manifest", async () => {
      const manager = new ManifestManager(testDir);
      const manifest: Manifest = {
        registryUrl: "https://test.com",
        components: {},
        lastFullSync: "",
      };

      await manager.write(manifest);

      const written = JSON.parse(await readFile(manifestPath, "utf-8"));
      expect(written).toEqual(manifest);
    });
  });

  describe("init", () => {
    test("should create new manifest", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();

      expect(await manager.exists()).toBe(true);
      const manifest = await manager.read();
      expect(manifest.registryUrl).toBe("https://ui.mirascope.com");
      expect(manifest.components).toEqual({});
    });

    test("should throw when manifest already exists", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();

      await expect(manager.init()).rejects.toThrow("Manifest already exists");
    });
  });

  describe("addComponent", () => {
    test("should add component to manifest", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();

      await manager.addComponent("button", ["src/mirascope-ui/ui/button.tsx"]);

      const manifest = await manager.read();
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.button.files).toEqual(["src/mirascope-ui/ui/button.tsx"]);
      expect(manifest.components.button.version).toBe("main");
      expect(manifest.components.button.lastSync).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("removeComponent", () => {
    test("should remove component from manifest", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();
      await manager.addComponent("button", ["src/mirascope-ui/ui/button.tsx"]);

      await manager.removeComponent("button");

      const manifest = await manager.read();
      expect(manifest.components.button).toBeUndefined();
    });
  });

  describe("updateComponentSync", () => {
    test("should update component lastSync timestamp", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();
      await manager.addComponent("button", ["src/mirascope-ui/ui/button.tsx"]);

      const beforeUpdate = await manager.read();
      const originalSync = beforeUpdate.components.button.lastSync;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));
      await manager.updateComponentSync("button");

      const afterUpdate = await manager.read();
      expect(afterUpdate.components.button.lastSync).not.toBe(originalSync);
    });

    test("should handle non-existent component gracefully", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();

      // Should not throw an error
      await manager.updateComponentSync("nonexistent");

      // Verify manifest is unchanged
      const manifest = await manager.read();
      expect(manifest.components.nonexistent).toBeUndefined();
    });
  });

  describe("updateFullSync", () => {
    test("should update lastFullSync timestamp", async () => {
      const manager = new ManifestManager(testDir);
      await manager.init();

      await manager.updateFullSync();

      const manifest = await manager.read();
      expect(manifest.lastFullSync).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
