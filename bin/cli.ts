#!/usr/bin/env bun

import { InitCommand } from "../src/commands/init";
import { SyncCommand } from "../src/commands/sync";
import { AddCommand } from "../src/commands/add";
import { RemoveCommand } from "../src/commands/remove";
import { StatusCommand } from "../src/commands/status";
import { ExecutionContext } from "../src/commands/base";
import { FileRegistry, RemoteRegistry } from "../src/registry";

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
  const globalFlags = { local: false, localPath: "", registryUrl: "" };
  const remainingArgs: string[] = [];
  let i = 0;

  while (i < rawArgs.length) {
    const arg = rawArgs[i];
    if (arg === "--local") {
      globalFlags.local = true;
      i++;
    } else if (arg === "--local-path") {
      globalFlags.local = true;
      globalFlags.localPath = rawArgs[i + 1] || "";
      i += 2;
    } else if (arg === "--registry-url") {
      globalFlags.registryUrl = rawArgs[i + 1] || "";
      i += 2;
    } else {
      remainingArgs.push(arg);
      i++;
    }
  }

  const [command, ...args] = remainingArgs;

  if (!command || !(command in COMMANDS)) {
    console.error(
      "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] <command> [args]"
    );
    console.error("Commands: init, sync, add, remove, status");
    process.exit(1);
  }

  // Create registry based on flags
  const registry = globalFlags.local
    ? new FileRegistry(globalFlags.localPath || process.cwd())
    : new RemoteRegistry(
        globalFlags.registryUrl || process.env.MIRASCOPE_REGISTRY_URL || "https://ui.mirascope.com"
      );

  const context: ExecutionContext = { registry };

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
