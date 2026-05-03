/**
 * /design-lab — internal UI variations playground.
 *
 * Not linked from anywhere user-facing. Reachable only by typing the path.
 * Intent: see multiple design variations side-by-side for the same data,
 * pick what reads best, then update the production component.
 *
 * Currently scoped to surfacing review `kind` (human / ai) on /sources
 * rows, the summary block, and the citation popover. Add new sections as
 * future iteration questions come up.
 *
 * Storybook will replace this when the component vocabulary outgrows a
 * single page — for now this is the lighter-weight option.
 */

import { useState } from 'react';
import { theme as T, fonts, rem } from '@/theme';
import { Cite } from './ui';
import type { Source } from '@/types';
import type { ReviewKind } from '@/lib/sourceStatus';

export function DesignLab({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.ink,
        fontFamily: fonts.body,
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Banner onBack={onBack} />
        <SectionRowVariations />
        <SectionSummaryVariations />
        <SectionPopoverVariations />
      </div>
    </div>
  );
}

// ── Banner ───────────────────────────────────────────────────────────────
function Banner({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        background: T.accent,
        color: T.bg,
        padding: '14px 20px',
        marginBottom: 32,
        borderRadius: 4,
        fontSize: rem(13),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div>
        <strong>Design Lab</strong> — internal UI variations playground. Not linked from anywhere
        user-facing; reachable only by typing the path.
      </div>
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        style={{
          color: T.bg,
          textDecoration: 'underline',
          whiteSpace: 'nowrap',
        }}
      >
        ← Back to atlas
      </a>
    </div>
  );
}

// ── Shared synthetic data ────────────────────────────────────────────────
//
// Construct fake Source objects for each tier × kind combination so we can
// exercise the rendering paths visually. Real production data goes through
// the REVIEWS / SOURCES module-level constants — these synthetic copies
// just feed the visual primitives directly.

interface SyntheticRow {
  source: Source;
  kind: ReviewKind | 'never';
  reviewedAt: string | null;
  reviewer: string | null;
  broken?: boolean;
}

const SYNTHETIC_ROWS: readonly SyntheticRow[] = [
  {
    source: makeSrc('lab-original-human', 'IRS Rev. Proc. 2025-32', 'original'),
    kind: 'human',
    reviewedAt: '2026-05-03',
    reviewer: 'briancorbin',
  },
  {
    source: makeSrc('lab-original-ai-1', 'BLS Consumer Expenditure Survey', 'original'),
    kind: 'ai',
    reviewedAt: '2026-05-03',
    reviewer: 'briancorbin',
  },
  {
    source: makeSrc('lab-reference-ai-2', 'KFF Employer Health Benefits', 'reference'),
    kind: 'ai',
    reviewedAt: '2026-05-02',
    reviewer: 'briancorbin',
  },
  {
    source: makeSrc('lab-reference-never', 'Care.com Cost of Care Report', 'reference'),
    kind: 'never',
    reviewedAt: null,
    reviewer: null,
  },
  {
    source: makeSrc('lab-estimate-human', 'BLS CEX Regional Tables', 'estimate'),
    kind: 'human',
    reviewedAt: '2026-05-03',
    reviewer: 'briancorbin',
  },
  {
    source: makeSrc(
      'lab-reference-broken-human',
      'Child Care Aware State Fact Sheets',
      'reference',
    ),
    kind: 'human',
    reviewedAt: '2026-04-10',
    reviewer: 'briancorbin',
    broken: true,
  },
  {
    source: makeSrc('lab-reference-broken-ai', 'HUD FMR Archive Page', 'reference'),
    kind: 'ai',
    reviewedAt: '2026-04-22',
    reviewer: 'briancorbin',
    broken: true,
  },
];

function makeSrc(id: string, label: string, tier: 'original' | 'reference' | 'estimate'): Source {
  return {
    id,
    label,
    url: 'https://example.com',
    tier,
    addedBy: 'briancorbin',
    addedAt: '2026-05-02',
  };
}

