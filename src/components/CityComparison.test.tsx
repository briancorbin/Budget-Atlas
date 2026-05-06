// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CityComparison } from './CityComparison';
import { getScenario, resultFromScenario } from './__fixtures__/scenarios';

describe('CityComparison', () => {
  it('renders side-by-side (teacher_oh: Columbus vs SF)', () => {
    const s = getScenario('teacher_oh');
    const r = resultFromScenario(s);
    const { container } = render(
      <CityComparison
        result={r}
        compareCity="sf"
        setCompareCity={() => {}}
        incomeA={s.income}
        incomeB={s.incomeB ?? 0}
        hasPartner={s.filing === 'married' || (s.incomeB ?? 0) > 0}
        filing={s.filing}
        kids={s.kids}
        lifestyle={s.lifestyle}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
