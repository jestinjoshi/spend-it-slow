# Spend It Slow

> See any price as the hours of your life it really costs.

A free, open-source, privacy-first calculator that converts prices into the
amount of work time you'd need to afford them — accounting for your real
**after-tax** income. No accounts, no tracking, works offline.

Inspired by the film *In Time*, where everything is paid for with time.

## Why

Apps that do this already exist, but they're either paywalled, unmaintained,
inaccurate, or closed-source. Spend It Slow aims to be the one that's free,
correct, and maintained — forever.

## Project layout

This is a pnpm + Turborepo monorepo.

| Package | What it is |
| --- | --- |
| `packages/core` | Framework-agnostic engine — pay-period normalization, currency conversion, the modular **tax module**, and the headline `priceToHours` calculation. Fully unit-tested. No UI. |
| `apps/web` | The webapp — a Next.js PWA (installable, offline-capable) hosted on Vercel. |
| `apps/extension` | Browser extension (Chrome/Firefox via WXT) that overlays work-time on prices. *(stub)* |

The two apps are thin skins over `packages/core`; all the math lives in one
place so the webapp and extension can never drift apart.

## Develop

```bash
pnpm install
pnpm test        # run all tests
pnpm dev         # run apps in dev
pnpm lint        # biome
```

## Tax support

After-tax calculations are **estimates** and may be inaccurate — not financial
or tax advice. Today only **Ontario, Canada** is implemented, as a reference.
Tax rules are modular: each region is a self-contained plugin. To add yours,
see [docs/adding-a-region.md](docs/adding-a-region.md).

## License

[MIT](LICENSE)