// ── Section: /sources row variations ─────────────────────────────────────
function SectionRowVariations() {
  return (
    <Section
      heading="/sources row — kind pill placement"
      subhead="Each variation renders the same 5 rows. Compare how readable the kind signal is across placements."
    >
      <Variation
        title="V1 — Pill next to TierPill (current, hidden for human)"
        description="Skip rendering for `human` since it's the baseline expectation."
      >
        <RowSetV1 />
      </Variation>
      <Variation
        title="V2 — Pill always shown including human"
        description="Always-visible kind pill. More signal, more visual weight."
      >
        <RowSetV2 />
      </Variation>
      <Variation
        title="V3 — Kind as text suffix on the reviewer line"
        description="Inline with the existing metadata; no extra pill."
      >
        <RowSetV3 />
      </Variation>
      <Variation
        title="V4 — Small icon prefix on reviewer (👤 / 🤝 / 🤖)"
        description="Maximum density; legibility depends on font support."
      >
        <RowSetV4 />
      </Variation>
      <Variation
        title="V5 — Status dot turns blue when AI-only (no human yet)"
        description="Encodes review provenance into the existing status dot: green = human-verified, blue = AI-reviewed but awaiting a human pass, amber = overdue/never. No extra pill needed."
      >
        <RowSetV5 />
      </Variation>
      <Variation
        title="V6 — Hollow green ring when AI-only"
        description="Same three-color palette. Filled green = human-verified; hollow green ring = AI-reviewed, awaiting a human pass. Says 'same kind of state, just provisional' — and degrades gracefully for colorblind users since shape carries info."
      >
        <RowSetV6 />
      </Variation>
      <Variation
        title="V7 — Status dot stays health-only; small AI badge for provenance"
        description="Dot encodes only URL health + recency (verified/overdue/broken). A separate AI badge flags provenance when a human hasn't reviewed yet. Treats the two axes as orthogonal."
      >
        <RowSetV7 />
      </Variation>
      <Variation
        title='V8 — "Reviewed" label says "AI reviewed" or "Human reviewed"'
        description="No new visual primitives. The verb itself carries the provenance, color-keyed (green = human, blue = AI). Maximum legibility, lowest visual cost — but the metadata line gets longer."
      >
        <RowSetV8 />
      </Variation>
      <Variation
        title="V9 — V6 + V8 (hollow ring AND labeled verb)"
        description="Belt-and-suspenders: hollow green ring for AI-only at the dot, plus the explicit 'AI reviewed' / 'Human reviewed' verb in the metadata line. Two reinforcing signals — redundant if you trust either one alone, robust if you don't."
      >
        <RowSetV9 />
      </Variation>
    </Section>
  );
}

const AI_ONLY_BLUE = '#3E5A7A';

type LabStatus = 'verified' | 'overdue' | 'ai-only' | 'broken';

const LAB_STATUS_PALETTE: Record<LabStatus, { color: string; short: string; long: string }> = {
  verified: {
    color: T.positive,
    short: 'Verified',
    long: 'Loads correctly and has been reviewed by a human within its window.',
  },
  overdue: {
    color: T.warning,
    short: 'Overdue',
    long: 'No review within the tier-specific window. Pick this up during a periodic sweep.',
  },
  'ai-only': {
    color: AI_ONLY_BLUE,
    short: 'AI-reviewed',
    long: 'Loads correctly and has been reviewed with AI assistance, but a human has not yet given it a pass.',
  },
  broken: {
    color: T.accent,
    short: 'Broken',
    long: 'URL is currently unreachable (404 / error). Needs a fix in src/data/sources.ts paired with a row in reviewed.tsv.',
  },
};

function rowStatus(r: SyntheticRow): LabStatus {
  if (r.broken) return 'broken';
  if (r.kind === 'never') return 'overdue';
  return 'verified';
}

function rowStatusV5(r: SyntheticRow): LabStatus {
  if (r.broken) return 'broken';
  if (r.kind === 'never') return 'overdue';
  if (r.kind === 'human') return 'verified';
  return 'ai-only';
}

