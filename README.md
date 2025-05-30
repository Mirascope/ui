# Mirascope UI

This repo contains the shared components and style system for building UIs aligned with the general Mirascope brand.

It is still in relatively early stages and some parts (e.g. theme support) are not yet fully fleshed out or integrated
from consumers like mirascope/lilypad and mirascope/website.

This repo is intended to be the source of truth for all the components—i.e. if you need to make a change, please
make the change here in the registry and then import it downstream into your project. By doing things this way, we
hope to maintain a high degree of consistency between UIs across the Mirascope ecosystem.

## Using the Registry

To use components from this registry in your project:

```bash
# Install the CLI tool
bun add -D @mirascope/ui

# Initialize your project
bunx mirascope-ui init

# Add components
bunx mirascope-ui add button dialog

# Keep components in sync
bunx mirascope-ui sync
```

The components will be installed to `./mirascope-ui` at the root of your project (alongside `package.json`).

For complete CLI documentation, see [CLI.md](./CLI.md).

## Development

This section covers developing the registry itself (adding new components, testing, etc).

### ShadCN Registry Docs

https://ui.shadcn.com/docs/registry

## How to add components

1. Create a file inside `registry`
2. Update `registry.json` and append a new [registry-item](https://ui.shadcn.com/docs/registry/registry-item-json)
3. Build registry

```bash
bun build
```

## Typechecking

`bun run typecheck`

## Testing

`bun test`

## How to pull components

Use the `mirascope-ui` CLI command (see above). Note it has `--local` and `--target` options which facilitate testing
locally current versions of the components in your target destination of choice.

## Storybook

Start Storybook

```bash
bun storybook
```

## License

Everything in this repository is licensed under the [MIT License](https://github.com/Mirascope/ui/blob/main/LICENSE) except for "Williams-Handwriting-Regular-v1.{x}.tff", which is a closed license font and not available for use without express permission.
