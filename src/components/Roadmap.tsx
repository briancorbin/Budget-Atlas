import { theme as T, fonts } from '@/theme';
import { ROADMAP, SHIPPED, type RoadmapItem, type RoadmapStatus } from '@/data/roadmap';
import { SectionTitle } from './ui';

export function Roadmap({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg, color: T.ink,
      fontFamily: fonts.body,
      padding: '40px 24px 80px',
      backgroundImage:
        `radial-gradient(circle at 20% 0%, rgba(166, 38, 28, 0.04), transparent 50%),
         radial-gradient(circle at 80% 100%, rgba(45, 80, 22, 0.03), transparent 50%)`,
    }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <Header onBack={onBack} />
        <Intro />
        <PlannedList />
        <ShippedList />
        <Footer onBack={onBack} />
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      borderTop: `2px solid ${T.ink}`, paddingTop: 16,
      marginBottom: 32,
    }}>
      <div style={{
        fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: T.accent, fontWeight: 600,
      }}>
        The Budget Atlas · Vol. 2026 · Roadmap
      </div>
      <a
        href="#/"
        onClick={(e) => { e.preventDefault(); onBack(); }}
        style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: T.inkSoft, textDecoration: 'none',
          borderBottom: `1px solid ${T.border}`,
          paddingBottom: 2,
        }}
      >
        ← Back to the atlas
      </a>
    </div>
  );
}

function Intro() {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        fontFamily: fonts.display, fontSize: 44, fontWeight: 500,
        lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 16,
      }}>
        What's coming
      </div>
      <p style={{
        fontSize: 16, lineHeight: 1.55, color: T.inkSoft,
        maxWidth: 640, margin: 0,
      }}>
        The model is a snapshot of how Americans live on what they earn — but it has gaps.
        These are the next things on the build list, in no particular order. Some are
        accuracy improvements (modeling 401(k) contributions, per-child childcare costs,
        Married Filing Separately). Some are new modeling territory (time as a household
        resource, untaxed cash income, a job-by-metro wage comparison). Some are
        plumbing (open-ended location selection, shareable scenario links).
      </p>
    </div>
  );
}

function PlannedList() {
  return (
    <div style={{ marginBottom: 56 }}>
      <SectionTitle kicker={`Planned · ${ROADMAP.length} items`}>
        On the build list
      </SectionTitle>
      <div style={{ display: 'grid', gap: 16 }}>
        {ROADMAP.map(item => (
          <PlannedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function PlannedCard({ item }: { item: RoadmapItem }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      padding: '20px 24px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        gap: 16, marginBottom: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{
            fontFamily: fonts.mono, fontSize: 13, color: T.inkMuted,
            fontWeight: 500,
          }}>
            {String(item.id).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: fonts.display, fontSize: 22, fontWeight: 500,
            color: T.ink, letterSpacing: '-0.005em',
          }}>
            {item.title}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <CategoryTag category={item.category} />
          <StatusBadge status={item.status} />
        </div>
      </div>
      <p style={{
        fontSize: 14, lineHeight: 1.6, color: T.inkSoft,
        margin: 0, marginLeft: 32,
      }}>
        {item.summary}
      </p>
    </div>
  );
}

function CategoryTag({ category }: { category: string }) {
  return (
    <span style={{
      fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: T.inkMuted, fontFamily: fonts.body, fontWeight: 600,
      padding: '3px 8px',
      border: `1px solid ${T.border}`,
      borderRadius: 2,
      whiteSpace: 'nowrap',
    }}>
      {category}
    </span>
  );
}

function StatusBadge({ status }: { status: RoadmapStatus }) {
  const styles: Record<RoadmapStatus, { color: string; bg: string; label: string }> = {
    planned:       { color: T.inkMuted, bg: T.bg,        label: 'Planned' },
    'in-progress': { color: T.warning,  bg: T.bg,        label: 'In progress' },
    shipped:       { color: T.bg,       bg: T.positive,  label: '✓ Shipped' },
  };
  const s = styles[status];
  return (
    <span style={{
      fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: s.color, background: s.bg,
      fontFamily: fonts.body, fontWeight: 700,
      padding: '3px 8px', borderRadius: 2,
      border: `1px solid ${status === 'shipped' ? T.positive : T.border}`,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

function ShippedList() {
  return (
    <div style={{ marginBottom: 48 }}>
      <SectionTitle kicker={`Shipped · ${SHIPPED.length} milestones`}>
        Already in the model
      </SectionTitle>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12,
      }}>
        {SHIPPED.map((item, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            padding: '16px 20px',
            position: 'relative',
          }}>
            <div style={{
              fontFamily: fonts.display, fontSize: 17, fontWeight: 500,
              marginBottom: 6, paddingRight: 64,
            }}>
              {item.title}
            </div>
            <div style={{
              position: 'absolute', top: 16, right: 16,
              fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.bg, background: T.positive,
              fontFamily: fonts.body, fontWeight: 700,
              padding: '2px 7px', borderRadius: 2,
            }}>
              ✓ Shipped
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.55, color: T.inkSoft, margin: 0,
            }}>
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      borderTop: `2px solid ${T.ink}`, paddingTop: 24, marginTop: 48,
      textAlign: 'center',
    }}>
      <a
        href="#/"
        onClick={(e) => { e.preventDefault(); onBack(); }}
        style={{
          fontFamily: fonts.body, fontSize: 13, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer',
          padding: '10px 18px', background: T.surface,
          border: `1px solid ${T.border}`, color: T.ink, fontWeight: 600,
          textDecoration: 'none', display: 'inline-block',
        }}
      >
        ← Back to the atlas
      </a>
      <div style={{
        marginTop: 24, fontSize: 11, color: T.inkMuted, letterSpacing: '0.18em',
        textTransform: 'uppercase', fontFamily: fonts.body,
      }}>
        Have an idea worth adding? Open an issue on the repo.
      </div>
    </div>
  );
}
