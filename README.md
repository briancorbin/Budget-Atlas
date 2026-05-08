# The Budget Atlas

> An interactive examination of how Americans live on what they earn — across cities, tax regimes, and household configurations.

> [!NOTE]
> The Budget Atlas is not the definitive word on taxes, benefits, or cost of living — it's a growing public-good tool that gets more accurate as more eyes check it. Some specifics will be wrong: agencies reorganize URLs, programs update rules, and approximations stay approximations. If you find a broken citation or an outdated rule, the way to make the atlas better is to open an issue or a PR. See the [public link audit](./audit/links/) for what we're currently triaging.

Built on 2026 IRS brackets, state tax data, BLS price indices, and median rents. Models federal, state, and FICA taxes (with proper progressive bracket math), childcare, housing, and discretionary income across single-earner and dual-earner households.

## Quick start

```bash
yarn install
yarn dev          # Vite dev server, usually http://localhost:5173
yarn build        # production build to dist/
yarn preview      # preview the production build
yarn typecheck
yarn test         # Vitest unit tests
yarn verify       # typecheck + lint + format check + tests (the gate before opening a PR)
```

Requires **Node 22** (pinned via `.nvmrc` and CI). The package manager is **Yarn 4** (`packageManager: yarn@4.9.1` in `package.json`), provisioned via Corepack — run `corepack enable` once and `yarn` will resolve to the pinned version. CI uses `yarn install --immutable`. Don't use `npm` (it'll create a conflicting `package-lock.json`).

## Project structure

```
src/
├── main.tsx                  React entry
├── App.tsx                   Top-level router; renders the right page per route
├── index.css                 Reset + body font
├── theme.ts                  Color tokens, fonts, chart palette
├── types.ts                  Shared TS types
│
├── data/                     Reference data — edit these to update for a new tax year
│   ├── sources.ts            Central registry of every cited Source (single source of truth)
│   ├── federalTax.ts         2026 federal brackets, std deduction, SS wage base
│   ├── states.ts             State graduated brackets, std deductions, min wage
│   ├── cities.ts             ~20 curated city profiles + 51 statewide-default fallbacks
│   ├── scenarios.ts          Pre-built archetype households
│   ├── benefits.ts           SNAP, EITC, CTC, poverty thresholds for benefit eligibility
│   ├── poverty.ts            HHS poverty guidelines (48-state + AK + HI)
│   └── roadmap.ts            Roadmap entries surfaced on /roadmap
│
├── lib/                      Pure functions — no React, easy to test
│   ├── format.ts             fmt, fmtSigned, fmtPct
│   ├── tax.ts                progressiveTax, FICA, CTC, EITC
│   ├── budget.ts             computeBudget — the main calculation
│   ├── benefits.ts           SNAP / EITC / CTC eligibility + amounts
│   ├── cliffs.ts             Income-sweep generation for the cliff-curve chart
│   ├── configShare.ts        URL-encoded shareable view config
│   ├── nav.ts                In-page section nav helpers
│   └── audit/                D1-backed audit API client + status store + status logic
│
├── pages/                    One folder per route — page-specific UI lives here
│   ├── atlas/                The main BudgetExplorer + its sections (Masthead, Inputs,
│   │                         Summary, IncomeFlow, ExpenseBreakdown, DiscretionaryPlan,
│   │                         Benefits, CityComparison, CliffCurve, BracketWalkthrough,
│   │                         PageNav, ShareLink, Notes, PitWarning)
│   ├── sources/              Public bibliography (renders the sources.ts registry)
│   ├── privacy/              /privacy transparency note
│   ├── roadmap/              /roadmap (reads roadmap.ts)
│   ├── about/                /about
│   └── design-lab/           Internal design exploration playground
│
└── components/               Cross-page UI primitives only
    ├── ui.tsx                Stat, SectionTitle, Cite, CustomTooltip, etc.
    └── audit/                StatusDot + ReportFlag (used by Sources and citation popovers)
```

The split is deliberate: data, calculation, and presentation each live separately, so updating one (e.g. swapping in 2027 tax brackets) doesn't ripple through the others. Page-specific UI lives under `src/pages/<route>/`; only put something in `src/components/` if it's actually used across multiple pages.

## How the math works

**Federal income tax**: progressive brackets per filing status. Standard deduction subtracted before brackets apply. Child Tax Credit ($2,000/child under 17, refundable up to $1,700/child) and EITC (fully refundable, approximated with phase-in/plateau/phase-out) reduce the bill — net federal tax can go negative for low-income families.

