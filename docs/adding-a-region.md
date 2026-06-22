# Adding a tax region

After-tax support is modular: every region is a small, self-contained plugin
that implements one interface. Adding your country/state/province does **not**
require touching the UI or the calculation engine.

## Steps

1. **Copy the template.**
   Copy [`packages/core/src/tax/regions/_template.ts`](../packages/core/src/tax/regions/_template.ts)
   to `packages/core/src/tax/regions/<country>-<region>.ts`
   (e.g. `us-ca.ts`, `uk.ts`, `au.ts`).

2. **Fill in the metadata.**

   | Field | Meaning |
   | --- | --- |
   | `id` | `country-region`, lowercase (e.g. `"us-ca"`). Must be unique. |
   | `label` | Human name shown in the UI (e.g. `"California, USA"`). |
   | `currency` | ISO 4217 code these rules assume (e.g. `"USD"`). |
   | `taxYear` | The tax year the numbers come from. |
   | `validUntil` | ISO date after which the rules should be reviewed. Drives the "valid through" badge and the staleness warning in the UI. |
   | `source` | Official URL you took the numbers from, so they stay auditable. |

3. **Implement `computeNetAnnual(grossAnnual)`.**
   Keep it **pure**: gross income in, a `TaxResult` out. No dates, no network,
   no `localStorage`. Use the helpers in
   [`engine.ts`](../packages/core/src/tax/engine.ts):

   - `progressiveTax(income, brackets)`: marginal bracket math.
   - `nonRefundableCredit(tax, amount, rate)`: basic personal amounts.
   - `cappedContribution(income, rate, floor, ceiling)`: payroll levies
     (CPP/EI, Social Security, NI, etc.).

   Return a `breakdown` object so the UI can show where the money goes
   (e.g. `{ federal, state, socialSecurity }`).

4. **Register it.**
   Import your region in
   [`registry.ts`](../packages/core/src/tax/regions/../registry.ts) and add it
   to the `REGIONS` array. That's the only wiring needed.

5. **Add tests (required).**
   Copy `ca-on.test.ts` next to your file. CI will not accept a region without
   tests. At minimum assert the invariants (net < gross, zero income → zero
   tax, progressivity). If you can cite official "for income X, tax is Y"
   figures, add them as exact fixtures. Those are the most valuable tests.

## Guidelines

- **Cite your sources.** Every constant should be traceable to the `source` URL.
- **Don't over-model.** A close, well-sourced estimate beats a perfect one
  that nobody can maintain. Note simplifications in a comment (see `ca-on.ts`,
  which omits CPP2 and the federal BPA phase-out).
- **Numbers change yearly.** Updating brackets each tax year and bumping
  `validUntil` is a great recurring contribution.
