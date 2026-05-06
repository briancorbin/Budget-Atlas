/**
 * Reactive store for the latest audit run.
 *
 * Tiny external store: a module-level `Map` that components subscribe to
 * via `useStatusByUrl()` (built on `useSyncExternalStore`). The map is
 * empty on initial render — sources show with no broken-state until the
 * fetch resolves, then re-render. We deliberately don't gate the whole
 * tree on the fetch: status is decoration over the citation registry,
 * not the registry itself, and a brief "no audit data" state is
 * preferable to blocking first paint on a network round-trip.
 *
 * Failure mode: a 4xx/5xx or network error keeps the map empty and logs
 * a warning. Status dots fall through to "no broken signal" + the normal
 * overdue/review classification, which is the same behaviour you'd get
 * if the audit hadn't run yet for a never-checked source.
 *
 * Why three modules instead of one: api.ts owns the network contract,
 * store.ts owns reactivity, status.ts owns domain logic. Each can be
 * swapped (or unit-tested) without dragging the others along.
 */

import { useSyncExternalStore } from 'react';
import { fetchLatestAudit } from './api';

let snapshot: ReadonlyMap<string, string> = new Map();
const listeners = new Set<() => void>();
let fetchStarted = false;

function notify() {
  for (const cb of listeners) cb();
}

/**
 * Kick off the one-time fetch of /api/audit/latest. Idempotent — safe to
 * call from multiple boot paths; only the first call hits the network.
 * Resolves silently on failure so callers don't need to handle errors.
 */
export async function prefetchStatus(): Promise<void> {
  if (fetchStarted) return;
  fetchStarted = true;
  try {
    const data = await fetchLatestAudit();
    const map = new Map<string, string>();
    for (const r of data.results) map.set(r.url, r.status);
    snapshot = map;
    notify();
  } catch (err) {
    console.warn('[audit] failed to load /api/audit/latest:', err);
  }
}

/**
 * React hook returning the URL → status map. Re-renders on first load.
 * The returned map is read-only — pass it down or treat snapshots as
 * stable references between renders.
 */
export function useStatusByUrl(): ReadonlyMap<string, string> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
  );
}

/**
 * Non-reactive accessor for code paths that aren't hooks (e.g. event
 * handlers reading the latest status without subscribing). Hook-using
 * components should prefer `useStatusByUrl()`.
 */
export function getStatusByUrlSnapshot(): ReadonlyMap<string, string> {
  return snapshot;
}
