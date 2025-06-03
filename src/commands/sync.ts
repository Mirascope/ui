import { BaseCommand, ExecutionContext } from "./base";
import { ManifestManager } from "../manifest";
import { AddCommand } from "./add";
import { parseArgs } from "util";

export class SyncCommand extends BaseCommand {
  async execute(args: string[], context: ExecutionContext): Promise<void> {
    const { values, positionals } = parseArgs({
      args,
      allowPositionals: true,
      options: {
        help: { type: "boolean" },
      },
    });

    const componentNames = positionals;

    if (values.help) {
      console.log(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] sync [component1] [component2] ..."
      );
      console.log("");
      console.log("Syncs components from the registry to update local files.");
      console.log("If no components specified, syncs all tracked components.");
      console.log("");
      console.log("Global Options:");
      console.log("  --local              Use local registry.json in current directory");
      console.log("  --local-path <path>  Use local registry.json at specified path");
      console.log(
        "  --registry-url <url> Override registry URL (default: https://ui.mirascope.com)"
      );
      console.log(
        "  --target <path>      Target directory for file operations (default: current directory)"
      );
      process.exit(0);
    }

    try {
      const manifest = new ManifestManager(context.targetPath);
      if (!(await manifest.exists())) {
        console.error("❌ Manifest not found. Run 'mirascope-ui init' first.");
        process.exit(1);
      }

      const manifestData = await manifest.read();
      const trackedComponents = Object.keys(manifestData.components);

      if (trackedComponents.length === 0) {
        console.log(
          "📦 No components tracked yet. Run 'mirascope-ui add <component>' to add components."
        );
        return;
      }

      let componentsToSync: string[];
      if (componentNames.length > 0) {
        // Sync specific components (no need to validate - AddCommand will handle)
        componentsToSync = componentNames;
        console.log(`🔄 Syncing components: ${componentsToSync.join(", ")}`);
      } else {
        // Sync all tracked components
        componentsToSync = trackedComponents;
        console.log(`🔄 Syncing all ${componentsToSync.length} tracked components...`);
      }

      // AddCommand now handles remove + add automatically for existing components
      const addCommand = new AddCommand();
      await addCommand.execute(componentsToSync, context);

      // Update full sync timestamp if syncing all components
      if (componentNames.length === 0) {
        await manifest.updateFullSync();
      }
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}
