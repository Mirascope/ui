import { BaseCommand, ExecutionContext } from "./base";

export class RemoveCommand extends BaseCommand {
  async execute(args: string[], _context: ExecutionContext): Promise<void> {
    if (args.length === 0) {
      console.error("❌ No components specified");
      console.error("Usage: mirascope-ui remove <component1> [component2] ...");
      process.exit(1);
    }

    console.log("🚧 Remove command not implemented yet");
    console.log(`   Would remove: ${args.join(", ")}`);
  }
}