function LabStatusDot({
  status,
  size = 10,
  hollow = false,
}: {
  status: LabStatus;
  size?: number;
  /** When true, render the dot as a ring (filled border only). V6 uses this for `ai-only`. */
  hollow?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const basePalette = LAB_STATUS_PALETTE[status];
  // Hollow rendering on a `verified` dot means "AI-reviewed, awaiting human" —
  // override the tooltip copy so it doesn't falsely claim a human pass.
  const palette =
    hollow && status === 'verified'
      ? {
          color: basePalette.color,
          short: 'AI-reviewed',
          long: 'Loads correctly and has been reviewed with AI assistance, but a human has not yet given it a pass.',
        }
      : basePalette;
  const ringWidth = Math.max(2, Math.round(size / 5));
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        alignSelf: 'flex-start',
        marginTop: 5,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
      role="img"
      aria-label={`${palette.short}: ${palette.long}`}
    >
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          background: hollow ? 'transparent' : palette.color,
          boxShadow: hollow ? `inset 0 0 0 ${ringWidth}px ${palette.color}` : 'none',
        }}
      />
      {hover && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            padding: '8px 12px',
            background: T.ink,
            color: T.bg,
            fontSize: rem(12),
            fontFamily: fonts.body,
            lineHeight: 1.4,
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: '0.01em',
            borderRadius: 3,
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: 'min(260px, calc(100vw - 32px))',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontWeight: 600, color: palette.color }}>{palette.short}</span>
          <span style={{ color: T.bg }}> — {palette.long}</span>
        </span>
      )}
    </span>
  );
}

function MockRow({
  children,
  status = 'verified',
  hollow = false,
  badge,
}: {
  children: React.ReactNode;
  status?: LabStatus;
  hollow?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        marginBottom: 8,
        borderRadius: 3,
      }}
    >
      <LabStatusDot status={status} hollow={hollow} />
      {badge}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

const AI_BADGE_BLUE = '#3E5A7A';

function AiBadge() {
  const [hover, setHover] = useState(false);
  const long =
    'AI helped propose or extract this entry; a human has not done an independent eyes-on-source pass.';
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
      role="img"
      aria-label={`AI provenance. ${long}`}
      style={{
        position: 'relative',
        alignSelf: 'flex-start',
        marginTop: 3,
        fontSize: rem(9),
        fontFamily: fonts.mono,
        fontWeight: 700,
        letterSpacing: '0.05em',
        padding: '2px 5px',
        borderRadius: 2,
        background: AI_BADGE_BLUE,
        color: T.bg,
        flexShrink: 0,
        lineHeight: 1.2,
      }}
    >
      AI
      {hover && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            padding: '8px 12px',
            background: T.ink,
            color: T.bg,
            fontSize: rem(12),
            fontFamily: fonts.body,
            lineHeight: 1.4,
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: '0.01em',
            borderRadius: 3,
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: 'min(260px, calc(100vw - 32px))',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontWeight: 600, color: AI_BADGE_BLUE }}>AI</span>
          <span> — {long}</span>
        </span>
      )}
    </span>
  );
}

/** V7 dot mapping: provenance lives in the badge, so the dot ignores kind. */
function rowStatusHealthOnly(r: SyntheticRow): LabStatus {
  if (r.broken) return 'broken';
  if (r.kind === 'never') return 'overdue';
  return 'verified';
}

function RowSetV1() {
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => (
        <MockRow key={r.source.id} status={rowStatus(r)}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
          <div
            style={{
              fontSize: rem(11),
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: T.inkMuted,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              fontWeight: 600,
            }}
          >
            <Pill
              bg={tierBg(r.source.tier)}
              fg={tierFg(r.source.tier)}
              label={r.source.tier ?? '—'}
            />
            {r.kind !== 'never' && r.kind !== 'human' && (
              <Pill bg={kindBg(r.kind)} fg={kindFg(r.kind)} label={r.kind} />
            )}
            <span>
              Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
            </span>
          </div>
        </MockRow>
      ))}
    </>
  );
}

function RowSetV2() {
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => (
        <MockRow key={r.source.id} status={rowStatus(r)}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
          <div
            style={{
              fontSize: rem(11),
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: T.inkMuted,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              fontWeight: 600,
            }}
          >
            <Pill
              bg={tierBg(r.source.tier)}
              fg={tierFg(r.source.tier)}
              label={r.source.tier ?? '—'}
            />
            {r.kind !== 'never' && <Pill bg={kindBg(r.kind)} fg={kindFg(r.kind)} label={r.kind} />}
            <span>
              Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
            </span>
          </div>
        </MockRow>
      ))}
    </>
  );
}

