// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { StatRow, StatusBanner } from './Summary';
import { getScenario, resultFromScenario } from './__fixtures__/scenarios';

describe('Summary — rendered output', () => {
  it('StatRow — sustainable (teacher_oh)', () => {
    const r = resultFromScenario(getScenario('teacher_oh'));
    const { container } = render(<StatRow result={r} />);
    expect(container).toMatchSnapshot();
  });

  it('StatusBanner — sustainable (teacher_oh)', () => {
    const r = resultFromScenario(getScenario('teacher_oh'));
    const { container } = render(<StatusBanner result={r} />);
    expect(container).toMatchSnapshot();
  });

  it('StatusBanner — underwater (min_nyc)', () => {
    const r = resultFromScenario(getScenario('min_nyc'));
    const { container } = render(<StatusBanner result={r} />);
    expect(container).toMatchSnapshot();
  });
});
