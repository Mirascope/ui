import { BaseCommand, ExecutionContext } from "./base";
import { ManifestManager } from "../manifest";
import { findComponents } from "../registry";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { parseArgs } from "util";
import { InitCommand } from "./init";
import { RemoveCommand } from "./remove";

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

      // Track what we've processed in this operation to avoid duplicates
      const processedComponents = new Set<string>();
      const allNpmDeps = new Set<string>();
      const addedComponents: string[] = [];

      // Process each requested component recursively
      for (const componentName of componentNames) {
        await this.addComponentRecursively(
          componentName,
          context,
          processedComponents,
          allNpmDeps,
          addedComponents
        );
      }

      // Install all collected npm dependencies
      if (allNpmDeps.size > 0) {
        console.log(`📦 Installing dependencies: ${Array.from(allNpmDeps).join(", ")}`);
        await this.installDependencies(Array.from(allNpmDeps), context.targetPath);
      }

      console.log(
        `✅ Added ${addedComponents.length} component${addedComponents.length === 1 ? "" : "s"}`
      );
      addedComponents.forEach((c) => console.log(`   • ${c}`));
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  private async addComponentRecursively(
    componentName: string,
    context: ExecutionContext,
    processedComponents: Set<string>,
    allNpmDeps: Set<string>,
    addedComponents: string[]
  ): Promise<void> {
    // Skip if already processed in this operation
    if (processedComponents.has(componentName)) {
      return;
    }

    processedComponents.add(componentName);

    const manifest = new ManifestManager(context.targetPath);
    const manifestData = await manifest.read();

    // If component is already tracked, remove it first (sync behavior)
    if (componentName in manifestData.components) {
      console.log(`🔄 Syncing ${componentName}...`);
      const removeCommand = new RemoveCommand();
      await removeCommand.removeComponent(componentName, context, false);
    }

    // Fetch the component
    const components = await findComponents(context.registry, [componentName]);
    if (components.length === 0) {
      throw new Error(`Component '${componentName}' not found in registry`);
    }

    const component = components[0];

    // First, recursively add all registry dependencies
    if (component.registryDependencies && component.registryDependencies.length > 0) {
      for (const dep of component.registryDependencies) {
        await this.addComponentRecursively(
          dep,
          context,
          processedComponents,
          allNpmDeps,
          addedComponents
        );
      }
    }

    // Now add this component
    const isSync = componentName in manifestData.components;
    console.log(`📦 ${isSync ? "Syncing" : "Adding"} ${componentName}...`);

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
    await manifest.addComponent(componentName, files);
    addedComponents.push(componentName);

    // Collect npm dependencies
    component.dependencies?.forEach((dep) => allNpmDeps.add(dep));
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
