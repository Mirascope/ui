import { BaseCommand } from "./base";

export class AddCommand extends BaseCommand {
  async execute(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.error("❌ No components specified");
      console.error("Usage: mirascope-ui add <component1> [component2] ...");
      process.exit(1);
    }

    console.log("🚧 Add command not implemented yet");
    console.log(`   Would add: ${args.join(", ")}`);
  }
}
