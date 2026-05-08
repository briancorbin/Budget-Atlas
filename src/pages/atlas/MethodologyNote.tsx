import { theme as T, fonts, rem } from '@/theme';

/**
 * A short editorial framing that sits between the Masthead and the
 * Customize panel — establishes the meta before the reader starts
 * pushing knobs. Acknowledges that this is a *custom model*, that
 * different lines come from different source tiers (primary
 * government data, peer-respected references, commercial datasets,
 * and a few hand-tuned formulas), and that improving the mix is
 * ongoing work.
 *
 * Per-line source provenance lives elsewhere (the dot legend +
 * hover popovers in the Expenses detail view); this is the
 * one-screen "what kind of thing is this?" framing for the
 * casual reader who never opens the detail view.
 */
export function MethodologyNote() {
  return (
    <div
      style={{
        margin: '8px 0 24px',
        padding: '14px 18px',
        background: T.bgAlt,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.accent}`,
        fontFamily: fonts.body,
        fontSize: rem(13),
        lineHeight: 1.6,
        color: T.inkSoft,
      }}
    >
      <span
        style={{
          fontSize: rem(10),
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.accent,
          fontWeight: 700,
          marginRight: 8,
        }}
      >
        About this model
      </span>
      The numbers here are produced by a custom budget model — not lifted whole from any single
      source. Some lines come from primary government data (BLS, IRS, state agencies), some from
      peer-respected references (KFF), some from commercial datasets (RentCafe, Care.com), and a
      handful are still our current best guess. Where the math overrides BLS for a household type
      (e.g. transit-only, no-kids), we surface the override and the reason. We aim to improve the
      source mix over time — every honest gap is a future commit.
    </div>
  );
}
