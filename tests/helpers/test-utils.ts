import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";

export async function createTempProject(basePath: string, name: string): Promise<string> {
  const projectPath = join(basePath, name);

  await mkdir(projectPath, { recursive: true });

  const packageJson = {
    name: name,
    version: "1.0.0",
    private: true,
    type: "module",
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
  };

  await writeFile(join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2));

  return projectPath;
}

export async function createTempRegistry(basePath: string, name: string): Promise<string> {
  const registryPath = join(basePath, name);
  await mkdir(registryPath, { recursive: true });
  return registryPath;
}

export async function cleanupTempDir(path: string): Promise<void> {
  try {
    await rm(path, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

export interface CLIResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runCLI(args: string[], cwd: string): Promise<CLIResult> {
  const cliPath = join(process.cwd(), "bin", "cli.ts");

  return new Promise((resolve) => {
    const child = spawn("bun", ["run", cliPath, ...args], {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 0,
      });
    });
  });
}
