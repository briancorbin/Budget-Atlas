#!/usr/bin/env node
// Seed GitHub issues for broken links surfaced by the latest link audit.
//
// Reads the most recent TSV from audit/links/results/, finds entries that
// curl couldn't reach (404, network errors, anti-bot 999), and creates
// one issue per URL — deduped against existing open issues that carry the
// `audit:link` label.
//
// Status codes we treat as "create an issue":
//   404           - page is gone
//   000 / ERR     - DNS/TLS/timeout — likely dead domain or a real outage
//   999           - LinkedIn-style anti-bot — sometimes resolves under human
//                   eyes, but worth surfacing because if curl can't reach it,
//                   plenty of users with privacy extensions also can't.
//
// Statuses we DON'T issue on:
//   200 / 3xx     - it loaded; manual review tracked in reviewed.tsv instead
//   403           - bot-blocked; almost always fine in a real browser
//
// Usage:
//   node audit/links/seed-issues.mjs               # create issues
//   node audit/links/seed-issues.mjs --dry-run     # print what would happen
//
// Auth:
//   Requires the gh CLI authenticated. In GitHub Actions, GITHUB_TOKEN is
//   sufficient (set permissions: { issues: write } on the workflow).

import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const RESULTS_DIR = resolve(__dirname, 'results');
const REPO = 'TheBudgetAtlas/thebudgetatlas';
const LABEL = 'audit:link';

// Safety cap. If the latest audit somehow shows hundreds of new failures,
// abort instead of flooding the tracker — probably a regex / network issue,
// not a real fleet of broken citations.
const MAX_PER_RUN = 50;

const ACTIONABLE = new Set(['404', '000', 'ERR', '999']);

const DRY_RUN = process.argv.includes('--dry-run');

function sh(args, opts = {}) {
  return execFileSync('gh', args, { encoding: 'utf8', ...opts }).trim();
}

// --- Locate the latest results TSV ---
let tsvs;
try {
  tsvs = readdirSync(RESULTS_DIR)
    .filter((f) => f.endsWith('.tsv'))
    .sort();
} catch {
  console.error(`No results directory at ${RESULTS_DIR}. Run yarn check-links first.`);
  process.exit(1);
}
if (tsvs.length === 0) {
  console.error('No results TSV found. Run yarn check-links first.');
  process.exit(1);
}
const latestPath = resolve(RESULTS_DIR, tsvs[tsvs.length - 1]);
console.log(`→ Reading ${latestPath}`);

// --- Parse rows (skip header) ---
const rows = readFileSync(latestPath, 'utf8')
  .split('\n')
  .slice(1)
  .filter(Boolean)
  .map((line) => {
    const [status, url, finalUrl] = line.split('\t');
    return { status, url, finalUrl };
  });

const broken = rows.filter((r) => ACTIONABLE.has(r.status));
console.log(`→ ${broken.length} actionable / ${rows.length} total URLs.`);

if (broken.length === 0) {
  console.log('Nothing to do. ✨');
  process.exit(0);
}

// --- Fetch already-open audit issues, build a URL → already-tracked index ---
const existingRaw = sh([
  'issue',
  'list',
  '--repo',
  REPO,
  '--label',
  LABEL,
  '--state',
  'open',
  '--limit',
  '500',
  '--json',
  'number,title,body',
]);
const existing = JSON.parse(existingRaw || '[]');
const tracked = new Set();
for (const issue of existing) {
  // Body has `**Broken URL:** <url>` — match the URL specifically rather than
  // \S+ which greedily captures the markdown bold-close `**` token.
  const m = issue.body?.match(/Broken URL:[*\s]*(https?:\/\/\S+)/);
  if (m) tracked.add(m[1]);
}
console.log(
  `→ ${existing.length} existing open audit issues; ${tracked.size} URLs already tracked.`,
);

// --- Find the file:line citations for a URL via grep ---
function findCitations(url) {
  try {
    const out = execFileSync(
      'grep',
      [
        '-rn',
        '--include=*.ts',
        '--include=*.tsx',
        '--include=*.md',
        '--include=*.json',
        '--include=*.html',
        '--exclude-dir=node_modules',
        '--exclude-dir=.yarn',
        '--exclude-dir=dist',
        '--exclude-dir=results',
        '-F',
        url,
        ROOT,
      ],
      { encoding: 'utf8' },
    );
    return out
      .trim()
      .split('\n')
      .map((line) => line.replace(`${ROOT}/`, ''))
      .slice(0, 8);
  } catch {
    return [];
  }
}

// --- Create issues for new failures ---
const toCreate = broken.filter((r) => !tracked.has(r.url));
console.log(`→ ${toCreate.length} new issue(s) to create${DRY_RUN ? ' (dry run)' : ''}.`);

if (toCreate.length > MAX_PER_RUN) {
  console.error(
    `\n  Refusing to create ${toCreate.length} issues in one run (cap: ${MAX_PER_RUN}).\n  This usually means the audit script broke or the network is wedged. Investigate first.`,
  );
  process.exit(2);
}

let created = 0;
for (const r of toCreate) {
  const cites = findCitations(r.url);
  const shortPath = r.url.replace(/^https?:\/\//, '').slice(0, 60);
  const title = `Broken link (${r.status}): ${shortPath}`;
  const body = [
    `Detected by the [link audit](https://github.com/${REPO}/tree/main/audit/links).`,
    ``,
    `**Broken URL:** ${r.url}`,
    `**curl status:** \`${r.status}\``,
    r.finalUrl && r.finalUrl !== r.url ? `**Final URL after redirects:** ${r.finalUrl}` : '',
    ``,
    `### Cited from`,
    cites.length
      ? cites.map((c) => `- \`${c}\``).join('\n')
      : '_No code locations found by grep — the URL may have already been removed, or the audit picked it up from a non-source file._',
    ``,
    `### How to resolve`,
    `1. Open the URL yourself. See what's there.`,
    `2. Find the canonical replacement, an equivalent authoritative source, or determine that the citation should be removed.`,
    `3. Update the data file and any README references in lockstep (citations are mirrored).`,
    `4. Add a row to [\`audit/links/reviewed.tsv\`](https://github.com/${REPO}/blob/main/audit/links/reviewed.tsv) with your review notes — that record carries forward across audit runs.`,
    `5. PR with \`Closes #__\` in the description to auto-close this issue.`,
    ``,
    `See [\`audit/links/README.md\`](https://github.com/${REPO}/blob/main/audit/links/README.md) for the full audit philosophy and contribution flow.`,
  ]
    .filter((s) => s !== '')
    .join('\n');

  if (DRY_RUN) {
    console.log(`\n  [dry-run] would create:`);
    console.log(`    title: ${title}`);
    console.log(`    body:\n${body.replace(/^/gm, '      ')}`);
    continue;
  }

  console.log(`  → ${title}`);
  sh(['issue', 'create', '--repo', REPO, '--title', title, '--body', body, '--label', LABEL]);
  created++;
}

console.log(
  `\n✨ Done. ${DRY_RUN ? 'Would create' : 'Created'} ${DRY_RUN ? toCreate.length : created} issue(s); skipped ${broken.length - toCreate.length} already-tracked.`,
);
