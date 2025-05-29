import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { RemoveCommand } from "./remove";
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { createTestContext } from "../test-utils";

describe("RemoveCommand", () => {
  const tempDir = join(process.cwd(), "test-temp-remove");
  let logSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;
  let warnSpy: ReturnType<typeof spyOn>;
  let exitSpy: ReturnType<typeof spyOn>;

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
    process.chdir(tempDir);

    logSpy = spyOn(console, "log").mockImplementation(() => {});
    errorSpy = spyOn(console, "error").mockImplementation(() => {});
    warnSpy = spyOn(console, "warn").mockImplementation(() => {});
    exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await writeFile("package.json", JSON.stringify({ name: "test-project" }));
  });

  afterEach(async () => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    exitSpy.mockRestore();

    process.chdir("..");
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("argument parsing", () => {
    test("shows error for no components", async () => {
      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute([], context)).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith("❌ No components specified");
    });

    test("shows help when --help flag is provided", async () => {
      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute(["--help"], context)).rejects.toThrow("process.exit called");
      expect(logSpy).toHaveBeenCalledWith(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] remove <component1> [component2] ..."
      );
    });
  });

  describe("manifest validation", () => {
    test("shows error if manifest doesn't exist", async () => {
      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute(["button"], context)).rejects.toThrow("process.exit called");
      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Manifest not found. Run 'mirascope-ui init' first."
      );
    });

    test("shows message if no components tracked", async () => {
      await mkdir("mirascope-ui", { recursive: true });
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {},
          lastFullSync: "",
        })
      );

      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await command.execute(["button"], context);
      expect(logSpy).toHaveBeenCalledWith("📦 No components tracked yet.");
    });
  });

  describe("component removal", () => {
    beforeEach(async () => {
      await mkdir("mirascope-ui", { recursive: true });
      await mkdir("mirascope-ui/ui", { recursive: true });
    });

    test("removes single component and its files", async () => {
      await writeFile(
        "mirascope-ui/ui/button.tsx",
        "export const Button = () => <button>Click me</button>;"
      );
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
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

      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await command.execute(["button"], context);

      expect(logSpy).toHaveBeenCalledWith("🗑️  Removing components: button");
      expect(logSpy).toHaveBeenCalledWith("📦 Removing button...");
      expect(logSpy).toHaveBeenCalledWith("✅ Removed 1 component");

      // Check file was removed
      expect(existsSync("mirascope-ui/ui/button.tsx")).toBe(false);

      // Check manifest was updated
      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);
      expect(manifest.components.button).toBeUndefined();
    });

    test("removes multiple components", async () => {
      await writeFile(
        "mirascope-ui/ui/button.tsx",
        "export const Button = () => <button>Click me</button>;"
      );
      await writeFile("mirascope-ui/ui/card.tsx", "export const Card = () => <div>Card</div>;");
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
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

      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await command.execute(["button", "card"], context);

      expect(logSpy).toHaveBeenCalledWith("🗑️  Removing components: button, card");
      expect(logSpy).toHaveBeenCalledWith("✅ Removed 2 components");

      // Check files were removed
      expect(existsSync("mirascope-ui/ui/button.tsx")).toBe(false);
      expect(existsSync("mirascope-ui/ui/card.tsx")).toBe(false);

      // Check manifest was updated
      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);
      expect(manifest.components.button).toBeUndefined();
      expect(manifest.components.card).toBeUndefined();
    });

    test("shows error for untracked components", async () => {
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
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

      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await expect(command.execute(["nonexistent"], context)).rejects.toThrow(
        "process.exit called"
      );
      expect(errorSpy).toHaveBeenNthCalledWith(1, "❌ Components not tracked: nonexistent");
      expect(errorSpy).toHaveBeenNthCalledWith(2, "Available components:", "button");
    });

    test("handles file removal errors gracefully", async () => {
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {
            button: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/nonexistent.tsx"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await command.execute(["button"], context);

      expect(logSpy).toHaveBeenCalledWith("✅ Removed 1 component");

      // Check manifest was still updated even though file didn't exist
      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);
      expect(manifest.components.button).toBeUndefined();
    });

    test("removes component with multiple files", async () => {
      await writeFile(
        "mirascope-ui/ui/complex.tsx",
        "export const Complex = () => <div>Complex</div>;"
      );
      await writeFile("mirascope-ui/ui/complex.module.css", ".complex { color: red; }");
      await writeFile(
        "mirascope-ui/manifest.json",
        JSON.stringify({
          registryUrl: "https://ui.mirascope.com",
          components: {
            complex: {
              version: "main",
              lastSync: "2023-01-01T00:00:00.000Z",
              files: ["mirascope-ui/ui/complex.tsx", "mirascope-ui/ui/complex.module.css"],
            },
          },
          lastFullSync: "",
        })
      );

      const command = new RemoveCommand();
      const context = createTestContext([], {}, tempDir);

      await command.execute(["complex"], context);

      expect(logSpy).toHaveBeenCalledWith("✅ Removed 1 component");

      // Check both files were removed
      expect(existsSync("mirascope-ui/ui/complex.tsx")).toBe(false);
      expect(existsSync("mirascope-ui/ui/complex.module.css")).toBe(false);

      // Check manifest was updated
      const manifestContent = await readFile("mirascope-ui/manifest.json", "utf-8");
      const manifest = JSON.parse(manifestContent);
      expect(manifest.components.complex).toBeUndefined();
    });
  });
});
