/** "$1,234". Negatives use a real minus sign for typographic correctness. */
export function fmt(n: number): string {
  const r = Math.round(n);
  if (r < 0) return '−$' + Math.abs(r).toLocaleString();
  return '$' + r.toLocaleString();
}

/**
 * Currently equivalent to `fmt`: typographic minus for negatives, no explicit
 * '+' for positives. Kept as a separate name so call sites that handle
 * potentially-negative deltas (discretionary income, comparisons) read
 * intentionally — and so a future "+" prefix can land here without churn.
 */
export function fmtSigned(n: number): string {
  return (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString();
}

/** "12.3%" — pass a fraction (0.123). */
export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}
