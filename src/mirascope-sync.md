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

- `--local` - Use local registry.json file in current directory
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

Adds new components to the project.

- Downloads component files from registry to `mirascope-ui/`
- Resolves and includes registry dependencies (e.g., components using `cn` util automatically get `utils`)
- Installs npm dependencies via `bun add`
- Updates manifest to track new components
- Skips components already tracked (use `sync` to update them)

#### `mirascope-ui sync [component1] [component2] ...]`

Updates existing tracked components to latest versions.

- **No components specified**: Syncs all tracked components
- **Components specified**: Syncs only named components
- **Implementation**: Runs `remove` then `add` commands to ensure clean updates
- Resolves new dependencies that may have been added to components
- Updates manifest timestamps

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

### Local Development

For testing registry changes during development:

#### `--local` flag

```bash
mirascope-ui --local add button
```

- Reads `registry.json` from current directory
- Useful when working within the registry project itself

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
- Useful for testing or scripting operations on other projects

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

### GitHub Actions Integration

- Daily workflow runs `mirascope-ui status`
- If updates available, runs `mirascope-ui`
- Creates PR with changes and updated manifest
- PR description shows which components were updated

## Key Behaviors

### Overwrite Strategy

- Registry files are **always overwritten** on sync
- No merge conflicts - mirascope/ui wins
- Clear separation from local components prevents accidental modifications

### Registry Dependencies

Components can declare dependencies on other registry components using `registryDependencies`. For example, most UI components depend on the `utils` component for the `cn()` utility function.

When adding or syncing components, registry dependencies are automatically resolved and included. This ensures all required utilities and base components are available.

### Dependency Management

- Installs npm dependencies via `bun add` for new components
- Registry dependencies automatically resolved and included
- Does not remove npm dependencies when removing components (to avoid breaking local code)

### Overwrite Strategy

- Registry files are **always overwritten** during sync operations
- No merge conflicts - registry version always wins
- Clear separation between registry files (`mirascope-ui/`) and local components (`src/`) prevents accidental modifications

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

GitHub Actions workflow:

```yaml
- name: Sync UI Registry
  run: |
    bun mirascope-ui status
    bun mirascope-ui sync
```

## Architecture Notes

- **Command delegation**: `sync` command delegates to `remove` + `add` for clean updates
- **Atomic operations**: All file operations are atomic - either fully succeed or fail cleanly
- **Comprehensive testing**: 100+ tests covering all commands and edge cases
- **TypeScript**: Full type safety throughout codebase
