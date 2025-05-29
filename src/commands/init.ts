import { BaseCommand, ExecutionContext } from "./base";
import { ManifestManager } from "../manifest";

export class InitCommand extends BaseCommand {
  async execute(_args: string[], context: ExecutionContext): Promise<void> {
    try {
      console.log("🚀 Initializing Mirascope UI Registry");

      const manifest = new ManifestManager(context.targetPath);
      await manifest.init();

      console.log("✅ Created manifest at mirascope-ui/manifest.json");
      console.log("🌐 Registry URL: https://ui.mirascope.com");
      console.log("");
      console.log("Next steps:");
      console.log("  • Run 'mirascope-ui add <component>' to add components");
      console.log("  • Run 'mirascope-ui status' to view current state");
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}
