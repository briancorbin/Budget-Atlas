// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Notes } from './Notes';
import { STATE_DOR } from '@/data/sources';
import { getScenario } from './__fixtures__/scenarios';
import { CITIES } from '@/data/cities';

describe('Notes', () => {
  it('renders for a single filer with no state DOR (min_rural)', () => {
    const s = getScenario('min_rural');
    const { container } = render(<Notes filing={s.filing} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with the state DOR threaded in (exec_nyc)', () => {
    const s = getScenario('exec_nyc');
    const stateCode = CITIES[s.city].state;
    const { container } = render(
      <Notes filing={s.filing} stateTaxSource={STATE_DOR[stateCode]} />,
    );
    expect(container).toMatchSnapshot();
  });
});
