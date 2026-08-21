# bokarn — guest site

The guest-facing booking site. Served per operator on that operator's own
hostname, in Swedish, English and German.

Part of [bokarn](https://github.com/Mats-Hjalmar/bokarn); run the whole stack
from there with `make dev` rather than starting this on its own.

## How the operator is resolved

The hostname decides which campsite a visitor is looking at —
`storsand.bokarn.localhost` in development. `src/lib/tenant/host.ts` is the only
place that mapping happens: a header or a query parameter would be
attacker-controlled, and the API refuses those anyway.

A hostname with no operator label resolves to nothing rather than defaulting to
one, so a misconfiguration reads as "no site selected" instead of quietly
serving someone else's inventory.

## Development

```sh
bun install
bun run dev        # http://storsand.bokarn.localhost/sv
```

Needs the API at `http://api.bokarn.localhost`. Locales are `sv`, `en` and
`de`; an unprefixed path redirects to the default so a shared link always
carries the language it was read in.

After every change: `bun run format` → `bun run lint` → `bun run typecheck` →
`bun run build`, all clean.
