import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { SyncCommand } from "./sync";
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { join } from "path";
import { createTestContext } from "../test-utils";
import { RegistryComponent } from "../types";
import { REGISTRY_URL } from "../constants";

describe("SyncCommand", () => {
  const tempDir = join(process.cwd(), "test-temp-sync");
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

  describe("manifest validation", () => {
    test("shows error if manifest doesn't exist", async () => {
      const command = new SyncCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute([], context)).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Manifest not found. Run 'mirascope-ui init' first."
      );
    });

    test("shows message if no components tracked", async () => {
      await mkdir("mirascope-ui", { recursive: true });
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {},
          lastFullSync: "",
        })
      );

      const command = new SyncCommand();
      const context = createTestContext([], {}, tempDir);

      await command.execute([], context);
      expect(logSpy).toHaveBeenCalledWith(
        "📦 No components tracked yet. Run 'mirascope-ui add <component>' to add components."
      );
    });
  });

  describe("component syncing", () => {
    beforeEach(async () => {
      await mkdir("mirascope-ui", { recursive: true });
    });

    test("syncs all tracked components when no args provided", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const cardComponent: RegistryComponent = {
        name: "card",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/card.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx":
          "export const Button = () => <button>Updated Button</button>;",
        "mirascope-ui/ui/card.tsx": "export const Card = () => <div>Updated Card</div>;",
      };

      const context = createTestContext([buttonComponent, cardComponent], files, tempDir);

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {
            button: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/button.tsx"],
            },
            card: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/card.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new SyncCommand();
      await command.execute([], context);

      expect(logSpy).toHaveBeenCalledWith("🔄 Syncing all 2 tracked components...");
      expect(logSpy).toHaveBeenCalledWith("🔄 Syncing button...");
      expect(logSpy).toHaveBeenCalledWith("🔄 Syncing card...");
      expect(logSpy).toHaveBeenCalledWith("✅ Added 2 components");

      const buttonContent = await readFile("mirascope-ui/ui/button.tsx", "utf-8");
      expect(buttonContent).toBe("export const Button = () => <button>Updated Button</button>;");

      const cardContent = await readFile("mirascope-ui/ui/card.tsx", "utf-8");
      expect(cardContent).toBe("export const Card = () => <div>Updated Card</div>;");
    });

    test("syncs specific components when args provided", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx":
          "export const Button = () => <button>Updated Button</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {
            button: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/button.tsx"],
            },
            card: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/card.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new SyncCommand();
      await command.execute(["button"], context);

      expect(logSpy).toHaveBeenCalledWith("🔄 Syncing components: button");
      expect(logSpy).toHaveBeenCalledWith("🔄 Syncing button...");
      expect(logSpy).toHaveBeenCalledWith("✅ Added 1 component");
    });

    test("shows error for untracked components", async () => {
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {
            button: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/button.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new SyncCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute(["nonexistent"], context)).rejects.toThrow(
        "process.exit called"
      );
      expect(errorSpy).toHaveBeenCalledWith('❌ Component "nonexistent" not found in registry');
    });

    test("updates lastSync timestamp", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx":
          "export const Button = () => <button>Updated Button</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {
            button: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/button.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new SyncCommand();
      await command.execute(["button"], context);

      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);

      expect(manifest.components.button.lastSync).not.toBe("2023-01-01T00:00:00.000Z");
      expect(new Date(manifest.components.button.lastSync)).toBeInstanceOf(Date);
    });

    test("updates lastFullSync when syncing all components", async () => {
      const buttonComponent: RegistryComponent = {
        name: "button",
        type: "registry:ui" as const,
        files: [{ path: "mirascope-ui/ui/button.tsx", type: "registry:ui" as const, content: "" }],
      };

      const files = {
        "mirascope-ui/ui/button.tsx":
          "export const Button = () => <button>Updated Button</button>;",
      };

      const context = createTestContext([buttonComponent], files, tempDir);

      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: REGISTRY_URL,
          components: {
            button: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/button.tsx"],
            },
          },
          lastFullSync: "2023-01-01T00:00:00.000Z",
        })
      );

      const command = new SyncCommand();
      await command.execute([], context);

      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);

      expect(manifest.lastFullSync).not.toBe("2023-01-01T00:00:00.000Z");
      expect(new Date(manifest.lastFullSync)).toBeInstanceOf(Date);
    });
  });

  describe("help output", () => {
    test("shows help when --help flag is provided", async () => {
      const command = new SyncCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute(["--help"], context)).rejects.toThrow("process.exit called");
      expect(logSpy).toHaveBeenCalledWith(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] sync [component1] [component2] ..."
      );
    });
  });
});
