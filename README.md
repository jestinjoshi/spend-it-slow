# Spend It Slow

> See any price as the hours of your life it really costs.

A free, open-source, privacy-first calculator that converts prices into the
amount of work time you'd need to afford them, accounting for your real
**after-tax** income. No accounts, no tracking, works offline.

Inspired by the film *In Time*, where everything is paid for with time.

## Why

Apps that do this already exist, but they're either paywalled, unmaintained,
inaccurate, or closed-source. Spend It Slow aims to be the one that's free,
correct, and maintained forever.

## Project layout

This is a pnpm + Turborepo monorepo.

| Package | What it is |
| --- | --- |
| `packages/core` | Framework-agnostic engine: pay-period normalization, currency conversion, the modular **tax module**, multi-income **blending**, and the headline `priceToHours` calculation. Fully unit-tested. No UI. |
| `apps/web` | The webapp: a Next.js PWA (installable, offline-capable) hosted on Vercel. |
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

After-tax calculations are **estimates** and may be inaccurate. Not financial
or tax advice. Today only **Ontario, Canada** is implemented, as a reference.
Tax rules are modular: each region is a self-contained plugin. To add yours,
see [docs/adding-a-region.md](docs/adding-a-region.md).

## Multiple income sources

You can add as many income sources as you like, each with its own currency, pay
period, and schedule. They're blended into a single take-home hourly rate.

Tax follows a single **tax residency**, the way it actually works for a tax
resident. All your gross income, wherever it's earned, is converted to your
residency's currency, summed, and taxed **once** with stacked brackets (so two
incomes share one set of brackets and one basic personal amount, rather than
each getting their own). Any income you mark as *already take-home* is added on
top, untaxed.

Caveat: foreign income is estimated at your residency's rates. This ignores
foreign tax credits and higher source-country taxes, so for income earned abroad
the real tax may be **higher**, so treat it as a floor. Modelling that fully would
require tax engines for each country.

## License

[MIT](LICENSE)
