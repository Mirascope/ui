import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, readFile, stat } from "fs/promises";
import { join } from "path";
import {
  runCLI,
  createTempProject,
  createTempRegistry,
  cleanupTempDir,
} from "../helpers/test-utils";

describe("Add Command Integration", () => {
  const tempDir = join(process.cwd(), "test-temp-add-integration");
  let projectPath: string;
  let registryPath: string;

  beforeEach(async () => {
    projectPath = await createTempProject(tempDir, "test-project");
    registryPath = await createTempRegistry(tempDir, "test-registry");
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("basic add functionality", () => {
    test("adds single component with local registry", async () => {
      // Create registry
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui",
            dependencies: ["@radix-ui/react-slot"],
            files: [
              {
                path: "mirascope-ui/ui/button.tsx",
                type: "registry:ui",
                content: "export const Button = () => <button>Click me</button>;",
              },
            ],
          },
        ],
      };

      await writeFile(join(registryPath, "registry.json"), JSON.stringify(registryData));

      // Create registry files
      await mkdir(join(registryPath, "mirascope-ui", "ui"), { recursive: true });
      await writeFile(
        join(registryPath, "mirascope-ui", "ui", "button.tsx"),
        "export const Button = () => <button>Click me</button>;"
      );

      // Initialize project
      await runCLI(["init"], projectPath);

      // Add component
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "button"],
        projectPath
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("🔍 Fetching components: button");
      expect(result.stdout).toContain("📦 Adding button...");
      expect(result.stdout).toContain("✅ Added 1 component");

      // Check manifest was updated
      const manifestPath = join(projectPath, "mirascope-ui", "manifest.json");
      const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
      expect(manifest.components.button).toBeDefined();
      expect(manifest.components.button.files).toEqual(["mirascope-ui/ui/button.tsx"]);

      // Check component file was created
      const componentPath = join(projectPath, "mirascope-ui", "ui", "button.tsx");
      const componentContent = await readFile(componentPath, "utf-8");
      expect(componentContent).toBe("export const Button = () => <button>Click me</button>;");
    });

    test("adds multiple components", async () => {
      // Create registry
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui",
            files: [
              {
                path: "mirascope-ui/ui/button.tsx",
                type: "registry:ui",
                content: "export const Button = () => <button />;",
              },
            ],
          },
          {
            name: "input",
            type: "registry:ui",
            files: [
              {
                path: "mirascope-ui/ui/input.tsx",
                type: "registry:ui",
                content: "export const Input = () => <input />;",
              },
            ],
          },
        ],
      };

      await writeFile(join(registryPath, "registry.json"), JSON.stringify(registryData));

      // Create registry files
      await mkdir(join(registryPath, "mirascope-ui", "ui"), { recursive: true });
      await writeFile(
        join(registryPath, "mirascope-ui", "ui", "button.tsx"),
        "export const Button = () => <button />;"
      );
      await writeFile(
        join(registryPath, "mirascope-ui", "ui", "input.tsx"),
        "export const Input = () => <input />;"
      );

      // Initialize project
      await runCLI(["init"], projectPath);

      // Add components
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "button", "input"],
        projectPath
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("🔍 Fetching components: button, input");
      expect(result.stdout).toContain("✅ Added 2 components");

      // Check both components exist
      const buttonPath = join(projectPath, "mirascope-ui", "ui", "button.tsx");
      const inputPath = join(projectPath, "mirascope-ui", "ui", "input.tsx");

      await expect(stat(buttonPath)).resolves.toBeTruthy();
      await expect(stat(inputPath)).resolves.toBeTruthy();
    });

    test("handles already tracked components", async () => {
      // Create registry
      const registryData = {
        items: [
          {
            name: "button",
            type: "registry:ui",
            files: [
              {
                path: "mirascope-ui/ui/button.tsx",
                type: "registry:ui",
                content: "export const Button = () => <button />;",
              },
            ],
          },
        ],
      };

      await writeFile(join(registryPath, "registry.json"), JSON.stringify(registryData));
      await mkdir(join(registryPath, "mirascope-ui", "ui"), { recursive: true });
      await writeFile(
        join(registryPath, "mirascope-ui", "ui", "button.tsx"),
        "export const Button = () => <button />;"
      );

      // Initialize project and add component first time
      await runCLI(["init"], projectPath);
      await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "button"],
        projectPath
      );

      // Try to add again
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "button"],
        projectPath
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("🔄 Syncing button...");
      expect(result.stdout).toContain("✅ Added 1 component");
    });
  });

  describe("registry dependencies", () => {
    test("resolves and adds registry dependencies", async () => {
      const registryData = {
        items: [
          {
            name: "alert-dialog",
            type: "registry:ui",
            registryDependencies: ["button"],
            files: [
              {
                path: "mirascope-ui/ui/alert-dialog.tsx",
                type: "registry:ui",
                content: "export const AlertDialog = () => null;",
              },
            ],
          },
          {
            name: "button",
            type: "registry:ui",
            files: [
              {
                path: "mirascope-ui/ui/button.tsx",
                type: "registry:ui",
                content: "export const Button = () => <button />;",
              },
            ],
          },
        ],
      };

      await writeFile(join(registryPath, "registry.json"), JSON.stringify(registryData));
      await mkdir(join(registryPath, "mirascope-ui", "ui"), { recursive: true });
      await writeFile(
        join(registryPath, "mirascope-ui", "ui", "alert-dialog.tsx"),
        "export const AlertDialog = () => null;"
      );
      await writeFile(
        join(registryPath, "mirascope-ui", "ui", "button.tsx"),
        "export const Button = () => <button />;"
      );

      // Initialize project
      await runCLI(["init"], projectPath);

      // Add component with registry dependency
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "alert-dialog"],
        projectPath
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("📦 Adding button...");
      expect(result.stdout).toContain("📦 Adding alert-dialog...");
      expect(result.stdout).toContain("✅ Added 2 components");

      // Check both components were added
      const manifestPath = join(projectPath, "mirascope-ui", "manifest.json");
      const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
      expect(manifest.components["alert-dialog"]).toBeDefined();
      expect(manifest.components.button).toBeDefined();
    });
  });

  describe("different component types", () => {
    test("handles blocks and lib components", async () => {
      const registryData = {
        items: [
          {
            name: "code-block",
            type: "registry:block",
            files: [
              {
                path: "mirascope-ui/blocks/code-block.tsx",
                type: "registry:block",
                content: "export const CodeBlock = () => null;",
              },
              {
                path: "mirascope-ui/lib/code-highlight.ts",
                type: "registry:lib",
                content: "export const highlight = () => {};",
              },
            ],
          },
        ],
      };

      await writeFile(join(registryPath, "registry.json"), JSON.stringify(registryData));
      await mkdir(join(registryPath, "mirascope-ui", "blocks"), { recursive: true });
      await mkdir(join(registryPath, "mirascope-ui", "lib"), { recursive: true });
      await writeFile(
        join(registryPath, "mirascope-ui", "blocks", "code-block.tsx"),
        "export const CodeBlock = () => null;"
      );
      await writeFile(
        join(registryPath, "mirascope-ui", "lib", "code-highlight.ts"),
        "export const highlight = () => {};"
      );

      // Initialize project
      await runCLI(["init"], projectPath);

      // Add block component
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "code-block"],
        projectPath
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("✅ Added 1 component");

      // Check files were created in correct locations
      const blockPath = join(projectPath, "mirascope-ui", "blocks", "code-block.tsx");
      const libPath = join(projectPath, "mirascope-ui", "lib", "code-highlight.ts");

      await expect(stat(blockPath)).resolves.toBeTruthy();
      await expect(stat(libPath)).resolves.toBeTruthy();
    });
  });

  describe("error handling", () => {
    test("fails for non-existent component", async () => {
      // Create empty registry
      await writeFile(join(registryPath, "registry.json"), JSON.stringify({ items: [] }));

      // Initialize project
      await runCLI(["init"], projectPath);

      // Try to add non-existent component
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "nonexistent"],
        projectPath
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Component "nonexistent" not found in registry');
    });

    test("fails when local registry doesn't exist", async () => {
      // Initialize project
      await runCLI(["init"], projectPath);

      // Try to add with local flag but no registry.json
      const result = await runCLI(
        ["add", "--local-path", registryPath, "--target", projectPath, "button"],
        projectPath
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Failed to read local registry");
    });

    test("fails when --local is used without --target", async () => {
      const result = await runCLI(["add", "--local", "button"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "❌ --local requires --target to specify where to install components"
      );
    });

    test("fails when source and target directories are the same", async () => {
      const result = await runCLI(
        ["add", "--local", "--target", projectPath, "button"],
        projectPath
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "❌ Registry source and target directories cannot be the same"
      );
    });

    test("shows usage when no components specified", async () => {
      const result = await runCLI(["add"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("❌ No components specified");
      expect(result.stderr).toContain(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] add"
      );
    });
  });

  describe("command line options", () => {
    test("accepts --registry-url option", async () => {
      // Initialize project
      await runCLI(["init"], projectPath);

      // This will fail because we don't have a server, but we can check the error message
      const result = await runCLI(
        ["add", "--registry-url", "http://localhost:3000", "button"],
        projectPath
      );

      expect(result.exitCode).toBe(1);
      // Should attempt to fetch from the specified URL
      expect(result.stderr).toContain("Failed to fetch registry");
    });
  });
});
