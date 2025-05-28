import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { AddCommand } from "./add";
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";

describe("AddCommand", () => {
  const tempDir = join(process.cwd(), "test-temp-add");
  let logSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;
  let exitSpy: ReturnType<typeof spyOn>;

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
    process.chdir(tempDir);

    // Mock console and process.exit
    logSpy = spyOn(console, "log").mockImplementation(() => {});
    errorSpy = spyOn(console, "error").mockImplementation(() => {});
    exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // Create package.json for ManifestManager validation
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

      await expect(command.execute([])).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith("❌ No components specified");
    });

    test("parses component names", async () => {
      // Setup registry
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

      // Setup manifest
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

      await expect(command.execute(["--local", "button"])).rejects.toThrow();
      expect(logSpy).toHaveBeenCalledWith("🔍 Fetching components: button");
    });
  });

  describe("manifest validation", () => {
    test("shows error if manifest doesn't exist", async () => {
      const command = new AddCommand();

      await expect(command.execute(["button"])).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Manifest not found. Run 'mirascope-ui init' first."
      );
    });
  });

  describe("component tracking", () => {
    beforeEach(async () => {
      // Setup basic registry
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui" as const,
            dependencies: ["@radix-ui/react-slot"],
            files: [
              {
                path: "registry/ui/button.tsx",
                type: "registry:ui" as const,
                content: "export const Button = () => <button>Click me</button>;",
              },
            ],
          },
          {
            name: "input",
            type: "registry:ui" as const,
            files: [
              {
                path: "registry/ui/input.tsx",
                type: "registry:ui" as const,
                content: "export const Input = () => <input />;",
              },
            ],
          },
        ],
      };
      await writeFile("registry.json", JSON.stringify(registryData));
      await mkdir("registry/ui", { recursive: true });
      await writeFile(
        "registry/ui/button.tsx",
        "export const Button = () => <button>Click me</button>;"
      );
      await writeFile("registry/ui/input.tsx", "export const Input = () => <input />;");

      // Setup manifest
      await mkdir("src/mirascope-ui", { recursive: true });
    });

    test("adds new component", async () => {
      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();

      // Mock dependency installation to avoid actually running bun add
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["--local", "button"]);

      // Check manifest was updated
      const manifest = JSON.parse(await readFile("src/mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.button.files).toEqual(["src/mirascope-ui/ui/button.tsx"]);

      // Check file was written
      const buttonContent = await readFile("src/mirascope-ui/ui/button.tsx", "utf-8");
      expect(buttonContent).toBe("export const Button = () => <button>Click me</button>;");

      // Check dependency installation was called
      expect(installSpy).toHaveBeenCalledWith(["@radix-ui/react-slot"]);

      expect(logSpy).toHaveBeenCalledWith("✅ Added 1 component");
    });

    test("warns about already tracked components", async () => {
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

      await command.execute(["--local", "button"]);

      expect(logSpy).toHaveBeenCalledWith("⚠️  Already tracking: button");
      expect(logSpy).toHaveBeenCalledWith("✅ All components already tracked");
    });

    test("adds multiple components", async () => {
      await writeFile(
        "src/mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new AddCommand();

      // Mock dependency installation
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["--local", "button", "input"]);

      // Check manifest was updated for both components
      const manifest = JSON.parse(await readFile("src/mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.input).toBeDefined();

      // Check dependency installation was called
      expect(installSpy).toHaveBeenCalledWith(["@radix-ui/react-slot"]);

      expect(logSpy).toHaveBeenCalledWith("✅ Added 2 components");
    });
  });

  describe("registry dependencies", () => {
    test("resolves registry dependencies", async () => {
      const registryData = {
        items: [
          {
            name: "alert-dialog",
            type: "registry:ui" as const,
            dependencies: ["@radix-ui/react-alert-dialog"],
            registryDependencies: ["button"],
            files: [
              {
                path: "registry/ui/alert-dialog.tsx",
                type: "registry:ui" as const,
                content: "export const AlertDialog = () => null;",
              },
            ],
          },
          {
            name: "button",
            type: "registry:ui" as const,
            dependencies: ["@radix-ui/react-slot"],
            files: [
              {
                path: "registry/ui/button.tsx",
                type: "registry:ui" as const,
                content: "export const Button = () => <button />;",
              },
            ],
          },
        ],
      };
      await writeFile("registry.json", JSON.stringify(registryData));
      await mkdir("registry/ui", { recursive: true });
      await writeFile("registry/ui/alert-dialog.tsx", "export const AlertDialog = () => null;");
      await writeFile("registry/ui/button.tsx", "export const Button = () => <button />;");

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

      // Mock dependency installation
      const installSpy = spyOn(command as any, "installDependencies").mockResolvedValue(undefined);

      await command.execute(["--local", "alert-dialog"]);

      // Check both components were added
      const manifest = JSON.parse(await readFile("src/mirascope-ui/manifest.json", "utf-8"));
      expect(manifest.components["alert-dialog"]).toBeDefined();
      expect(manifest.components.button).toBeDefined();

      // Check dependency installation was called (combined deps from both components)
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

      await expect(command.execute(["--local", "nonexistent"])).rejects.toThrow(
        "process.exit called"
      );
    });
  });
});
