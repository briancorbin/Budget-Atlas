/** "$1,234". Negatives use a real minus sign for typographic correctness. */
export function fmt(n: number): string {
  const r = Math.round(n);
  if (r < 0) return '−$' + Math.abs(r).toLocaleString();
  return '$' + r.toLocaleString();
}

/** Always shows the sign; useful for deltas and discretionary amounts. */
export function fmtSigned(n: number): string {
  return (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString();
}

/** "12.3%" — pass a fraction (0.123). */
export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}