function RowSetV3() {
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => (
        <MockRow key={r.source.id} status={rowStatus(r)}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
          <div
            style={{
              fontSize: rem(11),
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: T.inkMuted,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              fontWeight: 600,
            }}
          >
            <Pill
              bg={tierBg(r.source.tier)}
              fg={tierFg(r.source.tier)}
              label={r.source.tier ?? '—'}
            />
            <span>
              Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
              {r.kind !== 'never' && (
                <span style={{ color: kindFg(r.kind), marginLeft: 6 }}>· {r.kind}</span>
              )}
            </span>
          </div>
        </MockRow>
      ))}
    </>
  );
}

function RowSetV4() {
  const icon = (k: ReviewKind | 'never') => (k === 'human' ? '👤' : k === 'ai' ? '🤖' : '·');
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => (
        <MockRow key={r.source.id} status={rowStatus(r)}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
          <div
            style={{
              fontSize: rem(11),
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: T.inkMuted,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              fontWeight: 600,
            }}
          >
            <Pill
              bg={tierBg(r.source.tier)}
              fg={tierFg(r.source.tier)}
              label={r.source.tier ?? '—'}
            />
            <span>
              <span style={{ marginRight: 4 }}>{icon(r.kind)}</span>
              Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
            </span>
          </div>
        </MockRow>
      ))}
    </>
  );
}

function RowSetV5() {
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => (
        <MockRow key={r.source.id} status={rowStatusV5(r)}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
          <div
            style={{
              fontSize: rem(11),
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: T.inkMuted,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              fontWeight: 600,
            }}
          >
            <Pill
              bg={tierBg(r.source.tier)}
              fg={tierFg(r.source.tier)}
              label={r.source.tier ?? '—'}
            />
            <span>
              Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
            </span>
          </div>
        </MockRow>
      ))}
    </>
  );
}

function RowSetV6() {
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => {
        // Health-only dot status; the hollow flag conveys "AI-only" on top.
        const aiOnly = r.kind === 'ai';
        const status = rowStatusHealthOnly(r);
        return (
          <MockRow
            key={r.source.id}
            status={status}
            // Only hollow when the underlying state is "verified" — broken/overdue
            // should stay solid so the alert reads loudly.
            hollow={aiOnly && status === 'verified'}
          >
            <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
            <div
              style={{
                fontSize: rem(11),
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: T.inkMuted,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
                fontWeight: 600,
              }}
            >
              <Pill
                bg={tierBg(r.source.tier)}
                fg={tierFg(r.source.tier)}
                label={r.source.tier ?? '—'}
              />
              <span>
                Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
              </span>
            </div>
          </MockRow>
        );
      })}
    </>
  );
}

function RowSetV7() {
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => {
        const status = rowStatusHealthOnly(r);
        const badge = r.kind === 'ai' ? <AiBadge /> : null;
        return (
          <MockRow key={r.source.id} status={status} badge={badge}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
            <div
              style={{
                fontSize: rem(11),
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: T.inkMuted,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
                fontWeight: 600,
              }}
            >
              <Pill
                bg={tierBg(r.source.tier)}
                fg={tierFg(r.source.tier)}
                label={r.source.tier ?? '—'}
              />
              <span>
                Reviewed {r.reviewedAt ?? '—'} · {r.reviewer ? `@${r.reviewer}` : 'never'}
              </span>
            </div>
          </MockRow>
        );
      })}
    </>
  );
}

function RowSetV8() {
  // "AI REVIEWED" / "HUMAN REVIEWED" prefix on the metadata line itself.
  const prefix = (k: ReviewKind | 'never'): { text: string; color: string } | null => {
    if (k === 'never') return null;
    if (k === 'human') return { text: 'Human reviewed', color: T.positive };
    return { text: 'AI reviewed', color: AI_BADGE_BLUE };
  };
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => {
        const p = prefix(r.kind);
        return (
          <MockRow key={r.source.id} status={rowStatusHealthOnly(r)}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
            <div
              style={{
                fontSize: rem(11),
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: T.inkMuted,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
                fontWeight: 600,
              }}
            >
              <Pill
                bg={tierBg(r.source.tier)}
                fg={tierFg(r.source.tier)}
                label={r.source.tier ?? '—'}
              />
              <span>
                {p ? (
                  <span style={{ color: p.color, fontWeight: 700 }}>{p.text}</span>
                ) : (
                  <span>Never reviewed</span>
                )}{' '}
                {r.reviewedAt ?? ''} · {r.reviewer ? `@${r.reviewer}` : 'never'}
              </span>
            </div>
          </MockRow>
        );
      })}
    </>
  );
}

