# Mirascope UI

Mirascope UI Registry

## ShadCN Registry Docs

https://ui.shadcn.com/docs/registry

## How to add components

1. Create a file inside `registry`
2. Update `registry.json` and append a new [registry-item](https://ui.shadcn.com/docs/registry/registry-item-json)
3. Build registry

```bash
pnpm registry:build
```

## How to pull components

1. Start the server

   `pnpm dev`

2. Use the `shadcn` CLI add command to install a registry item, assuming the registry item is named `hello-world` :

   ```bash
   pnpm dlx shadcn@latest add http://localhost:3000/r/hello-world.json
   ```

## License

Everything in this repository is licensed under the [MIT License](https://github.com/Mirascope/ui/blob/main/LICENSE) except for "Williams-Handwriting-Regular-v1.{x}.tff", which is a closed license font and not available for use without express permission.
