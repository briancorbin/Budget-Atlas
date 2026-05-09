import type { ReactNode } from 'react';

/**
 * A Marginalia post. Each post has up to three views, all stored as React
 * components so we get TS-checked content with first-class formatting:
 *
 *   - editorial: the narrative reflection. Brian's voice, copy-edited.
 *   - fieldNotes: optional consolidated AI-tooling observations from the
 *     week, grouped by theme with synthesis paragraphs allowed.
 *   - raw: the immutable transcript — Brian's original words plus any
 *     Claude prompts that preceded them, plus any verbatim journal
 *     entries from the week. Does not change after publish.
 *
 * The toggle exposes Edited (= editorial + fieldNotes) and Raw.
 */
export type Post = {
  slug: string;
  title: string;
  /** Display order — week number, "Post 0", etc. Free-form short string. */
  number: string;
  /** ISO date (YYYY-MM-DD) the post was published. */
  date: string;
  /** One-line teaser for index list and RSS feed. */
  dek: string;
  editorial: () => ReactNode;
  fieldNotes?: () => ReactNode;
  raw: () => ReactNode;
};