function RowSetV9() {
  const prefix = (k: ReviewKind | 'never'): { text: string; color: string } | null => {
    if (k === 'never') return null;
    if (k === 'human') return { text: 'Human reviewed', color: T.positive };
    return { text: 'AI reviewed', color: AI_BADGE_BLUE };
  };
  return (
    <>
      {SYNTHETIC_ROWS.map((r) => {
        const aiOnly = r.kind === 'ai';
        const status = rowStatusHealthOnly(r);
        const p = prefix(r.kind);
        return (
          <MockRow key={r.source.id} status={status} hollow={aiOnly && status === 'verified'}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>{r.source.label}</div>
            <div
              style={{
                fontSize: rem(11),
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: T.inkMuted,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
                fontWeight: 600,
              }}
            >
              <Pill
                bg={tierBg(r.source.tier)}
                fg={tierFg(r.source.tier)}
                label={r.source.tier ?? '—'}
              />
              <span>
                {p ? (
                  <span style={{ color: p.color, fontWeight: 700 }}>{p.text}</span>
                ) : (
                  <span>Never reviewed</span>
                )}{' '}
                {r.reviewedAt ?? ''} · {r.reviewer ? `@${r.reviewer}` : 'never'}
              </span>
            </div>
          </MockRow>
        );
      })}
    </>
  );
}

// ── Section: Summary stats variations ────────────────────────────────────
function SectionSummaryVariations() {
  return (
    <Section
      heading="/sources summary block — kind breakdown"
      subhead="Variations on how the per-kind counts surface alongside Composition and State."
    >
      <Variation
        title="V1 — Three rows: Composition / Review kinds / State (current)"
        description="Mirrors Composition's shape. Each row has 4 cells."
      >
        <SummaryV1 />
      </Variation>
      <Variation
        title="V2 — State row inlines kind breakdown"
        description="Compact; fewer rows. Trade-off: State row is now 7 cells, denser."
      >
        <SummaryV2 />
      </Variation>
      <Variation
        title="V3 — Kind matrix as a small table"
        description="Tier × Kind matrix. Useful if both dimensions matter together."
      >
        <SummaryV3 />
      </Variation>
    </Section>
  );
}

const FAKE_SUMMARY = {
  total: 229,
  original: 11,
  reference: 218,
  estimate: 0,
  reviewedHuman: 5,
  reviewedAi: 22,
  unreviewed: 202,
  verified: 18,
  overdue: 211,
  broken: 53,
};

function SummaryV1() {
  return (
    <SummaryShell>
      <StatRow heading="Composition">
        <Stat label="Total cited" value={FAKE_SUMMARY.total} />
        <Stat label="Original" value={FAKE_SUMMARY.original} tone="positive" />
        <Stat label="Reference" value={FAKE_SUMMARY.reference} />
        <Stat label="Estimate" value={FAKE_SUMMARY.estimate} />
      </StatRow>
      <Divider />
      <StatRow heading="Review kinds">
        <Stat label="Human" value={FAKE_SUMMARY.reviewedHuman} tone="positive" />
        <Stat label="AI" value={FAKE_SUMMARY.reviewedAi} tone="warning" />
        <Stat label="Unreviewed" value={FAKE_SUMMARY.unreviewed} />
      </StatRow>
      <Divider />
      <StatRow heading="State">
        <Stat label="Verified" value={FAKE_SUMMARY.verified} tone="positive" />
        <Stat label="Overdue" value={FAKE_SUMMARY.overdue} tone="warning" />
        <Stat label="Broken" value={FAKE_SUMMARY.broken} tone="accent" />
      </StatRow>
    </SummaryShell>
  );
}

