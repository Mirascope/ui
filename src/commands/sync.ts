import { BaseCommand, ExecutionContext } from "./base";

export class SyncCommand extends BaseCommand {
  async execute(args: string[], _context: ExecutionContext): Promise<void> {
    console.log("🚧 Sync command not implemented yet");
    if (args.length > 0) {
      console.log(`   Would sync: ${args.join(", ")}`);
    } else {
      console.log("   Would sync all components");
    }
  }
}
