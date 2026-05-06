// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Masthead } from './Masthead';

describe('Masthead', () => {
  it('renders the editorial header', () => {
    const { container } = render(<Masthead />);
    expect(container).toMatchSnapshot();
  });
});
