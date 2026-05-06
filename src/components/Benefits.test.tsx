// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Benefits } from './Benefits';
import { computeBudget } from '@/lib/budget';
import {
  getScenario,
  inputFromScenario,
  resultFromScenario,
} from './__fixtures__/scenarios';

describe('Benefits', () => {
  it('renders eligibility for low-income HoH with kids (admin_cmh_bbce)', () => {
    const r = resultFromScenario(getScenario('admin_cmh_bbce'));
    const { container } = render(
      <Benefits result={r} claimed={new Set()} toggle={() => {}} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with SNAP claimed (admin_cmh_bbce)', () => {
    const s = getScenario('admin_cmh_bbce');
    const r = computeBudget({ ...inputFromScenario(s), claimedBenefits: new Set(['snap']) });
    const { container } = render(
      <Benefits result={r} claimed={new Set(['snap'])} toggle={() => {}} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders no eligibility for high-income household (exec_nyc)', () => {
    const r = resultFromScenario(getScenario('exec_nyc'));
    const { container } = render(
      <Benefits result={r} claimed={new Set()} toggle={() => {}} />,
    );
    expect(container).toMatchSnapshot();
  });
});
