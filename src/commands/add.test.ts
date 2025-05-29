import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { AddCommand } from "./add";
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import { createTestContext } from "../test-utils";
import { RegistryComponent } from "../types";

describe("AddCommand", () => {
  const tempDir = join(process.cwd(), "test-temp-add");
  let logSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;
  let exitSpy: ReturnType<typeof spyOn>;

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
    process.chdir(tempDir);

    logSpy = spyOn(console, "log").mockImplementation(() => {});
    errorSpy = spyOn(console, "error").mockImplementation(() => {});
    exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await writeFile("package.json", JSON.stringify({ name: "test-project" }));
  });

  afterEach(async () => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();

    process.chdir("..");
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("argument parsing", () => {
    test("shows error for no components", async () => {
      const command = new AddCommand();
      const context = createTestContext();

      await expect(command.execute([], context)).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith("❌ No components specified");
    });

    test("parses component names", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "registry/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
      };

      const context = createTestContext([buttonComponent], files);

      await mkdir("src/mirascope-ui", { recursive: true });
      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();

      await command.execute(["button"], context);
      expect(logSpy).toHaveBeenCalledWith("🔍 Fetching components: button");
    });
  });

  describe("manifest validation", () => {
    test("shows error if manifest doesn't exist", async () => {
      const command = new AddCommand();
      const context = createTestContext();

      await expect(command.execute(["button"], context)).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Manifest not found. Run 'mirascope-ui init' first."
      );
    });
  });

  describe("component tracking", () => {
    beforeEach(async () => {
      await mkdir("src/mirascope-ui", { recursive: true });
    });

    test("adds new component", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        dependencies: ["@radix-ui/react-slot"],
        files: [
          {
            path: "registry/ui/button.tsx",
            type: "registry:ui" as const,
            content: "",
          },
        ],
      };

      const files = {
        "registry/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
      };

      const context = createTestContext([buttonComponent], files);

      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["button"], context);

      const manifest = JSON.parse(await readFile("src/mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.button.files).toEqual(["src/mirascope-ui/ui/button.tsx"]);

      const buttonContent = await readFile("src/mirascope-ui/ui/button.tsx", "utf-8");
      expect(buttonContent).toBe("export const Button = () => <button>Click me</button>;");

      expect(installSpy).toHaveBeenCalledWith(["@radix-ui/react-slot"]);
      expect(logSpy).toHaveBeenCalledWith("✅ Added 1 component");
    });

    test("warns about already tracked components", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const context = createTestContext([buttonComponent]);

      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {
            button: {
              version: "main",
              lastSync: "2025-01-01T00:00:00Z",
              files: ["src/mirascope-ui/ui/button.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new AddCommand();

      await command.execute(["button"], context);

      expect(logSpy).toHaveBeenCalledWith("⚠️  Already tracking: button");
      expect(logSpy).toHaveBeenCalledWith("✅ All components already tracked");
    });

    test("adds multiple components", async () => {
      const components: RegistryComponent[] = [
        {
          name: "button",
          type: "registry:ui" as const,
          dependencies: ["@radix-ui/react-slot"],
          files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
        },
        {
          name: "input",
          type: "registry:ui" as const,
          files: [{ path: "registry/ui/input.tsx", type: "registry:ui" as const, content: "" }],
        },
      ];

      const files = {
        "registry/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
        "registry/ui/input.tsx": "export const Input = () => <input />;",
      };

      const context = createTestContext(components, files);

      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["button", "input"], context);

      const manifest = JSON.parse(await readFile("src/mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.input).toBeDefined();

      expect(installSpy).toHaveBeenCalledWith(["@radix-ui/react-slot"]);
      expect(logSpy).toHaveBeenCalledWith("✅ Added 2 components");
    });
  });

  describe("registry dependencies", () => {
    test("resolves registry dependencies", async () => {
      const components: RegistryComponent[] = [
        {
          name: "alert-dialog",
          type: "registry:ui" as const,
          dependencies: ["@radix-ui/react-alert-dialog"],
          registryDependencies: ["button"],
          files: [
            { path: "registry/ui/alert-dialog.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
        {
          name: "button",
          type: "registry:ui" as const,
          dependencies: ["@radix-ui/react-slot"],
          files: [{ path: "registry/ui/button.tsx", type: "registry:ui" as const, content: "" }],
        },
      ];

      const files = {
        "registry/ui/alert-dialog.tsx": "export const AlertDialog = () => null;",
        "registry/ui/button.tsx": "export const Button = () => <button />;",
      };

      const context = createTestContext(components, files);

      await mkdir("src/mirascope-ui", { recursive: true });
      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["alert-dialog"], context);

      const manifest = JSON.parse(await readFile("src/mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components["alert-dialog"]).toBeDefined();
      expect(manifest.components.button).toBeDefined();

      expect(installSpy).toHaveBeenCalledWith([
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-slot",
      ]);

      expect(logSpy).toHaveBeenCalledWith("🔗 Resolving registry dependencies: button");
      expect(logSpy).toHaveBeenCalledWith("✅ Added 2 components");
    });
  });

  describe("error handling", () => {
    test("handles registry fetch errors", async () => {
      const context = createTestContext(); // Empty registry

      await mkdir("src/mirascope-ui", { recursive: true });
      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();

      await expect(command.execute(["nonexistent"], context)).rejects.toThrow(
        "process.exit called"
      );
    });
  });
});
