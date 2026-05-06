/**
 * Test fixtures — every component snapshot is anchored to a canonical scenario
 * from `src/data/scenarios.ts` rather than ad-hoc literals. This means:
 *
 *   - All visual regressions trace back to the same archetype households the
 *     app itself exposes in the picker, so a snapshot diff is interpretable
 *     ("the SF tech-family card moved") rather than abstract ("the $230K /
 *     $150K case moved").
 *   - Editing a scenario's income or city in `scenarios.ts` cascades into
 *     every snapshot that references it, surfacing exactly which UIs depend
 *     on that fixture.
 */
import { SCENARIOS } from '@/data/scenarios';
import { computeBudget } from '@/lib/budget';
import { encodeConfig } from '@/lib/configShare';
import type { CustomizePanel } from '@/components/Inputs';
import type { BudgetInput, BudgetResult, Scenario } from '@/types';

export function getScenario(id: string): Scenario {
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) throw new Error(`No scenario with id=${id}; check src/data/scenarios.ts`);
  return s;
}

export function inputFromScenario(s: Scenario): BudgetInput {
  return {
    incomeA: s.income,
    incomeB: s.incomeB,
    hasPartner: s.filing === 'married' || (s.incomeB ?? 0) > 0,
    filing: s.filing,
    city: s.city,
    kids: s.kids,
    lifestyle: s.lifestyle,
  };
}

export function resultFromScenario(s: Scenario): BudgetResult {
  return computeBudget(inputFromScenario(s));
}

/** Build the props CustomizePanel takes — setters are noops for snapshot tests. */
export function inputsStateFromScenario(s: Scenario): Parameters<typeof CustomizePanel>[0] {
  return {
    incomeA: s.income,
    setIncomeA: () => {},
    incomeB: s.incomeB ?? 0,
    setIncomeB: () => {},
    twoIncome: (s.incomeB ?? 0) > 0,
    setTwoIncome: () => {},
    filing: s.filing,
    setFiling: () => {},
    city: s.city,
    setCity: () => {},
    kids: s.kids,
    setKids: () => {},
    lifestyle: s.lifestyle,
    setLifestyle: () => {},
  };
}

/** Build a deterministic share URL fragment from a scenario via the real encoder. */
export function shareUrlFromScenario(s: Scenario, compareCity = 'sf'): string {
  const hash = encodeConfig({
    incomeA: s.income,
    incomeB: s.incomeB ?? 0,
    twoIncome: (s.incomeB ?? 0) > 0,
    filing: s.filing,
    city: s.city,
    kids: s.kids,
    lifestyle: s.lifestyle,
    compareCity,
    claimedBenefits: new Set(),
  });
  return `https://thebudgetatlas.com/${hash}`;
}
