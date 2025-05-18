#!/usr/bin/env node

// This script runs TypeScript type checking on the entire project
// regardless of which files are passed as arguments
// This allows it to work properly with lint-staged

const { execSync } = require("child_process");

console.log("Running TypeScript check on the entire project...");

try {
  // Execute the type checking command - using the same as our lint:ts script
  execSync("bun run tsc --noEmit", { stdio: "inherit" });
  console.log("TypeScript check passed");
} catch (error) {
  console.error("TypeScript check failed!");
  process.exit(1);
}

try {
  // Execute the type checking command - using the same as our lint:ts script
  execSync("bun test", { stdio: "inherit" });
  console.log("TypeScript tests passed");
  process.exit(0);
} catch (error) {
  console.error("TypeScript tests failed!");
  process.exit(1);
}