function SummaryV2() {
  return (
    <SummaryShell>
      <StatRow heading="Composition">
        <Stat label="Total cited" value={FAKE_SUMMARY.total} />
        <Stat label="Original" value={FAKE_SUMMARY.original} tone="positive" />
        <Stat label="Reference" value={FAKE_SUMMARY.reference} />
        <Stat label="Estimate" value={FAKE_SUMMARY.estimate} />
      </StatRow>
      <Divider />
      <StatRow heading="State + reviews">
        <Stat label="Verified" value={FAKE_SUMMARY.verified} tone="positive" />
        <Stat label="Overdue" value={FAKE_SUMMARY.overdue} tone="warning" />
        <Stat label="Broken" value={FAKE_SUMMARY.broken} tone="accent" />
        <Stat label="Human" value={FAKE_SUMMARY.reviewedHuman} tone="positive" small />
        <Stat label="AI" value={FAKE_SUMMARY.reviewedAi} tone="warning" small />
        <Stat label="Unrev" value={FAKE_SUMMARY.unreviewed} small />
      </StatRow>
    </SummaryShell>
  );
}

function SummaryV3() {
  // Tier × Kind grid. Counts faked for shape only.
  return (
    <SummaryShell>
      <div
        style={{
          fontSize: rem(11),
          color: T.inkMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        Tier × kind matrix
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px repeat(3, 1fr)',
          gap: 8,
          fontSize: rem(13),
        }}
      >
        <span></span>
        <Cell label="Human" tone="positive" />
        <Cell label="AI" tone="warning" />
        <Cell label="Unreviewed" />

        <RowLabel>Original</RowLabel>
        <Cell label="3" />
        <Cell label="2" />
        <Cell label="6" />

        <RowLabel>Reference</RowLabel>
        <Cell label="2" />
        <Cell label="20" />
        <Cell label="196" />

        <RowLabel>Estimate</RowLabel>
        <Cell label="0" />
        <Cell label="0" />
        <Cell label="0" />
      </div>
    </SummaryShell>
  );
}

// ── Section: Citation popover variations ─────────────────────────────────
function SectionPopoverVariations() {
  return (
    <Section
      heading="Citation popover — kind in row metadata"
      subhead="Hover the citation pill below each variation to see the popover; rows show different kind treatments."
    >
      <Variation
        title="V1 — Live popover from the actual component (uses real REVIEWS data)"
        description="The current, shipped behavior — kind pill rendered for non-human rows. None of the ALL_SOURCES references in this lab match a real review id, so no kind appears here yet."
      >
        <p style={{ fontSize: rem(13), color: T.inkSoft, marginBottom: 12 }}>
          Here is a citation: <Cite source={SYNTHETIC_ROWS[0].source} /> — click it to see the
          popover.
        </p>
      </Variation>
      <Variation
        title="V2 — Static mock with kind pill always visible"
        description="If we always show the kind, even for human, what does it look like?"
      >
        <PopoverMockV2 />
      </Variation>
      <Variation
        title="V3 — Kind as a tiny suffix character (H / AI / AI-P) prefixing the date"
        description="Maximum compactness; legible at a glance once you learn the codes."
      >
        <PopoverMockV3 />
      </Variation>
    </Section>
  );
}

