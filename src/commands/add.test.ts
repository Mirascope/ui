import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { AddCommand } from "./add";
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import { createTestContext } from "../test-utils";
import { RegistryComponent } from "../types";
import { REGISTRY_URL } from "../constants";

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
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute([], context)).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith("❌ No components specified");
    });

    test("parses component names", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);

      await mkdir("mirascope-ui", { recursive: true });
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
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
    test("auto-initializes project when manifest doesn't exist", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);
      const command = new AddCommand();

      await command.execute(["button"], context);

      // Check that auto-init happened
      expect(logSpy).toHaveBeenCalledWith("🚀 No manifest found. Initializing project...");
      expect(logSpy).toHaveBeenCalledWith("🚀 Initializing Mirascope UI Registry");
      expect(logSpy).toHaveBeenCalledWith("✅ Created manifest at mirascope-ui/manifest.json");

      // Check that the component was added after init
      expect(logSpy).toHaveBeenCalledWith("📦 Adding button...");
      expect(logSpy).toHaveBeenCalledWith("✅ Added 1 component");

      // Verify manifest was created and component added
      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.button.files).toEqual(["mirascope-ui/ui/button.tsx"]);

      // Verify component file was created
      const buttonContent = await readFile("mirascope-ui/ui/button.tsx", "utf-8");
      expect(buttonContent).toBe("export const Button = () => <button>Click me</button>;");
    });
  });

  describe("component tracking", () => {
    beforeEach(async () => {
      await mkdir("mirascope-ui", { recursive: true });
    });

    test("adds new component", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        dependencies: ["@radix-ui/react-slot"],
        files: [
          {
            path: "mirascope-ui/ui/button.tsx",
            type: "registry:ui" as const,
            content: "",
          },
        ],
      };

      const files = {
        "mirascope-ui/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["button"], context);

      const manifest = JSON.parse(await readFile("mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.button.files).toEqual(["mirascope-ui/ui/button.tsx"]);

      const buttonContent = await readFile("mirascope-ui/ui/button.tsx", "utf-8");
      expect(buttonContent).toBe("export const Button = () => <button>Click me</button>;");

      expect(installSpy).toHaveBeenCalledWith(["@radix-ui/react-slot"], tempDir);
      expect(logSpy).toHaveBeenCalledWith("✅ Added 1 component");
    });

    test("syncs already tracked components", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx": "export const Button = () => <button>Updated</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);

      // Create existing button file
      await mkdir("mirascope-ui/ui", { recursive: true });
      await writeFile(
        "mirascope-ui/ui/button.tsx",
        "export const Button = () => <button>Old</button>;"
      );

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {
            button: {
              version: "main",
              lastSync: "2025-01-01T00:00:00Z",
              files: ["mirascope-ui/ui/button.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new AddCommand();

      await command.execute(["button"], context);

      // Should show sync message
      expect(logSpy).toHaveBeenCalledWith("🔄 Syncing button...");
      expect(logSpy).toHaveBeenCalledWith("✅ Added 1 component");

      // Component should be updated
      const buttonContent = await readFile("mirascope-ui/ui/button.tsx", "utf-8");
      expect(buttonContent).toBe("export const Button = () => <button>Updated</button>;");
    });

    test("adds multiple components", async () => {
      const components: RegistryComponent[] = [
        {
          name: "button",
          type: "registry:ui" as const,
          dependencies: ["@radix-ui/react-slot"],
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

      const files = {
        "mirascope-ui/ui/button.tsx": "export const Button = () => <button>Click me</button>;",
        "mirascope-ui/ui/input.tsx": "export const Input = () => <input />;",
      };

      const context = createTestContext(components, files, tempDir);

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["button", "input"], context);

      const manifest = JSON.parse(await readFile("mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.input).toBeDefined();

      expect(installSpy).toHaveBeenCalledWith(["@radix-ui/react-slot"], tempDir);
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
            { path: "mirascope-ui/ui/alert-dialog.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
        {
          name: "button",
          type: "registry:ui" as const,
          dependencies: ["@radix-ui/react-slot"],
          files: [
            { path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
      ];

      const files = {
        "mirascope-ui/ui/alert-dialog.tsx": "export const AlertDialog = () => null;",
        "mirascope-ui/ui/button.tsx": "export const Button = () => <button />;",
      };

      const context = createTestContext(components, files, tempDir);

      await mkdir("mirascope-ui", { recursive: true });
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["alert-dialog"], context);

      const manifest = JSON.parse(await readFile("mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components["alert-dialog"]).toBeDefined();
      expect(manifest.components.button).toBeDefined();

      expect(installSpy).toHaveBeenCalledWith(
        expect.arrayContaining(["@radix-ui/react-alert-dialog", "@radix-ui/react-slot"]),
        tempDir
      );

      expect(logSpy).toHaveBeenCalledWith("📦 Adding button...");
      expect(logSpy).toHaveBeenCalledWith("✅ Added 2 components");
    });

    test("resolves recursive registry dependencies", async () => {
      const components: RegistryComponent[] = [
        {
          name: "primary",
          type: "registry:ui" as const,
          dependencies: ["dep-a"],
          registryDependencies: ["secondary"],
          files: [
            { path: "mirascope-ui/ui/primary.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
        {
          name: "secondary",
          type: "registry:ui" as const,
          dependencies: ["dep-b"],
          registryDependencies: ["tertiary"],
          files: [
            { path: "mirascope-ui/ui/secondary.tsx", type: "registry:ui" as const, content: "" },
          ],
        },
        {
          name: "tertiary",
          type: "registry:lib" as const,
          dependencies: ["dep-c"],
          files: [
            { path: "mirascope-ui/lib/tertiary.ts", type: "registry:lib" as const, content: "" },
          ],
        },
      ];

      const files = {
        "mirascope-ui/ui/primary.tsx": "export const Primary = () => null;",
        "mirascope-ui/ui/secondary.tsx": "export const Secondary = () => null;",
        "mirascope-ui/lib/tertiary.ts": "export const tertiary = () => {};",
      };

      const context = createTestContext(components, files, tempDir);

      await mkdir("mirascope-ui", { recursive: true });
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["primary"], context);

      const manifest = JSON.parse(await readFile("mirascope-ui/manifest.json", "utf-8"));

      // All three components should be installed (primary -> secondary -> tertiary)
      expect(manifest.components.primary).toBeDefined();
      expect(manifest.components.secondary).toBeDefined();
      expect(manifest.components.tertiary).toBeDefined();

      // All npm dependencies from all levels should be collected
      expect(installSpy).toHaveBeenCalledWith(
        expect.arrayContaining(["dep-a", "dep-b", "dep-c"]),
        tempDir
      );

      expect(logSpy).toHaveBeenCalledWith("✅ Added 3 components");
    });
  });

  describe("error handling", () => {
    test("handles registry fetch errors", async () => {
      const context = createTestContext([], {}, tempDir); // Empty registry

      await mkdir("mirascope-ui", { recursive: true });
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
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
