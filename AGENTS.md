# Web

The guest booking site: search, quote, book, pay, Mina sidor.

## Project

Next.js (app router) + React 19 + Tailwind v4 + shadcn/radix + zustand.
**bun** is the package manager. Runs on :3300.

## Tenancy

Each operator is served on its own hostname (`storsand.bokarn.se`), with
`/s/[slug]/…` as the path fallback. `src/lib/tenant/host.ts` is the **only**
source of tenant identity for guests — never a header or body value, which the
backend refuses anyway. A host with no operator subdomain resolves to `null`
and must be treated as "no site selected", never defaulted to one.

## Locales

`sv`, `en`, `de`, under `src/app/[locale]/`. Middleware redirects an
unprefixed path to the default locale so a shared link always carries the
language it was read in.

## After every change

`bun run format` → `bun run lint` → `bun run typecheck` → `bun run build`, all
clean. Never hand-edit `package.json`: use `bun add`.

## Layout

```
src/
  app/[locale]/         Next routing ONLY. Thin.
  features/<name>/{components,hooks,api.ts,store.ts,types.ts,index.ts}
  components/ui/        shadcn primitives (generated)
  lib/{api,tenant,i18n,config}.ts
```

A feature is imported **only through its `index.ts`**.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
