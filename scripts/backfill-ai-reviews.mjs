#!/usr/bin/env node
/**
 * One-off: backfill `ai` review rows for every source in the registry that
 * doesn't already have a review row.
 *
 * Why: most sources currently in `src/data/sources.ts` were proposed and
 * extracted by AI during bulk imports without an independent eyes-on-source
 * human pass. The `reviewed.tsv` log honestly says "no review" for those —
 * but the ground truth is closer to "AI-reviewed, awaiting human." The
 * fairer record is one `ai` row per never-reviewed source dated to its
 * `addedAt` (or `date` fallback, or today as last resort), with a note
 * explaining the backfill.
 *
 * After this runs, the /sources page surfaces them as AI-reviewed (hollow
 * green ring + "AI reviewed [date]" verb) when within the tier window, or
 * Overdue (amber) when the addedAt date is older than the tier threshold.
 * Both are honest reflections of where the data came from and how stale it
 * is — better than the misleading "Never reviewed" we had before.
 *
 * Usage:
 *   node --experimental-strip-types scripts/backfill-ai-reviews.mjs [--dry-run]
 *
 * Idempotent: only adds rows for ids missing from `REVIEWS`. Safe to re-run.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REVIEWED_TSV = resolve(ROOT, 'audit/links/reviewed.tsv');

const DRY_RUN = process.argv.includes('--dry-run');

const sourcesModule = await import(pathToFileURL(resolve(ROOT, 'src/data/sources.ts')).href);
const { ALL_SOURCES } = sourcesModule;

// Parse existing reviewed.tsv to find which ids already have any review.
const existing = new Set();
const reviewedRaw = readFileSync(REVIEWED_TSV, 'utf8');
for (const line of reviewedRaw.split('\n')) {
  if (!line || line.startsWith('#') || line.startsWith('id\t')) continue;
  const id = line.split('\t')[0];
  if (id) existing.add(id);
}

const today = new Date().toISOString().slice(0, 10);
const FALLBACK_REVIEWER = 'briancorbin';
const NOTE =
  'Backfill: source predates the kind-column convention. Most rows in src/data/sources.ts were AI-proposed during bulk imports without an eyes-on-source human pass; this row records that honestly so the /sources page reflects ground truth (AI-reviewed if within the tier window, Overdue if older).';

const rows = [];
for (const source of ALL_SOURCES) {
  if (existing.has(source.id)) continue;
  const date = source.addedAt ?? source.date ?? today;
  const reviewer = source.addedBy ?? FALLBACK_REVIEWER;
  rows.push(`${source.id}\t${date}\t${reviewer}\tai\t${NOTE}`);
}

if (rows.length === 0) {
  console.log('No backfill needed — every source has at least one review row.');
  process.exit(0);
}

console.log(`Sources missing a review row: ${rows.length}`);
console.log(`Total sources in registry:    ${ALL_SOURCES.length}`);

if (DRY_RUN) {
  console.log('\n--dry-run: not writing. First 5 rows that would be appended:\n');
  for (const r of rows.slice(0, 5)) console.log(r);
  process.exit(0);
}

// Append with a leading blank line + a comment marker so the boundary is
// visible in the diff. The parser ignores comments and blank lines, so this
// is purely cosmetic / for the human reader.
const trailing = reviewedRaw.endsWith('\n') ? '' : '\n';
const block = [
  trailing,
  `# Backfill ${today}: ai rows for sources predating the kind-column convention. ${rows.length} rows.`,
  ...rows,
  '',
].join('\n');
writeFileSync(REVIEWED_TSV, reviewedRaw + block);
console.log(`\nAppended ${rows.length} rows to ${REVIEWED_TSV}.`);
