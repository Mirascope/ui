import { BaseCommand, ExecutionContext } from "./base";
import { ManifestManager } from "../manifest";
import { findComponents } from "../registry";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { parseArgs } from "util";
import { InitCommand } from "./init";

export class AddCommand extends BaseCommand {
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
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] add <component1> [component2] ..."
      );
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
        "Usage: mirascope-ui [--local] [--local-path <path>] [--registry-url <url>] [--target <path>] add <component1> [component2] ..."
      );
      process.exit(1);
    }

    try {
      console.log(`🔍 Fetching components: ${componentNames.join(", ")}`);

      const manifest = new ManifestManager(context.targetPath);
      if (!(await manifest.exists())) {
        console.log("🚀 No manifest found. Initializing project...");
        const initCommand = new InitCommand();
        await initCommand.execute([], context);
      }

      const components = await findComponents(context.registry, componentNames);

      // Check for already tracked components
      const manifestData = await manifest.read();
      const alreadyTracked = components.filter((c) => c.name in manifestData.components);
      if (alreadyTracked.length > 0) {
        console.log(`⚠️  Already tracking: ${alreadyTracked.map((c) => c.name).join(", ")}`);
        console.log("   Use 'mirascope-ui sync' to update them");
      }

      const newComponents = components.filter((c) => !(c.name in manifestData.components));
      if (newComponents.length === 0) {
        console.log("✅ All components already tracked");
        return;
      }

      // Collect all dependencies (including registry dependencies)
      const allDeps = new Set<string>();
      const registryDeps = new Set<string>();

      for (const component of newComponents) {
        component.dependencies?.forEach((dep) => allDeps.add(dep));
        component.registryDependencies?.forEach((dep) => registryDeps.add(dep));
      }

      // Resolve registry dependencies
      if (registryDeps.size > 0) {
        console.log(`🔗 Resolving registry dependencies: ${Array.from(registryDeps).join(", ")}`);
        const depComponents = await findComponents(context.registry, Array.from(registryDeps));
        for (const dep of depComponents) {
          if (!(dep.name in manifestData.components)) {
            newComponents.push(dep);
            dep.dependencies?.forEach((d) => allDeps.add(d));
          }
        }
      }

      // Download and save all component files
      for (const component of newComponents) {
        console.log(`📦 Adding ${component.name}...`);

        const files: string[] = [];
        for (const file of component.files) {
          const content = await context.registry.fetchComponentFile(file.path);

          // Determine target path
          const targetPath = file.target || this.getDefaultTargetPath(file.path);
          const fullTargetPath = join(context.targetPath, targetPath);

          // Ensure directory exists
          await mkdir(dirname(fullTargetPath), { recursive: true });

          // Write file
          await writeFile(fullTargetPath, content, "utf-8");
          files.push(targetPath);
        }

        // Add to manifest
        await manifest.addComponent(component.name, files);
      }

      // Install npm dependencies if any
      if (allDeps.size > 0) {
        console.log(`📦 Installing dependencies: ${Array.from(allDeps).join(", ")}`);
        await this.installDependencies(Array.from(allDeps), context.targetPath);
      }

      console.log(
        `✅ Added ${newComponents.length} component${newComponents.length === 1 ? "" : "s"}`
      );
      newComponents.forEach((c) => console.log(`   • ${c.name}`));
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  private getDefaultTargetPath(sourcePath: string): string {
    return sourcePath;
  }

  private async installDependencies(dependencies: string[], targetPath: string): Promise<void> {
    const { spawn } = await import("child_process");

    return new Promise((resolve, reject) => {
      const proc = spawn("bun", ["add", ...dependencies], {
        stdio: "inherit",
        cwd: targetPath,
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Dependency installation failed with code ${code}`));
        }
      });

      proc.on("error", (error) => {
        reject(new Error(`Failed to run bun add: ${error.message}`));
      });
    });
  }
}
