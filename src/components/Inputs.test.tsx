// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CustomizePanel } from './Inputs';
import { getScenario, inputsStateFromScenario } from './__fixtures__/scenarios';

describe('CustomizePanel', () => {
  it('renders single-earner inputs (min_rural)', () => {
    const { container } = render(
      <CustomizePanel {...inputsStateFromScenario(getScenario('min_rural'))} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders dual-earner married inputs (teacher_oh)', () => {
    const { container } = render(
      <CustomizePanel {...inputsStateFromScenario(getScenario('teacher_oh'))} />,
    );
    expect(container).toMatchSnapshot();
  });
});
