# Mirascope Registry Sync Tool

## Purpose

Enable consuming projects to maintain automatic synchronization with mirascope/ui as the single source of truth, departing from shadcn's "copy then own" philosophy in favor of "sync and stay current."

## Core Philosophy

- **mirascope/ui is SoT**: Components should stay in sync with upstream
- **Explicit tracking**: Clear visibility into what comes from registry vs local code
- **Automated updates**: Enable daily sync checks and PR automation
- **Selective sync**: Only update components you've chosen to use

## Architecture

### Distribution

- Sync tool ships as part of `@mirascope/ui` package
- Consuming projects: `bun add -D @mirascope/ui`
- CLI available as: `bun mirascope-ui` (or `npx mirascope-ui`)

### File Organization (in consuming projects)

```
project-root/
├── src/
│   └── components/ui/      # Local components
├── mirascope-ui/          # Synced from mirascope/ui
│   ├── manifest.json      # Tracking file
│   ├── ui/                # Registry UI components
│   ├── blocks/            # Registry blocks
│   └── lib/               # Registry utilities
└── package.json
```

## Manifest File Format

```json
{
  "registryUrl": "https://ui.mirascope.com",
  "components": {
    "button": {
      "version": "main",
      "lastSync": "2025-01-15T10:30:00Z",
      "files": ["mirascope-ui/ui/button.tsx"]
    },
    "dialog": {
      "version": "main",
      "lastSync": "2025-01-15T10:30:00Z",
      "files": ["mirascope-ui/ui/dialog.tsx"]
    }
  },
  "lastFullSync": "2025-01-15T10:30:00Z"
}
```

## Command Interface

All commands support global flags that can be specified before the command name:

```bash
mirascope-ui [global-flags] <command> [command-args]
```

### Global Flags

- `--local` - Use local registry.json file in current directory. When using `--local`, `--target` must be set.
- `--local-path <path>` - Use local registry.json file at specified path
- `--registry-url <url>` - Override registry URL (default: https://ui.mirascope.com)
- `--target <path>` - Target directory for file operations (default: current directory)

### Commands

#### `mirascope-ui init`

Creates initial manifest.json file and sets up mirascope-ui/ directory structure.

- Validates project has package.json
- Creates `mirascope-ui/manifest.json` with default configuration
- Only runs if manifest doesn't already exist

#### `mirascope-ui add <component1> [component2] ...`

Adds or updates components in the project.

- Downloads component files from registry to `mirascope-ui/`
- Recursively resolves registry dependencies (e.g., `button-link` → `button` → `utils`)
- Auto-syncs components: If component already tracked, removes and re-adds with latest version
- Installs npm dependencies via `bun add`
- Updates manifest to track new components

#### `mirascope-ui sync [component1] [component2] ...`

Updates all tracked components to latest versions. If components are passed, then it is an alias for calling `mirascpe-ui add`.

#### `mirascope-ui remove <component1> [component2] ...`

Removes components from the project.

- Deletes component files from filesystem
- Removes components from manifest tracking
- Does not remove npm dependencies (to avoid breaking other code)

#### `mirascope-ui status`

Shows current state of tracked components.

- Lists all tracked components with last sync times
- Shows registry URL being used
- Reports last full sync timestamp
- Provides guidance for next steps if no components tracked

## Registry Configuration

### Default Behavior

Commands fetch components from the registry URL specified in `manifest.json` (default: `https://ui.mirascope.com`).

### Development Flags

For testing registry changes during development:

#### `--local` flag

```bash
mirascope-ui --local --target ../other/path add button
```

- Reads `registry.json` from current directory
- Useful when you want to test local changes to registry within another project.
- Must use `--target` flag too (since installing registry components into the registry itself does not make sense)

#### `--local-path` flag

```bash
mirascope-ui --local-path /path/to/registry add button
```

- Reads `registry.json` from specified path
- Useful when registry source is in a different location

#### `--registry-url` flag

```bash
mirascope-ui --registry-url http://localhost:3000 add button
```

- Overrides registry URL (e.g., local dev server)
- Useful for testing against staging/development registry endpoints

#### `--target` flag

```bash
mirascope-ui --target /path/to/project add button
```

- Changes where files are written (default: current directory)
- Useful for testing changes on other projects

## Integration Points

### Package.json Scripts

```json
{
  "scripts": {
    "sync-registry": "mirascope-ui",
    "sync-registry:check": "mirascope-ui status"
  }
}
```

## Key Behaviors

### Overwrite Strategy

- Registry files are **always overwritten** on sync
- No merge conflicts - mirascope/ui wins
- Clear separation from local components prevents accidental modifications

### Registry Dependencies

Components can declare dependencies on other registry components using `registryDependencies`. For example, most UI components depend on the `utils` component for the `cn()` utility function.

## Examples

### Basic Usage

```bash
# Initialize project
mirascope-ui init

# Add components
mirascope-ui add button dialog

# Check status
mirascope-ui status

# Update all components
mirascope-ui sync

# Update specific components
mirascope-ui sync button

# Remove components
mirascope-ui remove dialog
```

### Development Workflows

```bash
# Test against local registry during development
mirascope-ui --local add button

# Test against dev server
mirascope-ui --registry-url http://localhost:3000 add button

# Use registry from different path
mirascope-ui --local-path ../ui-registry add button

# Install to different target directory
mirascope-ui --target ./my-project add button
```

### CI/CD Integration

```json
{
  "scripts": {
    "sync-registry": "mirascope-ui sync",
    "sync-registry:check": "mirascope-ui status"
  }
}
```
