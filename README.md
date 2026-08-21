# bokarn — guest site

The guest-facing booking site. Served per operator on that operator's own
hostname, in Swedish, English and German.

Part of [bokarn](https://github.com/Mats-Hjalmar/bokarn); run the whole stack
from there with `make dev` rather than starting this on its own.

## What is here

| Route                                  |                                                         |
| -------------------------------------- | ------------------------------------------------------- |
| `/[locale]`                            | Date and party search, with a priced offer per category |
| `/[locale]/boka/[category]`            | The breakdown, per-line VAT, and checkout               |
| `/[locale]/bekraftelse/[reference]`    | Confirmation, read back from the API                    |
| `/[locale]/bokning/[reference]?token=` | The booking, from the emailed link                      |
| `/[locale]/registrera`                 | An account, offered after booking and never before      |

Booking needs no account and takes no payment: the stay is settled at the
campsite. A pitch is held while the form is filled in, and the hold is given
back if the guest walks away.

The pitch number is not shown until the guest has arrived on it. Assignment is
provisional right up to check-in and staff move people freely, so a number in a
confirmation would be a promise the system has not made.

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

Needs the API. Each operator is reached on its own API hostname, built from
`BOKARN_API_URL_TEMPLATE` — the slug that came out of the browser's hostname
goes back into the one the server calls, because the API resolves the operator
from the hostname and refuses a header.

Locales are `sv`, `en` and `de`; an unprefixed path redirects to the default so
a shared link always carries the language it was read in.

Mutations run through Server Actions, which re-derive the operator from the
request rather than trusting an argument: an action is a POST endpoint anyone
can call directly.

After every change: `bun run format` → `bun run lint` → `bun run typecheck` →
`bun run build`, all clean.
