import { describe, expect, it } from 'vitest';
import { computeBudget } from '@/lib/budget';
import type { BudgetInput } from '@/types';

function input(overrides: Partial<BudgetInput> = {}): BudgetInput {
  return {
    incomeA: 75_000,
    filing: 'single',
    city: 'cmh',
    kids: 0,
    lifestyle: 'moderate',
    ...overrides,
  };
}

const sumValues = (rec: Record<string, number>) => Object.values(rec).reduce((s, n) => s + n, 0);

describe('computeBudget — invariants', () => {
  it('netIncome = grossIncome − totalTaxes', () => {
    const r = computeBudget(input({ incomeA: 100_000 }));
    expect(r.netIncome).toBeCloseTo(r.grossIncome - r.totalTaxes);
  });

  it('totalExpenses equals the sum of the line items', () => {
    const r = computeBudget(input());
    expect(r.totalExpenses).toBeCloseTo(sumValues(r.expenses));
  });

  it('discretionary = monthlyNet − totalExpenses', () => {
    const r = computeBudget(input());
    expect(r.discretionary).toBeCloseTo(r.monthlyNet - r.totalExpenses);
  });

  it('annualDiscretionary is exactly 12× discretionary', () => {
    const r = computeBudget(input());
    expect(r.annualDiscretionary).toBeCloseTo(r.discretionary * 12);
  });

  it('hasPartner is what controls household adults, not income', () => {
    const partnerNoIncome = computeBudget(input({ hasPartner: true }));
    const noPartnerNoIncome = computeBudget(input({ hasPartner: false }));
    expect(partnerNoIncome.adults).toBe(2);
    expect(noPartnerNoIncome.adults).toBe(1);
    expect(partnerNoIncome.householdSize).toBe(2);
  });

  it('a partner toggle without income still triggers the family healthcare plan', () => {
    const solo = computeBudget(input({ hasPartner: false }));
    const couple = computeBudget(input({ hasPartner: true }));
    expect(couple.expenses.Healthcare).toBeGreaterThan(solo.expenses.Healthcare);
  });
});

describe('computeBudget — tax math wiring', () => {
  it('FICA is computed per-person — two earners pay more SS than one combined', () => {
    const dual = computeBudget(
      input({ incomeA: 200_000, incomeB: 200_000, hasPartner: true, filing: 'married' }),
    );
    const solo = computeBudget(input({ incomeA: 400_000, filing: 'married' }));
    expect(dual.fica).toBeGreaterThan(solo.fica);
  });

  it('CTC populates only when there are kids', () => {
    const noKids = computeBudget(input({ kids: 0 }));
    const withKids = computeBudget(input({ kids: 2, incomeA: 80_000 }));
    expect(noKids.ctc).toBe(0);
    expect(withKids.ctc).toBeGreaterThan(0);
  });

  it('low-income family with children can show negative federal tax (refundable credits)', () => {
    const r = computeBudget(input({ incomeA: 25_000, kids: 2, filing: 'head' }));
    expect(r.federalTax).toBeLessThan(0);
  });

  it('marriage penalty: two equal high earners pay more federal tax filing jointly than as two singles', () => {
    // Above ~$770K combined the MFJ top bracket pinches harder than 2× single.
    const married = computeBudget(
      input({ incomeA: 500_000, incomeB: 500_000, filing: 'married', hasPartner: true }),
    );
    const cohabitating = computeBudget(
      input({ incomeA: 500_000, incomeB: 500_000, filing: 'single', hasPartner: true }),
    );
    expect(married.federalTax).toBeGreaterThan(cohabitating.federalTax);
  });
});

describe('computeBudget — benefits integration', () => {
  it('claiming SNAP reduces the Groceries line and records the offset', () => {
    const baseline = computeBudget(input({ incomeA: 18_000, kids: 2, filing: 'head' }));
    const withSnap = computeBudget(
      input({ incomeA: 18_000, kids: 2, filing: 'head', claimedBenefits: new Set(['snap']) }),
    );
    expect(withSnap.expenses.Groceries).toBeLessThan(baseline.expenses.Groceries);
    expect(withSnap.benefitsApplied['SNAP']).toBeGreaterThan(0);
    expect(withSnap.totalBenefits).toBeGreaterThan(0);
  });

  it('Medicaid takes priority over CHIP when both are claimed and the household qualifies', () => {
    // Low income, kids, expansion state (cmh = OH) → Medicaid covers the household.
    const r = computeBudget(
      input({
        incomeA: 18_000,
        kids: 2,
        filing: 'head',
        claimedBenefits: new Set(['medicaid', 'chip']),
      }),
    );
    expect(r.benefitsApplied['Medicaid']).toBeGreaterThan(0);
    expect(r.benefitsApplied['CHIP']).toBeUndefined();
    expect(r.expenses.Healthcare).toBe(0);
  });

  it('claiming a benefit you do not qualify for has no effect', () => {
    // High-income household claiming SNAP — must not get the benefit.
    const r = computeBudget(
      input({ incomeA: 250_000, kids: 0, claimedBenefits: new Set(['snap']) }),
    );
    expect(r.benefitsApplied['SNAP']).toBeUndefined();
    expect(r.totalBenefits).toBe(0);
  });
});
