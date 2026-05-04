import type { Source } from '@/types';
import { SOURCES } from './sources';

/**
 * 2026 HHS Poverty Guidelines (48 contiguous states + DC). Published in the
 * Federal Register in late January 2026. AK and HI use separate higher
 * schedules — not modeled here.
 *
 * The federal government uses these as the basis for most safety-net
 * eligibility (SNAP, Medicaid, CHIP, ACA premium credits, etc.). Each
 * program is then expressed as a multiple of these — e.g. SNAP is 130%
 * of the figure here, Medicaid expansion is 138%.
 */

/** Annual gross income at 100% of FPL by household size (2026). */
const FPL_2026: Readonly<Record<number, number>> = {
  1: 15960,
  2: 21640,
  3: 27320,
  4: 33000,
  5: 38680,
  6: 44360,
  7: 50040,
  8: 55720,
};

/** Each additional person beyond 8 (2026). */
const FPL_PER_ADDITIONAL_2026 = 5680;

/** 100% of FPL for the given household size (annual gross income). */
export function fpl(householdSize: number): number {
  if (householdSize <= 0) return FPL_2026[1];
  if (householdSize <= 8) return FPL_2026[householdSize];
  return FPL_2026[8] + (householdSize - 8) * FPL_PER_ADDITIONAL_2026;
}

/** Multiple of FPL — e.g. fplPct(income, hh) === 1.30 means 130% of FPL. */
export function fplPct(grossIncome: number, householdSize: number): number {
  const base = fpl(householdSize);
  if (base <= 0) return 0;
  return grossIncome / base;
}

export const POVERTY_SOURCE: Source = SOURCES['hhs-poverty-guidelines'];
