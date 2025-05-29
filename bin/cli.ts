#!/usr/bin/env bun

import { InitCommand } from "../src/commands/init";
import { SyncCommand } from "../src/commands/sync";
import { AddCommand } from "../src/commands/add";
import { RemoveCommand } from "../src/commands/remove";
import { StatusCommand } from "../src/commands/status";
import { ExecutionContext } from "../src/commands/base";
import { FileRegistry, RemoteRegistry } from "../src/registry";
import { existsSync } from "fs";
import { join } from "path";

const COMMANDS = {
  init: InitCommand,
  sync: SyncCommand,
  add: AddCommand,
  remove: RemoveCommand,
  status: StatusCommand,
} as const;

type Command = keyof typeof COMMANDS;

async function main() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length === 0) {
    console.error("Usage: mirascope-ui <command> [args]");
    console.error("Commands: init, sync, add, remove, status");
    process.exit(1);
  }

  // Parse global flags manually
  const globalFlags = { local: false, localPath: "", registryUrl: "", target: "" };
  const remainingArgs: string[] = [];
  let i = 0;

  while (i < rawArgs.length) {
    const arg = rawArgs[i];
    if (arg === "--local") {
      globalFlags.local = true;
      i++;
    } else if (arg === "--local-path") {
      globalFlags.local = true;
      const nextArg = rawArgs[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        console.error("❌ --local-path requires a path argument");
        process.exit(1);
      }
      globalFlags.localPath = nextArg;
      i += 2;
    } else if (arg === "--registry-url") {
      const nextArg = rawArgs[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        console.error("❌ --registry-url requires a URL argument");
        process.exit(1);
      }
      globalFlags.registryUrl = nextArg;
      i += 2;
    } else if (arg === "--target") {
      const nextArg = rawArgs[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        console.error("❌ --target requires a path argument");
        process.exit(1);
      }
      globalFlags.target = nextArg;
      i += 2;
    } else {
      remainingArgs.push(arg);
      i++;
    }
  }

  const [command, ...args] = remainingArgs;

  if (!command || !(command in COMMANDS)) {
    console.error(
      "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] <command> [args]"
    );
    console.error("Commands: init, sync, add, remove, status");
    process.exit(1);
  }

  // Determine target directory and validate
  const targetPath = globalFlags.target || process.cwd();
  const packageJsonPath = join(targetPath, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.error(`❌ No package.json found in target directory: ${targetPath}`);
    console.error(
      "Please run this command from your project root or specify a valid --target directory."
    );
    process.exit(1);
  }

  // Create registry based on flags
  const registry = globalFlags.local
    ? new FileRegistry(globalFlags.localPath || process.cwd())
    : new RemoteRegistry(
        globalFlags.registryUrl || process.env.MIRASCOPE_REGISTRY_URL || "https://ui.mirascope.com"
      );

  const context: ExecutionContext = { registry, targetPath };

  const CommandClass = COMMANDS[command as Command];
  const commandInstance = new CommandClass();

  try {
    await commandInstance.execute(args, context);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
