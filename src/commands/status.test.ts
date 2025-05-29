import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { StatusCommand } from "./status";
import { createTestContext } from "../test-utils";

describe("StatusCommand", () => {
  const testDir = join(process.cwd(), "test-temp-status");
  const packageJsonPath = join(testDir, "package.json");
  const manifestPath = join(testDir, "src", "mirascope-ui", "manifest.json");

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(packageJsonPath, JSON.stringify({ name: "test" }));
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(join(testDir, ".."));
    await rm(testDir, { recursive: true, force: true });
  });

  function captureConsoleOutput() {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(" "));
    return {
      logs,
      restore: () => {
        console.log = originalLog;
      },
    };
  }

  test("should show no manifest message when manifest doesn't exist", async () => {
    const command = new StatusCommand();
    const context = createTestContext([], {}, testDir);
    const { logs, restore } = captureConsoleOutput();

    await command.execute([], context);

    restore();

    expect(logs.some((log) => log.includes("No manifest found"))).toBe(true);
    expect(logs.some((log) => log.includes("Run 'mirascope-ui add <component>'"))).toBe(true);
  });

  test("should show empty manifest state", async () => {
    await mkdir(join(testDir, "src", "mirascope-ui"), { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({
        registryUrl: "https://ui.mirascope.com",
        components: {},
        lastFullSync: "",
      })
    );

    const command = new StatusCommand();
    const context = createTestContext([], {}, testDir);
    const { logs, restore } = captureConsoleOutput();

    await command.execute([], context);

    restore();

    expect(logs.some((log) => log.includes("No components tracked yet"))).toBe(true);
    expect(logs.some((log) => log.includes("Registry URL: https://ui.mirascope.com"))).toBe(true);
  });

  test("should show populated manifest", async () => {
    await mkdir(join(testDir, "src", "mirascope-ui"), { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({
        registryUrl: "https://ui.mirascope.com",
        components: {
          button: {
            version: "main",
            lastSync: "2025-01-15T10:30:00Z",
            files: ["src/mirascope-ui/ui/button.tsx"],
          },
          dialog: {
            version: "main",
            lastSync: "2025-01-15T11:00:00Z",
            files: ["src/mirascope-ui/ui/dialog.tsx"],
          },
        },
        lastFullSync: "2025-01-15T11:00:00Z",
      })
    );

    const command = new StatusCommand();
    const context = createTestContext([], {}, testDir);
    const { logs, restore } = captureConsoleOutput();

    await command.execute([], context);

    restore();

    expect(logs.some((log) => log.includes("Tracking 2 component(s)"))).toBe(true);
    expect(logs.some((log) => log.includes("button"))).toBe(true);
    expect(logs.some((log) => log.includes("dialog"))).toBe(true);
    expect(logs.some((log) => log.includes("Last sync: 2025-01-15T10:30:00Z"))).toBe(true);
    expect(logs.some((log) => log.includes("Files: 1"))).toBe(true);
    expect(logs.some((log) => log.includes("Last full sync: 2025-01-15T11:00:00Z"))).toBe(true);
  });
});
