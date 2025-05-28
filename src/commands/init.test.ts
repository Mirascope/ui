import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { InitCommand } from "./init";

describe("InitCommand", () => {
  const testDir = join(process.cwd(), "test-temp-init");
  const packageJsonPath = join(testDir, "package.json");
  const manifestPath = join(testDir, "src", "mirascope-ui", "manifest.json");

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(packageJsonPath, JSON.stringify({ name: "test" }));

    // Change working directory for ManifestManager
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Change back to original directory
    process.chdir(join(testDir, ".."));
    await rm(testDir, { recursive: true, force: true });
  });

  test("should create manifest successfully", async () => {
    const command = new InitCommand();

    // Capture console output
    const consoleLogs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => consoleLogs.push(args.join(" "));

    await command.execute([]);

    console.log = originalLog;

    // Check that manifest was created
    const fs = await import("fs/promises");
    const manifestExists = await fs
      .access(manifestPath)
      .then(() => true)
      .catch(() => false);
    expect(manifestExists).toBe(true);

    // Check console output
    expect(consoleLogs.some((log) => log.includes("Initializing Mirascope UI Registry"))).toBe(
      true
    );
    expect(consoleLogs.some((log) => log.includes("Created manifest"))).toBe(true);
  });

  test("should fail when manifest already exists", async () => {
    // Create manifest first
    await mkdir(join(testDir, "src", "mirascope-ui"), { recursive: true });
    await writeFile(manifestPath, JSON.stringify({ registryUrl: "test" }));

    const command = new InitCommand();

    // Capture console output
    const consoleErrors: string[] = [];
    const originalError = console.error;
    console.error = (...args) => consoleErrors.push(args.join(" "));

    // Mock process.exit to prevent test from actually exiting
    const originalExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((code: number) => {
      exitCode = code;
    }) as any;

    await command.execute([]);

    console.error = originalError;
    process.exit = originalExit;

    expect(exitCode).toBe(1);
    expect(consoleErrors.some((error) => error.includes("Manifest already exists"))).toBe(true);
  });
});
