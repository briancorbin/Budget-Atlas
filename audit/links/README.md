# Link audit

Reproducible audit of every external URL cited from the codebase — does it still load, and (more importantly) does the loaded page still cite the content we claim it cites?

## How it works

1. **`check.sh`** extracts every `http(s)://` URL from source files (`.ts`, `.tsx`, `.md`, `.json`, `.html`, `.svg`) excluding build artifacts, hits each with curl, and writes a dated TSV to `results/`.
2. **`reviewed.tsv`** is a hand-maintained log of human reviews — one row per URL where a person has actually opened the link and confirmed the destination still cites what we claim. The script joins these into the output.
3. **`results/<date>.tsv`** captures the union: machine status (does it load?) + human review state (did someone verify the content?).

A `200 OK` from curl only tells us _something_ loaded. Only a human can tell us whether the loaded page still cites the document we built the model around. Both columns matter.

## Running the audit

```bash
yarn check-links
# or directly:
./audit/links/check.sh
```

Requires bash + curl + grep + xargs + awk. Takes ~1 minute over all ~230 URLs at 20-way parallelism.

## Status code interpretation

| Code          | Meaning             | Action                                                                            |
| ------------- | ------------------- | --------------------------------------------------------------------------------- |
| `200`         | Loaded              | Verify the destination still cites the claimed content (human review)             |
| `3xx`         | Followed a redirect | Final URL recorded in column 3 — usually fine, sometimes signals a moved citation |
| `403` / `999` | Bot-blocked         | Usually fine in a real browser; manual check                                      |
| `404`         | Page is gone        | Replace the citation or remove the data point                                     |
| `000` / `ERR` | DNS/TLS/timeout     | Manual browser check; might be a transient outage or a domain that's gone         |

## Recording a manual review

When you've opened a URL and confirmed the cited content is still there:

```
url<TAB>YYYY-MM-DD<TAB>your-handle<TAB>brief notes
```

Append a row to `reviewed.tsv`. The next audit run will pick it up.

Be honest in the notes — if the page moved but the content is the same, say so. If the document was superseded but the new one still backs the same claim, say so. The notes are the audit trail.

## Contributing a fix

1. Run the audit. Pick a finding from `results/<latest>.tsv`.
2. Open the URL yourself. Read the destination. Decide what's actually broken.
3. If a replacement URL exists for the same document, update both the data file and the README in lockstep (citations are mirrored — see [CLAUDE.md](../../CLAUDE.md) on the citation discipline).
4. Add a row to `reviewed.tsv` with your review notes.
5. Open a PR. Commit message should distinguish _URL moved_ (cosmetic) from _citation was substantively wrong_ (epistemic). The HUD Handbook 4350.3 fix in commit [`342056b`](https://github.com/TheBudgetAtlas/thebudgetatlas/commit/342056b) is a worked example of the latter — wrong URL _and_ wrong date.

## Known patterns to watch for

- **The `date` field that lies.** Citations entered from semantic memory often have the year the citation was _entered_, not the year the document was _published_. Cross-check against the document's actual revision date.
- **Deep PDF links rot fastest.** Prefer the canonical landing page; the agency is more likely to maintain that URL than a `/sites/dfiles/...` deep link.
- **Primary > secondary.** When a secondary source (operational handbook) cites a primary source (federal register notice, statute), prefer the primary. It's more durable and more rigorous.
- **Continuously-updated regulations beat dated handbooks.** If the eCFR has the same rule as a 2013 handbook, cite the eCFR — it has version history baked in.
