import type { ReactNode } from 'react';

/**
 * The 5 polish levels. The slider snaps to these positions.
 *
 *   raw    = Brian's prompted responses verbatim with [Claude prompted: ...]
 *            blocks preserved + journal entries verbatim
 *   light  = prompts removed; answers concatenated with typo + cap fixes
 *            only; journal entries grouped chronologically
 *   medium = lightly assembled into paragraphs; journal grouped by tag
 *   heavy  = real essay structure + paragraph reordering; journal grouped
 *            by theme with one-line throughlines
 *   full   = full editorial polish (em-dashes, parallel beats, italics,
 *            bolded claims) + full Field Notes synthesis with opening
 *            framing and "What I'm watching for" closer
 *
 * The slider is not just a polish dial — it's a transformation slider
 * showing how raw substrate becomes a published essay. The shape of the
 * content changes (not just the smoothness) as polish increases.
 */
export const POLISH_LEVELS = ['raw', 'light', 'medium', 'heavy', 'full'] as const;
export type PolishLevel = (typeof POLISH_LEVELS)[number];

export const POLISH_LEVEL_LABELS: Record<PolishLevel, string> = {
  raw: 'Raw',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
  full: 'Full',
};

export const POLISH_LEVEL_DESCRIPTIONS: Record<PolishLevel, string> = {
  raw: 'Verbatim — what I typed, with the Claude prompts that elicited it.',
  light: 'Typo and capitalization fixes only. Prompts removed.',
  medium: 'Assembled into paragraphs. No rewording.',
  heavy: 'Essay structure, reordering, transitions.',
  full: 'Full editorial polish — em-dashes, parallel beats, the works.',
};

/**
 * One Marginalia post. Each polish level renders the entire post body
 * (editorial narrative + field notes if any). The slider swaps the whole
 * render — readers can see exactly what each level of AI editing produces.
 */
export type Post = {
  slug: string;
  /** Display order — week number, "Post 0", etc. Free-form short string. */
  number: string;
  title: string;
  /** ISO date (YYYY-MM-DD) the post was published. */
  date: string;
  /** Optional ISO date the post's coverage window starts on. */
  coversFrom?: string;
  /** Optional ISO date the post's coverage window ends on. */
  coversTo?: string;
  /** One-line teaser for index list and RSS feed. */
  dek: string;
  /**
   * Five level renderings. Each one is the WHOLE post body at that
   * polish level — narrative + (optional) field notes inlined.
   */
  levels: Record<PolishLevel, () => ReactNode>;
};
