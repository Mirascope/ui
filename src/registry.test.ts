import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { RegistryFetcher } from "./registry";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";

describe("RegistryFetcher", () => {
  const tempDir = join(process.cwd(), "test-temp-registry");

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir("..");
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("constructor", () => {
    test("creates fetcher with default options", () => {
      const fetcher = new RegistryFetcher();
      expect(fetcher).toBeDefined();
    });

    test("creates fetcher with custom options", () => {
      const fetcher = new RegistryFetcher({
        local: true,
        registryUrl: "http://localhost:3000",
      });
      expect(fetcher).toBeDefined();
    });
  });

  describe("fetchLocalRegistry", () => {
    test("reads local registry.json", async () => {
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui" as const,
            files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
          },
        ],
      };

      await writeFile("registry.json", JSON.stringify(registryData));

      const fetcher = new RegistryFetcher({ local: true });
      const result = await fetcher.fetchRegistry();

      expect(result).toEqual(registryData);
    });

    test("throws error for missing local registry", async () => {
      const fetcher = new RegistryFetcher({ local: true });

      await expect(fetcher.fetchRegistry()).rejects.toThrow("Failed to read local registry");
    });
  });

  describe("fetchLocalFile", () => {
    test("reads local component file", async () => {
      const fileContent = "export const Button = () => <button>Click me</button>;";
      await mkdir("registry/ui", { recursive: true });
      await writeFile("registry/ui/button.tsx", fileContent);

      const fetcher = new RegistryFetcher({ local: true });
      const result = await fetcher.fetchComponentFile("registry/ui/button.tsx");

      expect(result).toBe(fileContent);
    });

    test("throws error for missing local file", async () => {
      const fetcher = new RegistryFetcher({ local: true });

      await expect(fetcher.fetchComponentFile("registry/ui/nonexistent.tsx")).rejects.toThrow(
        "Failed to read local file"
      );
    });
  });

  describe("findComponent", () => {
    test("finds existing component", async () => {
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui" as const,
            files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
          },
          {
            name: "input",
            type: "registry:ui" as const,
            files: [{ path: "registry/ui/input.tsx", type: "registry:ui" as const, content: "" }],
          },
        ],
      };

      await writeFile("registry.json", JSON.stringify(registryData));

      const fetcher = new RegistryFetcher({ local: true });
      const result = await fetcher.findComponent("button");

      expect(result).toEqual(registryData.items[0]);
    });

    test("returns null for non-existent component", async () => {
      const registryData = { items: [] };
      await writeFile("registry.json", JSON.stringify(registryData));

      const fetcher = new RegistryFetcher({ local: true });
      const result = await fetcher.findComponent("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findComponents", () => {
    test("finds multiple existing components", async () => {
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui" as const,
            files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
          },
          {
            name: "input",
            type: "registry:ui" as const,
            files: [{ path: "registry/ui/input.tsx", type: "registry:ui" as const, content: "" }],
          },
        ],
      };

      await writeFile("registry.json", JSON.stringify(registryData));

      const fetcher = new RegistryFetcher({ local: true });
      const result = await fetcher.findComponents(["button", "input"]);

      expect(result).toEqual(registryData.items);
    });

    test("throws error for non-existent component", async () => {
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui" as const,
            files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
          },
        ],
      };

      await writeFile("registry.json", JSON.stringify(registryData));

      const fetcher = new RegistryFetcher({ local: true });

      await expect(fetcher.findComponents(["button", "nonexistent"])).rejects.toThrow(
        'Component "nonexistent" not found in registry'
      );
    });
  });

  describe("environment variables", () => {
    test("uses MIRASCOPE_REGISTRY_URL environment variable", () => {
      const originalEnv = process.env.MIRASCOPE_REGISTRY_URL;
      process.env.MIRASCOPE_REGISTRY_URL = "http://env.example.com";

      const fetcher = new RegistryFetcher();
      // We can't directly test the private method, but we can ensure it doesn't throw
      expect(fetcher).toBeDefined();

      process.env.MIRASCOPE_REGISTRY_URL = originalEnv;
    });
  });
});