**State tax**: real graduated brackets per filing status, with state-specific standard deductions. Same `progressiveTax` machinery as federal. Flat-tax states (CO, IL, PA, etc.) use a single positive bracket; no-tax states (TX, FL, WA, etc.) use a single 0% bracket; high-tax states with detailed schedules (CA, NY, NJ, OR, HI, MN, MA's millionaire surtax, MD, CT, VT, ME, NM, RI, WI, DC) carry their full bracket structure.

**FICA**: per-person calculation. 6.2% Social Security up to the $184,500 wage base (TY2026), plus 1.45% Medicare on all wages, plus 0.9% Additional Medicare over $200K. Two earners at $200K each pay more SS than one earner at $400K — the per-person cap is preserved.

**Filing status × dual-earner combinations**:

- _Married filing jointly_: combined income, MFJ brackets, single std deduction
- _Cohabitating partners_: each files separately as a single, each gets their own std deduction and brackets
- _Single earner_: standard

## Deployment

The live site is hosted on **Cloudflare Pages** at [thebudgetatlas.com](https://thebudgetatlas.com). Pushes to `main` auto-deploy via Cloudflare's GitHub integration — framework preset "Vite", build command `npm run build`, output directory `dist`, `NODE_VERSION=20`.

The build is fully static and works on any static host. Alternatives that need zero code change (`base: './'` in `vite.config.ts` keeps asset paths relative):

- **Vercel** / **Netlify**: connect the GitHub repo, pick the Vite preset.
- **GitHub Pages**: build with `npm run build`, publish `dist/` via `actions/deploy-pages`.

## Updating for a new tax year

1. Edit `src/data/federalTax.ts` with the new brackets and standard deduction. Update `FEDERAL_TAX_SOURCE.date` to the new IRS Rev. Proc. publication date.
2. Edit `src/data/states.ts` with updated state brackets, std deductions, and minimum wages. Update the `STATE_TAX_SOURCE.date` accordingly.
3. Edit `src/data/cities.ts` if rent or other costs have shifted significantly; update entries in `CITY_COL_SOURCES` if you swap providers.
4. Update the masthead "Vol. 2026" in `src/components/Masthead.tsx`.

## Sources

This is an editorial reference tool. Every numeric value the model displays is traceable to a published source — see the inline `ⁱ` indicators in the app, the consolidated list in each page's footer, and the full bibliography at [thebudgetatlas.com/sources](https://thebudgetatlas.com/sources). The single source-of-truth for citations is [`src/data/sources.ts`](./src/data/sources.ts) (the registry); the `/sources` page renders directly from it. To avoid drift, this README doesn't enumerate URLs — read them from the registry or the `/sources` page.

The model's citations group into:

- **Federal taxes** — IRS Rev. Proc. (brackets, std deduction, OBBBA-adjusted CTC), SSA wage base
- **State taxes** — state revenue department pages (`state-dor-*` ids) cross-checked against Tax Foundation; NCSL + DOL for minimum wage
- **Cost of living, per-city** — RentCafe, Zillow, BLS CES, Care.com, KFF, Numbeo
- **Cost of living, statewide fallbacks** — HUD FMR, BLS CES regional, EIA residential energy, Child Care Aware, KFF state averages, AAA Your Driving Costs
- **Benefits** — SNAP (USDA FNS + state agencies), EITC + CTC (IRS), HHS poverty guidelines

### Auditing

A nightly link audit probes every URL in the registry, persists results to a Cloudflare D1 database, and surfaces broken / bot-blocked / drift-flagged citations on the `/sources` page. Anyone can re-run it with `yarn check-links` (results POST to `/api/audit/runs` with a write token; reads at `/api/audit/latest` and `/api/audit/history` are public). Full philosophy + status code reference in [`audit/links/README.md`](./audit/links/README.md).

### Rent calculation logic

The rent _value_ comes from the sources above, but the rule that picks **which** rent (1BR / 1BR×1.2 / 3BR) is its own piece of editorial methodology:

- Solo, no kids → 1BR rent. Grounded in HUD occupancy guidance.
- Couple, no kids → 1BR × 1.2. HUD says two people fit a 1BR; the 20% premium is editorial — Zillow rent-by-bedroom data shows 1BR→2BR runs ~25–30% in most metros, so 1.2× treats the household as "blended" between staying in a 1BR and stepping up to a small 2BR.
- Any kids → 3BR family-sized. Matches HUD FMR's family benchmark and EPI's Family Budget Calculator, both of which use 3BR for households with children regardless of count.
- Lifestyle multiplier: ×0.9 modest, ×1.0 moderate, ×1.15 comfortable. Editorial, not from a single dataset — rough match for the spread between "modest yet adequate" and "comfortable" tiers in EPI / BLS CES decile data.

Sources for the data-grounded parts: **HUD Handbook 4350.3 REV-1, Change 4 — Occupancy Requirements** ([link](https://www.hud.gov/hudclips/handbooks/housing-4350-3), 2013-11), **EPI Family Budget Calculator methodology** ([link](https://www.epi.org/resources/budget/budget-factsheets/)), **Zillow Rent by Bedroom** ([link](https://www.zillow.com/research/data/)). The editorial parts (1.2× couple premium, lifestyle multipliers) are flagged as approximations rather than fake-cited.

### A note on precision

City-level numbers are approximate medians, rounded to the nearest $50–$100 for readability. Statewide-average profiles are coarser still — they collapse intra-state variation (Manhattan vs. Buffalo, Bay Area vs. Bakersfield) into a single number. Both are appropriate for an editorial model exploring orders of magnitude — not for personal financial planning. Tax bracket numbers are rounded to clean values; they'll be off from a real return by 1–3% from index-adjustment timing.

## Caveats baked into the model

- Assumes employer-sponsored health insurance (no ACA marketplace pricing)
- Renting only (no mortgage / homeownership math)
- No student loans, no consumer debt servicing
- No 401(k) pre-tax contributions reducing taxable income
- Childcare modeled as a single rate × number of kids — doesn't differentiate infant vs. school-age
- EITC is approximated with the basic structure; real EITC has investment-income tests and more

These would all be reasonable additions. See `lib/budget.ts` for where they'd plug in.

## Funding & transparency

The Budget Atlas is a free, donation-supported public-good project. Every dollar in and out is logged in the public [funding ledger](./funding/ledger.md), starting with the first $0 free-tier hosting bill. A polished funding dashboard ([roadmap #21](https://github.com/TheBudgetAtlas/thebudgetatlas/issues)) will eventually render from the same file.

Fiscal sponsorship application is pending with Open Collective / Open Source Collective.

## Contributing

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for project conventions (the citation requirement, the data/lib/components layer split, tax-math gotchas, recipes for adding cities or tax years).

## License

MIT — see [LICENSE](./LICENSE).
