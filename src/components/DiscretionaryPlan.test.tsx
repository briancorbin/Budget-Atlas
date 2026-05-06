// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { DiscretionaryPlan } from './DiscretionaryPlan';
import { getScenario, resultFromScenario } from './__fixtures__/scenarios';

describe('DiscretionaryPlan', () => {
  it('renders savings/vacation/splurge/emergency cards when sustainable (teacher_oh)', () => {
    const r = resultFromScenario(getScenario('teacher_oh'));
    const { container } = render(<DiscretionaryPlan result={r} />);
    expect(container).toMatchSnapshot();
  });

  it('renders nothing when underwater (min_nyc)', () => {
    const r = resultFromScenario(getScenario('min_nyc'));
    const { container } = render(<DiscretionaryPlan result={r} />);
    expect(container).toMatchSnapshot();
  });
});
