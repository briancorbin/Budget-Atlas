import { describe, expect, it } from 'vitest';
import {
  bracketBreakdown,
  calcChildTaxCredit,
  calcEITC,
  calcFICA,
  progressiveTax,
} from '@/lib/tax';
import { FEDERAL_BRACKETS_2026, SS_WAGE_BASE } from '@/data/federalTax';
import type { TaxBracket } from '@/types';

const SAMPLE_BRACKETS: readonly TaxBracket[] = [
  [10_000, 0.1],
  [50_000, 0.2],
  [Infinity, 0.3],
];

describe('progressiveTax', () => {
  it('returns 0 for non-positive income', () => {
    expect(progressiveTax(0, SAMPLE_BRACKETS)).toBe(0);
    expect(progressiveTax(-5000, SAMPLE_BRACKETS)).toBe(0);
  });

  it('only taxes dollars within each bracket at that bracket rate', () => {
    expect(progressiveTax(5_000, SAMPLE_BRACKETS)).toBeCloseTo(500);
    expect(progressiveTax(10_000, SAMPLE_BRACKETS)).toBeCloseTo(1_000);
    expect(progressiveTax(30_000, SAMPLE_BRACKETS)).toBeCloseTo(1_000 + 20_000 * 0.2);
    expect(progressiveTax(50_000, SAMPLE_BRACKETS)).toBeCloseTo(1_000 + 40_000 * 0.2);
    expect(progressiveTax(100_000, SAMPLE_BRACKETS)).toBeCloseTo(1_000 + 8_000 + 50_000 * 0.3);
  });

  it('matches a hand-computed value against real 2026 single brackets', () => {
    // $80k taxable, single, 2026:
    //   12,400 × 10%        =  1,240
    //   (50,400 − 12,400) × 12% = 4,560
    //   (80,000 − 50,400) × 22% = 6,512
    //   total = 12,312
    expect(progressiveTax(80_000, FEDERAL_BRACKETS_2026.single)).toBeCloseTo(12_312);
  });
});

describe('bracketBreakdown', () => {
  it('sum of taxFromRow equals progressiveTax', () => {
    const taxable = 75_000;
    const rows = bracketBreakdown(taxable, FEDERAL_BRACKETS_2026.married);
    const summed = rows.reduce((acc, r) => acc + r.taxFromRow, 0);
    expect(summed).toBeCloseTo(progressiveTax(taxable, FEDERAL_BRACKETS_2026.married));
  });

  it('marks exactly one bracket as the user bracket when income lands inside one', () => {
    const rows = bracketBreakdown(75_000, FEDERAL_BRACKETS_2026.married);
    const flagged = rows.filter((r) => r.isUserBracket);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].rate).toBe(0.12); // 75k MFJ → 12% bracket
  });

  it('produces zero-fill rows when taxable income is 0 and marks no user bracket', () => {
    const rows = bracketBreakdown(0, SAMPLE_BRACKETS);
    expect(rows).toHaveLength(SAMPLE_BRACKETS.length);
    expect(rows.every((r) => r.taxableInRow === 0)).toBe(true);
    expect(rows.some((r) => r.isUserBracket)).toBe(false);
  });
});

describe('calcFICA', () => {
  it('is zero on zero income', () => {
    expect(calcFICA(0)).toBe(0);
  });

  it('caps Social Security at the wage base, but Medicare keeps going', () => {
    // At exactly the wage base: SS = wage_base × 6.2%, Medicare = wage_base × 1.45%
    const expectedAtCap = SS_WAGE_BASE * 0.062 + SS_WAGE_BASE * 0.0145;
    expect(calcFICA(SS_WAGE_BASE)).toBeCloseTo(expectedAtCap);

    // Above the cap, SS stays flat, Medicare grows. Stay below $200K so
    // additional-Medicare doesn't muddy the assertion (covered separately).
    const above = SS_WAGE_BASE + 10_000; // 184,500 + 10,000 = 194,500 < 200K
    const expectedAbove = SS_WAGE_BASE * 0.062 + above * 0.0145;
    expect(calcFICA(above)).toBeCloseTo(expectedAbove);
  });

  it('applies additional Medicare 0.9% on income above $200K', () => {
    const income = 250_000;
    const ss = SS_WAGE_BASE * 0.062;
    const medicare = income * 0.0145;
    const addl = (income - 200_000) * 0.009;
    expect(calcFICA(income)).toBeCloseTo(ss + medicare + addl);
  });

  it('two earners pay more SS than one earner with the same combined income', () => {
    // The whole point of the per-person wage base. $200K + $200K should pay
    // strictly more than a single $400K filer.
    const split = calcFICA(200_000) + calcFICA(200_000);
    const lumped = calcFICA(400_000);
    expect(split).toBeGreaterThan(lumped);
  });
});

describe('calcChildTaxCredit', () => {
  it('returns 0 when there are no kids', () => {
    expect(calcChildTaxCredit(50_000, 0, 'single')).toBe(0);
    expect(calcChildTaxCredit(500_000, 0, 'married')).toBe(0);
  });

  it('returns full $2,000 per kid below the phase-out threshold', () => {
    expect(calcChildTaxCredit(100_000, 2, 'single')).toBe(4_000);
    expect(calcChildTaxCredit(300_000, 3, 'married')).toBe(6_000);
  });

  it('phases out by $50 per $1,000 over $200K (single) / $400K (married)', () => {
    // Single, 1 kid, $210K → over by $10K → 10 × $50 = $500 reduction
    expect(calcChildTaxCredit(210_000, 1, 'single')).toBe(2_000 - 500);
    // Married, 1 kid, $410K → over by $10K → $500 reduction
    expect(calcChildTaxCredit(410_000, 1, 'married')).toBe(2_000 - 500);
  });

  it('floors at zero when the phase-out fully exhausts the credit', () => {
    expect(calcChildTaxCredit(1_000_000, 1, 'single')).toBe(0);
  });
});

describe('calcEITC', () => {
  it('is zero above the upper income gate', () => {
    expect(calcEITC(75_000, 2, 'married')).toBe(0);
    expect(calcEITC(100_000, 0, 'single')).toBe(0);
  });

  it('is zero at zero income', () => {
    expect(calcEITC(0, 2, 'single')).toBe(0);
  });

  it('hits the plateau max at the documented amount', () => {
    // 2 kids, single: max 7,316; plateau begins at end of phase-in (18,500)
    // and runs through phase-out start (23,700). $20K is squarely on the plateau.
    expect(calcEITC(20_000, 2, 'single')).toBeCloseTo(7_316);
  });

  it('phases out linearly to zero', () => {
    // 1 kid, single, phaseOutEnd = 50,000 → just above should be zero
    expect(calcEITC(50_000, 1, 'single')).toBeCloseTo(0);
    // Halfway through the phase-out should be roughly half the max
    const max = 4_427;
    const phaseOutStart = 23_700;
    const phaseOutEnd = 50_000;
    const mid = (phaseOutStart + phaseOutEnd) / 2;
    expect(calcEITC(mid, 1, 'single')).toBeCloseTo(max / 2, 0);
  });

  it('married households get higher phase-out thresholds (marriage bonus at the bottom)', () => {
    // Same low-mid income, 2 kids: married should get >= single because
    // the phase-out doesn't kick in as early.
    expect(calcEITC(35_000, 2, 'married')).toBeGreaterThan(calcEITC(35_000, 2, 'single'));
  });
});
