import type { FilingStatus, Lifestyle } from '@/types';
import { CITIES } from '@/data/cities';
import { BENEFIT_IDS, type BenefitId } from '@/lib/benefits';

export const SCHEMA_VERSION = 1;
const LS_KEY = 'budget-atlas:config:v1';

export interface SharedConfig {
  incomeA: number;
  incomeB: number;
  twoIncome: boolean;
  filing: FilingStatus;
  city: string;
  kids: number;
  lifestyle: Lifestyle;
  compareCity: string;
  claimedBenefits: ReadonlySet<string>;
}

/**
 * Wire-format defaults for v=1.
 *
 * Two rules:
 *
 *   1. EXISTING ENTRIES ARE IMMUTABLE. Do not edit a value already here.
 *      Doing so silently rewrites the meaning of every previously-shared v=1
 *      link that omitted that key. To change what a fresh page shows, edit
 *      the live initial values in BudgetExplorer.tsx. To change the wire
 *      format itself, ship v=2 with its own DEFAULTS_V2.
 *
 *   2. ADDITIVE GROWTH IS FINE. When a new field joins SharedConfig, add a
 *      new entry here. Old links don't carry the key, so they will decode to
 *      that new default forever — pick conservatively (the "feature absent"
 *      / "user didn't opt in" value).
 */
export const DEFAULTS_V1: SharedConfig = Object.freeze({
  incomeA: 56000,
  incomeB: 54000,
  twoIncome: true,
  filing: 'married' as FilingStatus,
  city: 'cmh',
  kids: 2,
  lifestyle: 'moderate' as Lifestyle,
  compareCity: 'sf',
  // Plain empty Set. We don't `Object.freeze` it because freeze doesn't
  // affect Set internal slots (`.add()` / `.delete()` still work). The
  // immutability of DEFAULTS_V1 is enforced by convention plus the fact
  // that decodeConfig always clones into a fresh Set before writing.
  claimedBenefits: new Set<string>() as ReadonlySet<string>,
});

const FILING_TO_CODE: Record<FilingStatus, string> = { single: 's', married: 'm', head: 'h' };
const CODE_TO_FILING: Record<string, FilingStatus> = { s: 'single', m: 'married', h: 'head' };

const LIFESTYLE_TO_CODE: Record<Lifestyle, string> = {
  modest: '0',
  moderate: '1',
  comfortable: '2',
};
const CODE_TO_LIFESTYLE: Record<string, Lifestyle> = {
  '0': 'modest',
  '1': 'moderate',
  '2': 'comfortable',
};

const VALID_BENEFITS: ReadonlySet<string> = new Set<BenefitId>(BENEFIT_IDS);

function setEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export function encodeConfig(cfg: SharedConfig): string {
  const p = new URLSearchParams();
  p.set('v', String(SCHEMA_VERSION));
  if (cfg.incomeA !== DEFAULTS_V1.incomeA) p.set('a', String(cfg.incomeA));
  if (cfg.incomeB !== DEFAULTS_V1.incomeB) p.set('b', String(cfg.incomeB));
  if (cfg.twoIncome !== DEFAULTS_V1.twoIncome) p.set('t', cfg.twoIncome ? '1' : '0');
  if (cfg.filing !== DEFAULTS_V1.filing) p.set('f', FILING_TO_CODE[cfg.filing]);
  if (cfg.city !== DEFAULTS_V1.city) p.set('c', cfg.city);
  if (cfg.kids !== DEFAULTS_V1.kids) p.set('k', String(cfg.kids));
  if (cfg.lifestyle !== DEFAULTS_V1.lifestyle) p.set('l', LIFESTYLE_TO_CODE[cfg.lifestyle]);
  if (cfg.compareCity !== DEFAULTS_V1.compareCity) p.set('cc', cfg.compareCity);
  if (!setEqual(cfg.claimedBenefits, DEFAULTS_V1.claimedBenefits)) {
    const sorted = [...cfg.claimedBenefits].sort();
    p.set('cb', sorted.join(','));
  }
  return p.toString();
}

function parseInt10(s: string): number | null {
  if (!/^-?\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export function decodeConfig(payload: string): SharedConfig {
  const out: SharedConfig = {
    ...DEFAULTS_V1,
    claimedBenefits: new Set(DEFAULTS_V1.claimedBenefits),
  };

  const stripped = payload.startsWith('#') ? payload.slice(1) : payload;
  const p = new URLSearchParams(stripped);

  const v = p.get('v');
  if (v != null && v !== String(SCHEMA_VERSION)) {
    console.warn(
      `[configShare] Unknown schema version v=${v}; parsing known keys against v=${SCHEMA_VERSION} defaults.`,
    );
  }

  const a = p.get('a');
  if (a != null) {
    const n = parseInt10(a);
    if (n != null && n >= 0) out.incomeA = n;
  }

  const b = p.get('b');
  if (b != null) {
    const n = parseInt10(b);
    if (n != null && n >= 0) out.incomeB = n;
  }

  const t = p.get('t');
  if (t === '0' || t === '1') out.twoIncome = t === '1';

  // Validators below use `Object.hasOwn` rather than the `in` operator.
  // `in` walks the prototype chain, so a crafted hash like `f=toString`
  // would otherwise match `Object.prototype.toString` and assign a
  // function reference into `out.filing`, crashing downstream code.
  const f = p.get('f');
  if (f != null && Object.hasOwn(CODE_TO_FILING, f)) out.filing = CODE_TO_FILING[f];

  const c = p.get('c');
  if (c != null && Object.hasOwn(CITIES, c)) out.city = c;

  const k = p.get('k');
  if (k != null) {
    const n = parseInt10(k);
    if (n != null && n >= 0 && n <= 12) out.kids = n;
  }

  const l = p.get('l');
  if (l != null && Object.hasOwn(CODE_TO_LIFESTYLE, l)) out.lifestyle = CODE_TO_LIFESTYLE[l];

  const cc = p.get('cc');
  if (cc != null && Object.hasOwn(CITIES, cc)) out.compareCity = cc;

  const cb = p.get('cb');
  if (cb != null) {
    const ids = cb
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && VALID_BENEFITS.has(s));
    out.claimedBenefits = new Set(ids);
  }

  return out;
}

/** True if the hash payload looks like a v=1 config (has `v=` or any known key). */
export function looksLikeConfigHash(payload: string): boolean {
  const stripped = payload.startsWith('#') ? payload.slice(1) : payload;
  if (stripped.length === 0) return false;
  const p = new URLSearchParams(stripped);
  return ['v', 'a', 'b', 't', 'f', 'c', 'k', 'l', 'cc', 'cb'].some((k) => p.has(k));
}

export function loadFromStorage(): SharedConfig | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return decodeConfig(raw);
  } catch {
    return null;
  }
}

export function saveToStorage(cfg: SharedConfig): void {
  try {
    localStorage.setItem(LS_KEY, encodeConfig(cfg));
  } catch {
    // Quota exceeded, private mode, etc. — silent fail; not load-bearing.
  }
}
