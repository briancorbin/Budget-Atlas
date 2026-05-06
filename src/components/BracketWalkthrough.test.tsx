// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { BracketWalkthrough } from './BracketWalkthrough';
import { getScenario, resultFromScenario } from './__fixtures__/scenarios';
import type { Scenario } from '@/types';

function propsFor(s: Scenario) {
  return {
    result: resultFromScenario(s),
    incomeA: s.income,
    incomeB: s.incomeB ?? 0,
    hasPartner: s.filing === 'married' || (s.incomeB ?? 0) > 0,
    filing: s.filing,
  };
}

// Walkthrough is collapsed by default; expanding it via the toggle is the
// only way to render the bracket-by-bracket breakdown that's worth pinning.
function renderExpanded(s: Scenario) {
  const utils = render(<BracketWalkthrough {...propsFor(s)} />);
  fireEvent.click(utils.getAllByRole('button')[0]);
  return utils;
}

describe('BracketWalkthrough', () => {
  it('collapsed: just the toggle button (teacher_oh)', () => {
    const { container } = render(<BracketWalkthrough {...propsFor(getScenario('teacher_oh'))} />);
    expect(container).toMatchSnapshot();
  });

  it('expanded: dual-earner married (teacher_oh)', () => {
    const { container } = renderExpanded(getScenario('teacher_oh'));
    expect(container).toMatchSnapshot();
  });

  it('expanded: high-income married (tech_sf_family)', () => {
    const { container } = renderExpanded(getScenario('tech_sf_family'));
    expect(container).toMatchSnapshot();
  });
});
