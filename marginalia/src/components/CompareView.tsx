import { useRef, useState, useEffect, useMemo, Fragment } from 'react';
import { theme, fonts, rem } from '../theme';
import {
  POLISH_LEVEL_LABELS,
  type Granularity,
  type Level,
  type PolishLevel,
  type Section,
} from '../types';

/**
 * Side-by-side comparison view: Raw on the left, the slider's selected
 * polish level on the right. Hovering a unit on either pane highlights
 * its counterpart on the other (via mapsFrom) and scrolls into view.
 * Units with no Raw source (aiAdded === true) get a slate-blue accent.
 *
 * Granularity:
 *   - 'section'  — hover-targets are top-level Sections.
 *   - 'sentence' — for sections that author a sentences[] breakdown,
 *                  each sentence becomes its own hover target. Sections
 *                  without sentences[] fall back to section-level
 *                  highlighting (the whole section is still hoverable
 *                  as one unit). Cross-pane mapping at sentence
 *                  granularity tries sentence-IDs first, then falls
 *                  back to the parent section's mapping.
 *
 * Mobile: parent (PostPage) hides this on narrow viewports.
 */
export function CompareView({
  rawLevel,
  rightLevel,
  rightLabel,
  granularity,
}: {
  rawLevel: Level;
  rightLevel: Level;
  rightLabel: PolishLevel;
  granularity: Granularity;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const leftRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Flatten sections to the granularity actually being rendered. At
  // 'section' granularity, units = the top-level Section[]. At 'sentence'
  // granularity, sections that have sentences[] expand into their leaves;
  // sections that don't stay as one unit. The flattened list is what
  // drives both rendering and the mapping/hover lookups.
  const leftUnits = useMemo(
    () => flattenForGranularity(rawLevel.editorial, granularity),
    [rawLevel, granularity],
  );
  const rightUnits = useMemo(
    () => flattenForGranularity(rightLevel.editorial, granularity),
    [rightLevel, granularity],
  );

  // ID → unit lookup (per pane).
  const leftById = useMemo(() => indexById(leftUnits), [leftUnits]);
  const rightById = useMemo(() => indexById(rightUnits), [rightUnits]);

  // Inverse mapping: for each Raw unit ID, which right-pane unit IDs
  // declare it in their mapsFrom?
  const rawIdToRightIds = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const u of rightUnits) {
      for (const r of u.mapsFrom ?? []) {
        const cur = m.get(r) ?? [];
        cur.push(u.id);
        m.set(r, cur);
      }
    }
    return m;
  }, [rightUnits]);

  // Set of Raw unit IDs to highlight, given the currently-hovered ID.
  const highlightedRawIds = useMemo(() => {
    if (!hovered) return new Set<string>();
    if (leftById.has(hovered)) return new Set([hovered]);
    const right = rightById.get(hovered);
    if (!right) return new Set<string>();
    // Direct sentence-level mapsFrom first.
    const direct = right.mapsFrom ?? [];
    if (direct.length > 0) {
      // Filter to IDs that actually exist on the left at this granularity.
      const valid = direct.filter((id) => leftById.has(id));
      if (valid.length > 0) return new Set(valid);
    }
    // Fall back to the right unit's parent section mapping (if it's a
    // sentence inside a parent that maps).
    if (right.parentSection?.mapsFrom) {
      const valid = right.parentSection.mapsFrom.filter((id) =>
        leftById.has(id),
      );
      if (valid.length > 0) return new Set(valid);
      // If the parent maps to Raw section IDs but we're at sentence
      // granularity, the left side may have those Raw sections expanded
      // into sentences. Highlight every leaf whose parent matches.
      const parentMatches = new Set<string>();
      for (const u of leftUnits) {
        if (
          u.parentSection &&
          right.parentSection.mapsFrom!.includes(u.parentSection.id)
        ) {
          parentMatches.add(u.id);
        } else if (right.parentSection.mapsFrom!.includes(u.id)) {
          parentMatches.add(u.id);
        }
      }
      return parentMatches;
    }
    return new Set<string>();
  }, [hovered, leftById, rightById, leftUnits]);

  // Set of right-pane unit IDs to highlight.
  const highlightedRightIds = useMemo(() => {
    if (!hovered) return new Set<string>();
    if (rightById.has(hovered)) return new Set([hovered]);
    const left = leftById.get(hovered);
    if (!left) return new Set<string>();
    // Right units that declare this Raw ID directly.
    const direct = rawIdToRightIds.get(hovered) ?? [];
    if (direct.length > 0) return new Set(direct);
    // Fall back: if hovering a sentence on the left whose parent section
    // maps to right sections, highlight every right unit whose id (or
    // parent's id) is in the inverse map for the parent.
    if (left.parentSection) {
      const parentTargets = rawIdToRightIds.get(left.parentSection.id) ?? [];
      const out = new Set<string>(parentTargets);
      // Also include right sentences whose parent section is in parentTargets.
      for (const u of rightUnits) {
        if (u.parentSection && parentTargets.includes(u.parentSection.id)) {
          out.add(u.id);
        }
      }
      return out;
    }
    return new Set<string>();
  }, [hovered, leftById, rightById, rawIdToRightIds, rightUnits]);

  // Scroll-into-view sync.
  useEffect(() => {
    if (!hovered) return;
    const isLeft = leftById.has(hovered);
    const targets: HTMLDivElement[] = [];
    const ids = isLeft ? highlightedRightIds : highlightedRawIds;
    const refs = isLeft ? rightRefs : leftRefs;
    for (const id of ids) {
      const el = refs.current.get(id);
      if (el) targets.push(el);
    }
    if (targets[0]) {
      targets[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hovered, highlightedRawIds, highlightedRightIds, leftById]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        marginTop: 8,
      }}
    >
      <Pane
        label={POLISH_LEVEL_LABELS.raw}
        units={leftUnits}
        highlighted={highlightedRawIds}
        refs={leftRefs}
        onHover={setHovered}
      />
      <Pane
        label={POLISH_LEVEL_LABELS[rightLabel]}
        units={rightUnits}
        highlighted={highlightedRightIds}
        refs={rightRefs}
        onHover={setHovered}
      />
    </div>
  );
}

