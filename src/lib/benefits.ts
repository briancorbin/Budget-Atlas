import type { StateCode } from '@/types';
import { fpl, fplPct } from '@/data/poverty';
import {
  SNAP_GROSS_INCOME_LIMIT_FPL_FEDERAL,
  SNAP_MAX_BENEFIT_2026,
  SNAP_MAX_PER_ADDITIONAL_2026,
  SNAP_STD_DEDUCTION_2026,
  snapIncomeLimitFpl,
} from '@/data/benefits';

/** All benefit programs we model. Add new IDs here as we ship them. */
export type BenefitId = 'snap';

/**
 * Dispatch eligibility for any program by id. New programs add a case here
 * once their checker exists; callers can stay generic.
 */
export function checkBenefit(id: BenefitId, inputs: BenefitInputs): BenefitEligibility {
  switch (id) {
    case 'snap': return checkSnap(inputs);
  }
}

/** Result of an eligibility check for a single program. */
export interface BenefitEligibility {
  eligible: boolean;
  /** Why not, if not eligible. Short editorial sentence. */
  reason?: string;
  /** Estimated monthly benefit when claimed (in dollars/month). */
  monthlyBenefit: number;
}

export interface BenefitInputs {
  grossIncome: number;
  householdSize: number;
  state: StateCode;
}

// ── SNAP ────────────────────────────────────────────────────────────────

/** SNAP max benefit for a household of this size (FY2026). */
function snapMaxBenefit(householdSize: number): number {
  if (householdSize <= 0) return 0;
  if (householdSize <= 8) return SNAP_MAX_BENEFIT_2026[householdSize];
  return SNAP_MAX_BENEFIT_2026[8] + (householdSize - 8) * SNAP_MAX_PER_ADDITIONAL_2026;
}

/**
 * SNAP eligibility + estimated benefit. Simplified relative to actual SNAP:
 *
 * - Gross income test: ≤ state limit. The federal floor is 130% FPL; most
 *   states have adopted BBCE to raise this to 165%, 185%, or 200% — see
 *   SNAP_BBCE_BY_STATE in data/benefits.ts.
 * - Net income approximated as: gross − 20% earned-income deduction
 *   − standard deduction. Real SNAP also subtracts excess shelter,
 *   childcare, and medical costs; we leave those for later refinement.
 * - Benefit = max(0, max_benefit − 0.30 × net_income / 12). The 30%
 *   factor is the federal "expected family contribution to food".
 */
export function checkSnap({ grossIncome, householdSize, state }: BenefitInputs): BenefitEligibility {
  if (householdSize <= 0) {
    return { eligible: false, reason: 'No household members specified.', monthlyBenefit: 0 };
  }

  const limitFpl = snapIncomeLimitFpl(state);
  const ratio = fplPct(grossIncome, householdSize);
  if (ratio > limitFpl) {
    const limitDollars = Math.round(fpl(householdSize) * limitFpl);
    const limitPct = Math.round(limitFpl * 100);
    const policyNote = limitFpl > SNAP_GROSS_INCOME_LIMIT_FPL_FEDERAL
      ? `${state} raises this to ${limitPct}% via Broad-Based Categorical Eligibility`
      : `${state} uses the 130% federal floor`;
    return {
      eligible: false,
      reason: `Income exceeds ${limitPct}% of the federal poverty level (~$${limitDollars.toLocaleString()}/yr for a household of ${householdSize}). ${policyNote}.`,
      monthlyBenefit: 0,
    };
  }

  const monthlyGross = grossIncome / 12;
  const earnedDeduction = monthlyGross * 0.20;
  const netMonthly = Math.max(0, monthlyGross - earnedDeduction - SNAP_STD_DEDUCTION_2026);
  const max = snapMaxBenefit(householdSize);
  const benefit = Math.max(0, Math.round(max - 0.30 * netMonthly));

  return { eligible: true, monthlyBenefit: benefit };
}