function PopoverMockV2() {
  return (
    <PopoverShell>
      {SYNTHETIC_ROWS.map((r, i) => (
        <PopoverRow key={i}>
          <PopoverDot row={r} />
          <div style={{ flex: 1 }}>
            <span style={{ color: T.ink }}>{r.source.label}</span>{' '}
            <span style={{ color: T.accent, fontWeight: 600 }}>↗</span>
            <div
              style={{
                fontSize: rem(11),
                color: T.inkMuted,
                marginTop: 2,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Pill
                bg={tierBg(r.source.tier)}
                fg={tierFg(r.source.tier)}
                label={r.source.tier ?? '—'}
              />
              {r.kind !== 'never' && (
                <Pill bg={kindBg(r.kind)} fg={kindFg(r.kind)} label={r.kind} />
              )}
              <span>{r.reviewedAt ?? '—'}</span>
            </div>
          </div>
        </PopoverRow>
      ))}
    </PopoverShell>
  );
}

function PopoverMockV3() {
  const code = (k: ReviewKind | 'never') => (k === 'human' ? 'H' : k === 'ai' ? 'AI' : '—');
  return (
    <PopoverShell>
      {SYNTHETIC_ROWS.map((r, i) => (
        <PopoverRow key={i}>
          <PopoverDot row={r} />
          <div style={{ flex: 1 }}>
            <span style={{ color: T.ink }}>{r.source.label}</span>{' '}
            <span style={{ color: T.accent, fontWeight: 600 }}>↗</span>
            <div
              style={{
                fontSize: rem(11),
                color: T.inkMuted,
                marginTop: 2,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Pill
                bg={tierBg(r.source.tier)}
                fg={tierFg(r.source.tier)}
                label={r.source.tier ?? '—'}
              />
              <span>
                <span
                  style={{
                    color: r.kind === 'never' ? T.inkMuted : kindFg(r.kind),
                    fontWeight: 700,
                    marginRight: 4,
                  }}
                >
                  {code(r.kind)}
                </span>
                {r.reviewedAt ?? '—'}
              </span>
            </div>
          </div>
        </PopoverRow>
      ))}
    </PopoverShell>
  );
}

// ── Tiny primitives ──────────────────────────────────────────────────────
function Section({
  heading,
  subhead,
  children,
}: {
  heading: string;
  subhead?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: rem(28),
          fontWeight: 500,
          marginBottom: 6,
          letterSpacing: '-0.01em',
        }}
      >
        {heading}
      </h2>
      {subhead && (
        <p style={{ fontSize: rem(14), color: T.inkSoft, marginBottom: 24, maxWidth: '70ch' }}>
          {subhead}
        </p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Variation({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px dashed ${T.border}`,
        padding: 18,
        borderRadius: 4,
      }}
    >
      <div style={{ fontSize: rem(13), fontWeight: 600, marginBottom: 4, color: T.ink }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: rem(12), color: T.inkSoft, marginBottom: 16 }}>{description}</div>
      )}
      {children}
    </div>
  );
}

function Pill({ bg, fg, label }: { bg: string; fg: string; label: string }) {
  return (
    <span
      style={{
        fontSize: rem(10),
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 600,
        background: bg,
        color: fg,
        padding: '2px 8px',
        borderRadius: 2,
      }}
    >
      {label}
    </span>
  );
}

function tierBg(tier?: string) {
  if (tier === 'original') return 'rgba(45, 80, 22, 0.12)';
  if (tier === 'estimate') return 'rgba(184, 116, 43, 0.18)';
  return 'rgba(166, 38, 28, 0.10)';
}
function tierFg(tier?: string) {
  if (tier === 'original') return T.positive;
  if (tier === 'estimate') return T.warning;
  return T.accent;
}
function kindBg(kind: ReviewKind | 'never') {
  if (kind === 'human') return 'rgba(45, 80, 22, 0.12)';
  if (kind === 'ai') return 'rgba(62, 90, 122, 0.16)';
  return 'rgba(0, 0, 0, 0.06)';
}
function kindFg(kind: ReviewKind | 'never') {
  if (kind === 'human') return T.positive;
  if (kind === 'ai') return T.aiAccent;
  return T.inkMuted;
}

function SummaryShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: '20px 24px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {children}
    </section>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.border, opacity: 0.6 }} />;
}

function StatRow({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: rem(11),
          color: T.inkMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {heading}
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: number;
  tone?: 'positive' | 'warning' | 'accent';
  small?: boolean;
}) {
  const color =
    tone === 'positive'
      ? T.positive
      : tone === 'warning'
        ? T.warning
        : tone === 'accent'
          ? T.accent
          : T.ink;
  return (
    <div style={{ minWidth: small ? 80 : 110 }}>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: rem(small ? 22 : 30),
          fontWeight: 500,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: rem(11),
          color: T.inkMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Cell({ label, tone }: { label: string; tone?: 'positive' | 'warning' | 'accent' }) {
  const color =
    tone === 'positive'
      ? T.positive
      : tone === 'warning'
        ? T.warning
        : tone === 'accent'
          ? T.accent
          : T.ink;
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '6px 4px',
        background: 'rgba(0,0,0,0.02)',
        color,
        fontWeight: 600,
        fontSize: rem(13),
      }}
    >
      {label}
    </div>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: rem(11),
        color: T.inkMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 600,
        alignSelf: 'center',
      }}
    >
      {children}
    </div>
  );
}

function PopoverShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        padding: '8px 0',
        maxWidth: 360,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontFamily: fonts.body,
        fontSize: rem(12),
      }}
    >
      {children}
    </div>
  );
}

function PopoverRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '6px 14px',
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
}

function PopoverDot({ row }: { row: SyntheticRow }) {
  return <LabStatusDot status={rowStatusV5(row)} size={8} />;
}
