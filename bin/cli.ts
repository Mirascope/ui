#!/usr/bin/env bun

import { parseArgs } from "util";
import { InitCommand } from "../src/commands/init";
import { SyncCommand } from "../src/commands/sync";
import { AddCommand } from "../src/commands/add";
import { RemoveCommand } from "../src/commands/remove";
import { StatusCommand } from "../src/commands/status";

const COMMANDS = {
  init: InitCommand,
  sync: SyncCommand,
  add: AddCommand,
  remove: RemoveCommand,
  status: StatusCommand,
} as const;

type Command = keyof typeof COMMANDS;

async function main() {
  const { positionals } = parseArgs({
    allowPositionals: true,
    args: process.argv.slice(2),
  });

  const [command, ...args] = positionals;

  if (!command || !(command in COMMANDS)) {
    console.error("Usage: mirascope-ui <command> [args]");
    console.error("Commands: init, sync, add, remove, status");
    process.exit(1);
  }

  const CommandClass = COMMANDS[command as Command];
  const commandInstance = new CommandClass();

  try {
    await commandInstance.execute(args);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
