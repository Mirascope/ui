import { BaseCommand, ExecutionContext } from "./base";
import { ManifestManager } from "../manifest";

export class StatusCommand extends BaseCommand {
  async execute(_args: string[], _context: ExecutionContext): Promise<void> {
    const manifest = new ManifestManager();

    console.log("📋 Mirascope UI Registry Status");
    console.log("==============================");

    if (!(await manifest.exists())) {
      console.log("❌ No manifest found. Run 'mirascope-ui add <component>' to get started.");
      return;
    }

    const data = await manifest.read();
    const componentCount = Object.keys(data.components).length;

    if (componentCount === 0) {
      console.log("📦 No components tracked yet.");
      console.log("💡 Run 'mirascope-ui add <component>' to add components.");
    } else {
      console.log(`📦 Tracking ${componentCount} component(s):`);
      console.log("");

      for (const [name, info] of Object.entries(data.components)) {
        console.log(`  ${name}`);
        console.log(`    Last sync: ${info.lastSync || "Never"}`);
        console.log(`    Files: ${info.files.length}`);
        console.log("");
      }
    }

    console.log(`🌐 Registry URL: ${data.registryUrl}`);
    if (data.lastFullSync) {
      console.log(`⏰ Last full sync: ${data.lastFullSync}`);
    }
  }
}