// =============================================================================
// Flattening + indexing
// =============================================================================

type Unit = Section & {
  /** Reference to the parent Section if this unit is a sentence-level child. */
  parentSection?: Section;
};

function flattenForGranularity(
  sections: Section[],
  granularity: Granularity,
): Unit[] {
  if (granularity === 'section') {
    return sections.map((s) => ({ ...s }));
  }
  // 'sentence': expand sections that have sentences[]; keep others as-is.
  const out: Unit[] = [];
  for (const s of sections) {
    if (s.sentences && s.sentences.length > 0) {
      for (const sent of s.sentences) {
        out.push({ ...sent, parentSection: s });
      }
    } else {
      out.push({ ...s });
    }
  }
  return out;
}

function indexById(units: Unit[]): Map<string, Unit> {
  const m = new Map<string, Unit>();
  for (const u of units) m.set(u.id, u);
  return m;
}

// =============================================================================
// Render
// =============================================================================

function Pane({
  label,
  units,
  highlighted,
  refs,
  onHover,
}: {
  label: string;
  units: Unit[];
  highlighted: Set<string>;
  refs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  onHover: (id: string | null) => void;
}) {
  return (
    <div
      style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: 8,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: rem(10),
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: theme.inkMuted,
          marginBottom: 12,
          position: 'sticky',
          top: 0,
          background: theme.bg,
          paddingTop: 4,
          paddingBottom: 6,
          zIndex: 1,
        }}
      >
        {label}
      </div>
      {units.map((u) => (
        <UnitBlock
          key={u.id}
          unit={u}
          highlighted={highlighted.has(u.id)}
          registerRef={(el) => refs.current.set(u.id, el)}
          onHover={onHover}
        />
      ))}
    </div>
  );
}

function UnitBlock({
  unit,
  highlighted,
  registerRef,
  onHover,
}: {
  unit: Unit;
  highlighted: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  onHover: (id: string | null) => void;
}) {
  const isAi = unit.aiAdded === true;
  const isSentence = unit.parentSection !== undefined;
  return (
    <div
      ref={registerRef}
      onMouseEnter={() => onHover(unit.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        // Sentence-level units sit closer together and have less indent
        // so they read as a continuous paragraph when not highlighted.
        padding: isSentence ? '2px 12px' : '8px 12px',
        margin: isSentence ? '0 -12px' : '4px -12px',
        borderRadius: 3,
        borderLeft: isAi ? `3px solid ${theme.aiAccent}` : '3px solid transparent',
        background: highlighted
          ? isAi
            ? 'rgba(62, 90, 122, 0.12)'
            : 'rgba(166, 38, 28, 0.08)'
          : 'transparent',
        transition: 'background 120ms ease',
        cursor: 'default',
        // At sentence granularity, render units inline-ish so a
        // paragraph reads continuously. Use display: inline only inside
        // a parent that wraps adjacent sentences. For simplicity v0:
        // each sentence is its own block. Re-evaluate after eyeball.
        display: 'block',
      }}
    >
      <Fragment>{unit.content}</Fragment>
    </div>
  );
}
