import type { BudgetInput } from '@/types';
import { computeBudget } from '@/lib/budget';
import { BENEFIT_IDS, checkBenefit, type BenefitId } from '@/lib/benefits';

/**
 * "Pit" detection: at the current scenario, is there an income *below* the
 * current one where the household would end up with *more* annual
 * discretionary income? That happens when raising income across a benefit
 * eligibility cutoff costs more in lost benefits than it gained in
 * paycheck — the cliff trap.
 *
 * The sweep auto-claims every benefit at every income point so we measure
 * the genuinely optimal outcome at each income level (not whatever the user
 * happens to have toggled). If the user is currently below all cliffs and
 * already claiming everything available, no pit can exist by definition.
 *
 * Returns null when there is no pit; otherwise returns the optimal lower
 * income, the discretionary delta it would create, and the list of benefit
 * programs the optimal income qualifies for that the current income does
 * not.
 */
export interface IncomePit {
  /** Annual gross income at which discretionary peaks below current. */
  optimalGross: number;
  /** Annual discretionary at the optimal lower income. */
  optimalDiscretionary: number;
  /** Annual discretionary at the current income. */
  currentDiscretionary: number;
  /**
   * The annual delta — how much more (in $/yr) the household would have
   * at the optimal lower income vs. now. Always positive.
   */
  delta: number;
  /**
   * Programs the optimal income qualifies for that current income does
   * not. These are the programs whose loss creates the pit.
   */
  programsGained: BenefitId[];
}

export function findIncomePit(
  input: Omit<BudgetInput, 'claimedBenefits'> & { stepSize?: number },
): IncomePit | null {
  const stepSize = input.stepSize ?? 500;
  const allBenefits = new Set<string>(BENEFIT_IDS);
  const totalIncome = input.incomeA + (input.incomeB ?? 0);
  if (totalIncome <= 0) return null;

  // Compute current discretionary with everything claimed.
  const current = computeBudget({ ...input, claimedBenefits: allBenefits });
  const currentDisc = current.annualDiscretionary;

  // Sweep $0 → currentGross at stepSize granularity, varying incomeA.
  // Holding incomeB fixed mirrors how CliffCurve presents the sweep.
  let bestGross = totalIncome;
  let bestDisc = currentDisc;
  for (let g = 0; g < totalIncome; g += stepSize) {
    const sweepIncomeA = Math.max(0, g - (input.incomeB ?? 0));
    const r = computeBudget({
      ...input,
      incomeA: sweepIncomeA,
      claimedBenefits: allBenefits,
    });
    if (r.annualDiscretionary > bestDisc) {
      bestDisc = r.annualDiscretionary;
      bestGross = g;
    }
  }

  if (bestGross >= totalIncome || bestDisc <= currentDisc) return null;

  // Identify which programs the optimal income qualifies for that the
  // current does not. Re-check eligibility at both points using the
  // benefits API directly (cheaper than parsing computeBudget output).
  const baseInputs = {
    householdSize: current.householdSize,
    state: current.cityData.state,
    adults: current.adults,
    kids: current.householdSize - current.adults,
    monthlyHealthcareCost:
      current.expenses.Healthcare +
      (current.benefitsApplied['Medicaid'] ?? 0) +
      (current.benefitsApplied['CHIP'] ?? 0),
    monthlyHealthcareSingle: current.cityData.healthSingle,
  };
  const programsGained: BenefitId[] = [];
  for (const id of BENEFIT_IDS) {
    const atOptimal = checkBenefit(id, { ...baseInputs, grossIncome: bestGross });
    const atCurrent = checkBenefit(id, { ...baseInputs, grossIncome: totalIncome });
    if (atOptimal.eligible && !atCurrent.eligible) {
      programsGained.push(id);
    }
  }

  return {
    optimalGross: bestGross,
    optimalDiscretionary: bestDisc,
    currentDiscretionary: currentDisc,
    delta: bestDisc - currentDisc,
    programsGained,
  };
}
