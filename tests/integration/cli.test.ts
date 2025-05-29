import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync } from "fs";
import { join } from "path";
import { createTempProject, cleanupTempDir, runCLI } from "../helpers/test-utils";

describe("CLI Integration", () => {
  const tempDir = join(process.cwd(), "test-temp-cli");
  let projectPath: string;

  beforeEach(async () => {
    projectPath = await createTempProject(tempDir, "test-project");
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("init command", () => {
    test("should create manifest in clean project", async () => {
      const result = await runCLI(["init"], projectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Initializing Mirascope UI Registry");
      expect(result.stdout).toContain("Created manifest");

      const manifestPath = join(projectPath, "mirascope-ui", "manifest.json");
      expect(existsSync(manifestPath)).toBe(true);
    });

    test("should fail when manifest already exists", async () => {
      // First init
      await runCLI(["init"], projectPath);

      // Second init should fail
      const result = await runCLI(["init"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Manifest already exists");
    });

    test("should fail when no package.json", async () => {
      const emptyDir = join(tempDir, "empty");
      await createTempProject(tempDir, "empty");
      // Remove package.json
      const fs = await import("fs/promises");
      await fs.rm(join(emptyDir, "package.json"));

      const result = await runCLI(["init"], emptyDir);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No package.json found");
    });
  });

  describe("status command", () => {
    test("should show no manifest message", async () => {
      const result = await runCLI(["status"], projectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("No manifest found");
      expect(result.stdout).toContain("Run 'mirascope-ui add <component>' to get started");
    });

    test("should show empty manifest state", async () => {
      // Initialize first
      await runCLI(["init"], projectPath);

      const result = await runCLI(["status"], projectPath);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("No components tracked yet");
      expect(result.stdout).toContain("Registry URL: https://ui.mirascope.com");
    });

    test("should fail when no package.json", async () => {
      const emptyDir = join(tempDir, "empty");
      await createTempProject(tempDir, "empty");
      // Remove package.json
      const fs = await import("fs/promises");
      await fs.rm(join(emptyDir, "package.json"));

      const result = await runCLI(["status"], emptyDir);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No package.json found");
    });
  });

  describe("command validation", () => {
    test("should show help for invalid command", async () => {
      const result = await runCLI(["invalid"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] <command> [args]"
      );
      expect(result.stderr).toContain("Commands: init, sync, add, remove, status");
    });

    test("should show help for no command", async () => {
      const result = await runCLI([], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage: mirascope-ui <command> [args]");
    });
  });

  describe("stub commands", () => {
    test("add command should validate arguments", async () => {
      const result = await runCLI(["add"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No components specified");
      expect(result.stderr).toContain(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] add"
      );
    });

    test("remove command should validate arguments", async () => {
      const result = await runCLI(["remove"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No components specified");
    });

    test("remove command should require manifest", async () => {
      const result = await runCLI(["remove", "button"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Manifest not found. Run 'mirascope-ui init' first.");
    });

    test("sync command should require manifest", async () => {
      const result = await runCLI(["sync", "button"], projectPath);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Manifest not found. Run 'mirascope-ui init' first.");
    });
  });
});
