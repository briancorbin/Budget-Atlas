import { theme, fonts, rem } from '../theme';
import { GRANULARITIES, GRANULARITY_LABELS, type Granularity } from '../types';

/**
 * Compare-view granularity picker. Small mono pill set — testing-flavored
 * affordance for now (Brian wants to toggle through resolutions when
 * eyeballing the device, not necessarily a permanent reader-facing
 * control). Sits next to the compare toggle in the post header.
 *
 * Section is always available. Sentence is available but renders fall
 * back to section-level when a Section hasn't authored sentences[] —
 * the picker doesn't try to gate enablement based on data, it just
 * shows the option and the render handles the fallback.
 */
export function GranularityPicker({
  value,
  onChange,
  disabled,
}: {
  value: Granularity;
  onChange: (next: Granularity) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Compare granularity"
      title={
        disabled
          ? 'Granularity is only meaningful in compare mode.'
          : 'Hover-target resolution in compare view.'
      }
      style={{
        display: 'inline-flex',
        border: `1px solid ${theme.border}`,
        borderRadius: 4,
        overflow: 'hidden',
        background: theme.surface,
        fontFamily: fonts.mono,
        fontSize: rem(11),
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span
        style={{
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          color: theme.inkMuted,
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        Granularity
      </span>
      {GRANULARITIES.map((g) => {
        const active = g === value;
        return (
          <button
            key={g}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(g)}
            style={{
              appearance: 'none',
              border: 0,
              padding: '0 14px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: active && !disabled ? theme.ink : 'transparent',
              color: active && !disabled ? theme.bg : theme.inkSoft,
              font: 'inherit',
              letterSpacing: 'inherit',
              textTransform: 'inherit',
            }}
          >
            {GRANULARITY_LABELS[g]}
          </button>
        );
      })}
    </div>
  );
}
