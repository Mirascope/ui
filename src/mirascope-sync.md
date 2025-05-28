# build `mirascope-ui` registry sync tool

# Mirascope Registry Sync Tool Spec

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
src/
├── components/ui/          # Local components
├── mirascope-ui/          # Synced from mirascope/ui
    ├── manifest.json      # Tracking file
    ├── ui/                # Registry UI components
    ├── blocks/            # Registry blocks
    └── lib/               # Registry utilities
```

## Manifest File Format

```json
{
  "registryUrl": "https://ui.mirascope.com",
  "components": {
    "button": {
      "version": "main",
      "lastSync": "2025-01-15T10:30:00Z",
      "files": ["src/mirascope-ui/ui/button.tsx"]
    },
    "dialog": {
      "version": "main",
      "lastSync": "2025-01-15T10:30:00Z",
      "files": ["src/mirascope-ui/ui/dialog.tsx"]
    }
  },
  "lastFullSync": "2025-01-15T10:30:00Z"
}
```

## Command Interface

### `mirascope-ui init`

- Creates initial manifest.json file
- Validates project has package.json
- Sets up src/mirascope-ui/ directory structure

### `mirascope-ui sync`

- Reads manifest
- Syncs all tracked components to latest
- Updates manifest timestamps
- Reports what changed

### `mirascope-ui sync button dialogue`

- Reads manifest
- Syncs only named components to latest
- Updates manifest timestamps
- Reports what changed

### `mirascope-ui add button dialog`

- Adds new components to manifest
- Downloads component files
- Installs any npm dependencies
- Updates manifest

### `mirascope-ui remove button`

- Removes component files
- Updates manifest
- (Optional) Warns about unused dependencies

### `mirascope-ui status`

- Shows what's tracked
- Shows last sync times
- Checks for available updates (without applying)

## Sync Process

1. **Read manifest** - determine what should be synced
2. **Fetch registry** - get latest component definitions
3. **Download files** - pull latest versions of tracked components
4. **Install dependencies** - run npm/bun install for new deps
5. **Update files** - overwrite existing registry files
6. **Update manifest** - record new sync timestamps
7. **Report changes** - show what was updated

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

### Dependency Management

- Sync tool installs npm dependencies (via bun) declared in registry
- Doesn't remove dependencies (to avoid breaking local code)
- Could warn about potentially unused registry dependencies

### Error Handling

- Network failures: retry with backoff
- File permission issues: clear error messages
- Invalid manifest: Fail noisily
- Missing components in registry: skip with warning

### Registry Source Configuration

#### Default Behavior

- Fetches from `registryUrl` in manifest.json (https://ui.mirascope.com)
- Downloads component files from remote registry
- Uses production registry.json structure

#### Local Development Overrides

- `--local` flag: Fetch from local filesystem registry
- `--registry-url <url>` flag: Override registry URL (e.g., localhost:3000)
- Environment variable: `MIRASCOPE_REGISTRY_URL`
- Useful for testing registry changes before deployment

#### Registry Structure

- Remote: Fetches from `/registry.json` endpoint
- Local: Reads from `./registry.json` in registry project
- Component files: Downloaded from `/registry/ui/`, `/registry/blocks/`, etc.

## Implementation Status

### ✅ Completed

- CLI scaffolding with command parsing
- `init` command - creates manifest.json and directory structure
- `status` command - shows tracked components and sync status
- Package.json validation and project root detection
- Comprehensive test suite (53 tests) with unit and integration coverage
- ManifestManager for reading/writing manifest files

### 🚧 In Progress

- `add` command - fetch and download components from registry

### 📋 Planned

- `sync` command - update existing tracked components
- `remove` command - remove components and clean up files
- Registry fetching from remote URLs
- Dependency installation via bun
- Error handling and retry logic

## Testing Strategy

### Local Development Testing

- **test-project/**: Git-ignored directory for manual CLI testing
- **Local registry**: Use `--local` flag to test against local registry.json
- **Dev server**: Test against `bun dev` registry endpoint with `--registry-url http://localhost:3000`

### Unit & Integration Tests

- **ManifestManager**: File operations, validation, component tracking
- **CLI Commands**: Argument parsing, error handling, output formatting
- **Registry Fetching**: Mock HTTP responses, component parsing
- **File Operations**: Component download, directory creation, dependency installation

### Test Fixtures

- Sample registry.json responses
- Mock component files for different types (ui, blocks, lib)
- Various manifest states for testing sync scenarios

### CI/CD Testing

- Test against deployed registry (staging environment)
- Validate CLI works in fresh projects
- Test dependency installation in clean environments

## Potential Future Enhancements

- **Version pinning**: Pin components to specific commits/tags instead of "main"
- **Conflict detection**: Warn if local modifications detected in registry files
