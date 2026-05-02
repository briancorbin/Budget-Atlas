import type { Source, StateCode } from '@/types';

/**
 * Benefit-program data. Each program here will eventually have:
 *   - a max benefit / formula reference
 *   - an authoritative source link
 *   - any program-specific lookup tables (e.g. state Medicaid expansion)
 *
 * Adding a new program: add data + source here, then implement eligibility
 * and benefit-amount math in `lib/benefits.ts`, then surface in the
 * Benefits panel.
 */

// ── SNAP ────────────────────────────────────────────────────────────────

/**
 * SNAP maximum monthly benefit by household size, FY2026 (Oct 2025 – Sep 2026).
 * Set annually by USDA based on the Thrifty Food Plan.
 */
export const SNAP_MAX_BENEFIT_2026: Readonly<Record<number, number>> = {
  1: 298,
  2: 546,
  3: 785,
  4: 994,
  5: 1183,
  6: 1421,
  7: 1571,
  8: 1789,
};

/** Each additional household member beyond 8. */
export const SNAP_MAX_PER_ADDITIONAL_2026 = 224;

/**
 * SNAP gross income limit, expressed as a multiple of FPL. The federal
 * statutory floor is 130%. Most states have adopted Broad-Based
 * Categorical Eligibility (BBCE) which raises the threshold (typically
 * to 165%, 185%, or 200% of FPL). The map below records each state's
 * effective gross-income limit; states not listed default to the 130%
 * federal floor.
 *
 * Values are pulled from CBPP's BBCE tracking and USDA state policy
 * tables, current as of 2024–2025. Thresholds change occasionally as
 * states adopt or repeal BBCE — verify before relying on this for any
 * non-editorial purpose.
 */
export const SNAP_GROSS_INCOME_LIMIT_FPL_FEDERAL = 1.30;

export const SNAP_BBCE_BY_STATE: Partial<Record<StateCode, number>> = {
  // 200% FPL — most common BBCE expansion
  AK: 2.00, CA: 2.00, CO: 2.00, CT: 2.00, DC: 2.00, DE: 2.00,
  GA: 2.00, HI: 2.00, IA: 2.00, KY: 2.00, MA: 2.00, MD: 2.00,
  MI: 2.00, MT: 2.00, NV: 2.00, NJ: 2.00, NM: 2.00, NY: 2.00,
  NC: 2.00, ND: 2.00, OK: 2.00, OR: 2.00, PA: 2.00, RI: 2.00,
  VT: 2.00, VA: 2.00, WA: 2.00, WV: 2.00, WI: 2.00,
  // 185% FPL
  FL: 1.85, ME: 1.85, NH: 1.85, OH: 1.85,
  // 165% FPL
  AZ: 1.65, IL: 1.65, MN: 1.65, NE: 1.65, TX: 1.65,
  // States not listed (AL, AR, ID, IN, KS, LA, MO, MS, SC, SD, TN, UT, WY)
  // use the 130% federal floor with no BBCE expansion.
};

/** Effective SNAP gross-income limit for a given state. */
export function snapIncomeLimitFpl(state: StateCode): number {
  return SNAP_BBCE_BY_STATE[state] ?? SNAP_GROSS_INCOME_LIMIT_FPL_FEDERAL;
}

/**
 * Standard deduction in the SNAP net-income calculation, FY2026, applied
 * to households of 1–3. (Households of 4+ get slightly more; we round.)
 * The earned income deduction (20% of earned income) is also applied.
 */
export const SNAP_STD_DEDUCTION_2026 = 204;

export const SNAP_SOURCE: Source = {
  label: 'USDA SNAP Eligibility & Benefit Amounts',
  url: 'https://www.fns.usda.gov/snap/recipient/eligibility',
  date: '2026',
};

export const SNAP_BBCE_SOURCE: Source = {
  label: 'CBPP: SNAP Broad-Based Categorical Eligibility',
  url: 'https://www.cbpp.org/research/food-assistance/states-have-flexibility-to-expand-snap-categorical-eligibility',
  date: '2024',
};
