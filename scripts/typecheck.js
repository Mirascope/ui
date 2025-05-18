#!/usr/bin/env node

// This script runs TypeScript type checking on the entire project
// regardless of which files are passed as arguments
// This allows it to work properly with lint-staged

const { spawnSync } = require('child_process');

// Run TypeScript compiler (ignoring any file arguments)
const result = spawnSync('bun', ['run', 'tsc', '--noEmit'], {
  stdio: 'inherit',
  shell: true
});

// Exit with the same code as tsc
process.exit(result.status);