import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { FileRegistry, RemoteRegistry, findComponent, findComponents } from "./registry";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { TestRegistry } from "./test-utils";

describe("Registry", () => {
  const tempDir = join(process.cwd(), "test-temp-registry");

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir("..");
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("FileRegistry", () => {
    test("reads local registry.json", async () => {
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui" as const,
            files: [
              { path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" },
            ],
          },
        ],
      };

      await writeFile("registry.json", JSON.stringify(registryData));

      const registry = new FileRegistry(process.cwd());
      const result = await registry.fetchRegistry();

      expect(result).toEqual(registryData);
    });

    test("throws error for missing local registry", async () => {
      const registry = new FileRegistry(process.cwd());

      await expect(registry.fetchRegistry()).rejects.toThrow("Failed to read local registry");
    });

    test("reads local component file", async () => {
      const fileContent = "export const Button = () => <button>Click me</button>;";
      await mkdir("mirascope-ui/ui", { recursive: true });
      await writeFile("mirascope-ui/ui/button.tsx", fileContent);

      const registry = new FileRegistry(process.cwd());
      const result = await registry.fetchComponentFile("mirascope-ui/ui/button.tsx");

      expect(result).toBe(fileContent);
    });

    test("throws error for missing local file", async () => {
      const registry = new FileRegistry(process.cwd());

      await expect(registry.fetchComponentFile("mirascope-ui/ui/nonexistent.tsx")).rejects.toThrow(
        "Failed to read local file"
      );
    });
  });

  describe("RemoteRegistry", () => {
    test("constructs with base URL", () => {
      const registry = new RemoteRegistry("https://ui.mirascope.com");
      expect(registry).toBeDefined();
    });

    // Note: We don't test actual HTTP calls since they require network access
    // In a real project, you'd mock fetch or use a test server
  });

  describe("Utility Functions", () => {
    test("findComponent finds existing component", async () => {
      const registry = new TestRegistry([
        {
          name: "button",
          type: "registry:ui" as const,
          files: [
            { path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
        {
          name: "input",
          type: "registry:ui" as const,
          files: [{ path: "mirascope-ui/ui/input.tsx", type: "registry:ui" as const, content: "" }],
        },
      ]);

      const result = await findComponent(registry, "button");
      expect(result?.name).toBe("button");
    });

    test("findComponent returns null for non-existent component", async () => {
      const registry = new TestRegistry([]);
      const result = await findComponent(registry, "nonexistent");
      expect(result).toBeNull();
    });

    test("findComponents finds multiple existing components", async () => {
      const components = [
        {
          name: "button",
          type: "registry:ui" as const,
          files: [
            { path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
        {
          name: "input",
          type: "registry:ui" as const,
          files: [{ path: "mirascope-ui/ui/input.tsx", type: "registry:ui" as const, content: "" }],
        },
      ];

      const registry = new TestRegistry(components);
      const result = await findComponents(registry, ["button", "input"]);

      expect(result).toEqual(components);
    });

    test("findComponents throws error for non-existent component", async () => {
      const registry = new TestRegistry([
        {
          name: "button",
          type: "registry:ui" as const,
          files: [
            { path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
      ]);

      await expect(findComponents(registry, ["button", "nonexistent"])).rejects.toThrow(
        'Component "nonexistent" not found in registry'
      );
    });
  });

  describe("TestRegistry", () => {
    test("can add components and files dynamically", async () => {
      const registry = new TestRegistry();

      registry.addComponent({
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      });

      registry.addFile("mirascope-ui/ui/button.tsx", "export const Button = () => <button />;");

      const registryData = await registry.fetchRegistry();
      expect(registryData.items).toHaveLength(1);
      expect(registryData.items[0].name).toBe("button");

      const fileContent = await registry.fetchComponentFile("mirascope-ui/ui/button.tsx");
      expect(fileContent).toBe("export const Button = () => <button />;");
    });

    test("throws error for missing test file", async () => {
      const registry = new TestRegistry();

      await expect(registry.fetchComponentFile("nonexistent.tsx")).rejects.toThrow(
        "Test file not found: nonexistent.tsx"
      );
    });

    test("can clear registry data", async () => {
      const registry = new TestRegistry([
        {
          name: "button",
          type: "registry:ui" as const,
          files: [
            { path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
      ]);

      let registryData = await registry.fetchRegistry();
      expect(registryData.items).toHaveLength(1);

      registry.clear();
      registryData = await registry.fetchRegistry();
      expect(registryData.items).toHaveLength(0);
    });
  });
});
