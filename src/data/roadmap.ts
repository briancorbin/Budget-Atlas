/**
 * Public-facing roadmap of planned features. Mirrored from the project memory
 * file at memory/roadmap_features.md but lives in the codebase so the
 * Roadmap page can render it directly. Keep the two in sync when items
 * land or are added.
 */

export type RoadmapStatus = 'planned' | 'in-progress' | 'shipped';

export type RoadmapCategory =
  | 'Tax modeling'
  | 'Household detail'
  | 'Cost of living'
  | 'Benefits & safety net'
  | 'Geography'
  | 'Sharing';

export interface RoadmapItem {
  id: number;
  title: string;
  category: RoadmapCategory;
  status: RoadmapStatus;
  summary: string;
  /** ISO date (YYYY-MM-DD) when status flipped to 'shipped'. Set this in
   *  the same commit that flips status; leave undefined for planned items. */
  shippedAt?: string;
}

export const ROADMAP: readonly RoadmapItem[] = [
  {
    id: 1,
    title: 'Time-budget section',
    category: 'Household detail',
    status: 'planned',
    summary:
      'Input weekly working hours and surface derived metrics: time for personal childcare vs hired help, free time for own pursuits, sleep budget. Shows the time cost of work alongside the dollar take-home.',
  },
  {
    id: 2,
    title: 'Untaxed income input',
    category: 'Tax modeling',
    status: 'planned',
    summary:
      'Add an input for tips or cash income that flows into take-home and lifestyle budgeting but bypasses federal/state/FICA. Common in restaurant, gig, and cash-based trades. Notes the legal grey area of underreporting.',
  },
  {
    id: 3,
    title: 'Per-child ages',
    category: 'Household detail',
    status: 'planned',
    summary:
      'Optional expand from the 0–4 kids slider into per-child ages. Childcare cost varies massively by age (infant care often ~2× preschool), and the Child Tax Credit cuts off at 17 — both are currently averaged out.',
  },
  {
    id: 4,
    title: '401(k) / HSA / FSA pre-tax contributions',
    category: 'Tax modeling',
    status: 'planned',
    summary:
      'Pre-tax retirement and health-savings contributions reduce federal and state taxable income. Currently the model assumes none, which materially overstates tax for higher-income households who max their 401(k) — a $7K+ gap at the 32% marginal bracket.',
  },
  {
    id: 5,
    title: 'Lifestyle granularity',
    category: 'Cost of living',
    status: 'planned',
    summary:
      'Layer optional per-line inputs on top of the Modest/Moderate/Comfortable lever — gym, dining out, grocery budget, hobbies. Keep the simple lever as the default; expand for users who want to model their actual spending.',
  },
  {
    id: 6,
    title: 'Job-based location comparison',
    category: 'Geography',
    status: 'planned',
    summary:
      'Pick a job type (software engineer, bartender, nanny, etc.) and see what the same job pays across cities, with cost-of-living adjusted take-home. Answers "would I be better off moving?". Requires BLS occupational wage data by metro.',
  },
  {
    id: 7,
    title: 'Married Filing Separately',
    category: 'Tax modeling',
    status: 'planned',
    summary:
      'Today filing status is single, married (always MFJ), or head of household. MFS has its own brackets, ~half the standard deduction, and disqualifies EITC entirely. Rare to be the right choice but the teaching moment is showing why.',
  },
  {
    id: 8,
    title: 'Shareable configuration links',
    category: 'Sharing',
    status: 'planned',
    summary:
      'Encode the household state into a URL hash (#income=…) so a specific scenario can be shared. Also a copy-able short code for paste-into-chat. No backend required.',
  },
  {
    id: 9,
    title: 'SNAP refinements',
    category: 'Benefits & safety net',
    status: 'planned',
    summary:
      'Add shelter and childcare deductions to the SNAP net-income formula (real SNAP subtracts both before applying the 30% multiplier; meaningful in high-rent metros and for working parents). Plus a calculation breakdown UI and a cliff visualization for the income threshold.',
  },
  {
    id: 10,
    title: 'Medicaid / CHIP refinements',
    category: 'Benefits & safety net',
    status: 'planned',
    summary:
      'Surface alternate Medicaid tracks the model omits — SSI-linked (disabled), aged (65+), and pregnancy (often up to 200%+ FPL even in non-expansion states). Plus state waiver programs like Georgia\'s Pathways to Coverage, and a visualization of the Medicaid cliff at 138% FPL.',
  },
  {
    id: 11,
    title: 'Open-ended location selection',
    category: 'Geography',
    status: 'planned',
    summary:
      'Replace the fixed list of ~20 cities with state + city selection, where the city can be any locality. Use curated city profiles when available; fall back to state defaults otherwise. Custom overrides for users who know their actual local rent, utilities, etc. Round-trips via the shareable link feature.',
  },
  {
    id: 12,
    title: 'Student loan payments',
    category: 'Cost of living',
    status: 'planned',
    summary:
      'Add an input for monthly student loan payment, with optional balance + rate + standard 10-year payment estimate. Model income-driven repayment (IDR / SAVE / PAYE) where payments scale with discretionary income above a poverty multiple. Pick up the $2,500/yr student loan interest deduction (above-the-line, phased out at ~$80K single / $165K joint).',
  },
  {
    id: 13,
    title: 'Homeownership / mortgage',
    category: 'Cost of living',
    status: 'planned',
    summary:
      'Today everyone rents. Add an "I own" toggle that swaps rent for full PITI (principal, interest, property tax, insurance) plus HOA and a 1%/yr maintenance reserve. State-specific effective property tax rates (TX ~1.6%, NJ ~2.2%, HI ~0.3%). Shows that owning often looks cheaper monthly until you net out maintenance and opportunity cost of the down payment.',
  },
];

/**
 * Things already shipped that the roadmap previously listed. Useful context
 * on the roadmap page so users can see momentum, not just a backlog.
 */
export interface ShippedItem {
  title: string;
  summary: string;
  shippedAt: string;
}

export const SHIPPED: readonly ShippedItem[] = [
  {
    title: 'Graduated state tax brackets',
    shippedAt: '2026-05-01',
    summary:
      'All 51 jurisdictions now use the same progressive-bracket machinery as federal. State-specific standard deductions and per-filing-status brackets where applicable. Replaces the previous flat-effective-rate approximation.',
  },
  {
    title: 'Bracket walkthrough',
    shippedAt: '2026-05-01',
    summary:
      'Click "View bracket walkthrough" under the paycheck chart to see federal and state taxes calculated row by row, with the marginal bracket highlighted and refundable credits reconciled.',
  },
  {
    title: 'Per-state source citations',
    shippedAt: '2026-05-01',
    summary:
      'Every state attaches its own Department of Revenue / Taxation, SNAP agency, Medicaid agency, and CHIP program citation. The page footer rotates the current state\'s sources alongside the cross-state aggregators.',
  },
  {
    title: 'Benefits & safety net',
    shippedAt: '2026-05-01',
    summary:
      'SNAP, Medicaid, and CHIP eligibility — with state-specific BBCE thresholds, Medicaid expansion vs. coverage-gap branching, and CHIP\'s state-set income limits. Claimed benefits adjust the budget.',
  },
];
