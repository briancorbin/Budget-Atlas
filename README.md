# The Budget Atlas

> An interactive examination of how Americans live on what they earn — across cities, tax regimes, and household configurations.

Built on 2026 IRS brackets, state tax data, BLS price indices, and median rents. Models federal, state, and FICA taxes (with proper progressive bracket math), childcare, housing, and discretionary income across single-earner and dual-earner households.

## Quick start

```bash
npm install
npm run dev      # vite dev server, usually http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run typecheck
```

Requires Node 20+.

## Project structure

```
src/
├── main.tsx                  React entry
├── App.tsx                   Renders BudgetExplorer
├── index.css                 Reset + body font
├── theme.ts                  Color tokens, fonts, chart palette
├── types.ts                  Shared TS types
│
├── data/                     Reference data — edit these to update for a new tax year
│   ├── federalTax.ts         2026 federal brackets, std deduction, SS wage base
│   ├── states.ts             State income tax rate + minimum wage
│   ├── cities.ts             20 city cost profiles (rent, groceries, childcare, etc.)
│   └── scenarios.ts          Pre-built archetype households
│
├── lib/                      Pure functions — no React, easy to test
│   ├── format.ts             fmt, fmtSigned, fmtPct
│   ├── tax.ts                progressiveTax, FICA, CTC, EITC
│   └── budget.ts             computeBudget — the main calculation
│
└── components/               Each major UI section in its own file
    ├── BudgetExplorer.tsx    Top-level: holds state, renders sections
    ├── Masthead.tsx          Title block
    ├── Inputs.tsx            ScenarioPicker + CustomizePanel
    ├── Summary.tsx           StatRow + StatusBanner
    ├── IncomeFlow.tsx        Waterfall chart: paycheck → take-home
    ├── ExpenseBreakdown.tsx  Pie + itemized list
    ├── DiscretionaryPlan.tsx 50/20/20/10 split of surplus
    ├── CityComparison.tsx    Side-by-side same-income comparison
    ├── Notes.tsx             Footer notes / commentary
    └── ui.tsx                Stat, SectionTitle, CustomTooltip primitives
```

The split is deliberate: data, calculation, and presentation each live separately, so updating one (e.g. swapping in 2027 tax brackets) doesn't ripple through the others.

## How the math works

**Federal income tax**: progressive brackets per filing status. Standard deduction subtracted before brackets apply. Child Tax Credit ($2,000/child under 17, refundable up to $1,700/child) and EITC (fully refundable, approximated with phase-in/plateau/phase-out) reduce the bill — net federal tax can go negative for low-income families.

**State tax**: simplified flat effective rate × federal taxable income. Real states use graduated brackets, so this approximation is off by 1–2 points at the extremes.

**FICA**: per-person calculation. 6.2% Social Security up to $181K wage base, plus 1.45% Medicare on all wages, plus 0.9% Additional Medicare over $200K. Two earners at $200K each pay more SS than one earner at $400K — the per-person cap is preserved.

**Filing status × dual-earner combinations**:
- *Married filing jointly*: combined income, MFJ brackets, single std deduction
- *Cohabitating partners*: each files separately as a single, each gets their own std deduction and brackets
- *Single earner*: standard

## Deployment

Static build — works on any static host:

- **Vercel** / **Netlify** / **Cloudflare Pages**: connect the GitHub repo, framework preset "Vite". Done.
- **GitHub Pages**: build with `npm run build`, push `dist/` to `gh-pages` branch. The `base: './'` in vite.config.ts already handles relative paths.

## Updating for a new tax year

1. Edit `src/data/federalTax.ts` with the new brackets and standard deduction.
2. Edit `src/data/states.ts` with updated state rates and minimum wages.
3. Edit `src/data/cities.ts` if rent or other costs have shifted significantly.
4. Update the masthead "Vol. 2026" in `src/components/Masthead.tsx`.
5. Update the data citation footer in `src/components/Notes.tsx`.

## Caveats baked into the model

- Assumes employer-sponsored health insurance (no ACA marketplace pricing)
- Renting only (no mortgage / homeownership math)
- No student loans, no consumer debt servicing
- No 401(k) pre-tax contributions reducing taxable income
- Childcare modeled as a single rate × number of kids — doesn't differentiate infant vs. school-age
- EITC is approximated with the basic structure; real EITC has investment-income tests and more

These would all be reasonable additions. See `lib/budget.ts` for where they'd plug in.

## License

MIT
