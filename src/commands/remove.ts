import { BaseCommand, ExecutionContext } from "./base";
import { ManifestManager } from "../manifest";
import { rm } from "fs/promises";
import { join } from "path";
import { parseArgs } from "util";

export class RemoveCommand extends BaseCommand {
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
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] remove <component1> [component2] ..."
      );
      console.log("");
      console.log("Removes components and their files from the project.");
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

    if (componentNames.length === 0) {
      console.error("❌ No components specified");
      console.error(
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] remove <component1> [component2] ..."
      );
      process.exit(1);
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
        console.log("📦 No components tracked yet.");
        return;
      }

      const invalidComponents = componentNames.filter((name) => !(name in manifestData.components));
      if (invalidComponents.length > 0) {
        console.error(`❌ Components not tracked: ${invalidComponents.join(", ")}`);
        console.error("Available components:", trackedComponents.join(", "));
        process.exit(1);
      }

      console.log(`🗑️  Removing components: ${componentNames.join(", ")}`);

      for (const componentName of componentNames) {
        console.log(`📦 Removing ${componentName}...`);

        const componentInfo = manifestData.components[componentName];

        // Remove files
        for (const file of componentInfo.files) {
          const fullFilePath = join(context.targetPath, file);
          try {
            await rm(fullFilePath, { force: true });
          } catch (error) {
            console.warn(
              `⚠️  Could not remove file ${file}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        // Remove from manifest
        await manifest.removeComponent(componentName);
      }

      console.log(
        `✅ Removed ${componentNames.length} component${componentNames.length === 1 ? "" : "s"}`
      );
      componentNames.forEach((name) => console.log(`   • ${name}`));
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}
