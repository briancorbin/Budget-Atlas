// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ShareLink } from './ShareLink';
import { getScenario, shareUrlFromScenario } from './__fixtures__/scenarios';

describe('ShareLink', () => {
  it('renders the share URL input (teacher_oh)', () => {
    const url = shareUrlFromScenario(getScenario('teacher_oh'));
    const { container } = render(<ShareLink shareUrl={url} />);
    expect(container).toMatchSnapshot();
  });
});
