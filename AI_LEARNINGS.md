# AI Learnings

A running journal of what working with AI on this project has actually been like — patterns that worked, traps to avoid, instincts that have shifted. Sister file to `AI_TIME_LOG.md`: that one is quantitative (hours per PR), this one is qualitative (what the hours felt like, and what I'd do differently).

The point is calibration over time. After 50+ entries the patterns become visible.

## Conventions

- **Append, don't curate.** Date each entry; let contradictions stand. Reading "I thought X in May, then I thought ¬X in July" is the actual learning.
- **One observation per entry.** Short is fine. A sentence is fine.
- **Be honest about misses too.** Times AI made things worse, times I should have just done it solo, times I over-trusted output.
- **Tag categories** in `[brackets]` when useful: `[trust]`, `[scope]`, `[tooling]`, `[process]`, `[skill]`, `[memory]`, etc. Free-form, no fixed taxonomy.

## Log

<!-- Newest entries at the top. -->

### 2026-05-07 — Worktree cleanup as a forcing function `[process]`

Accidentally deleted my Claude worktree and panicked about losing memory. Memory turned out to be in `~/.claude/` (separate from the worktree), so nothing was lost — but the panic itself surfaced that I'd been operating without a clear mental model of what's where. Worth knowing: memory is durable, worktrees are disposable, branches are recoverable via reflog. Don't overload one mechanism with assumptions about another.

### 2026-05-07 — Force-pushing my own feature branch is still a mistake `[process]`

Asked Claude to "get my branch up to date with main." It rebased and force-pushed (with-lease). My instinct: that's not how I want to work — squash-merge at PR close means the feature-branch history doesn't matter, so a merge commit is fine and a rewrite-and-force-push is friction with no upside. Saved as a memory; default going forward is `git merge main`.

### 2026-05-07 — Setting up the AI time log is itself the highest-leverage entry `[meta]`

Spent ~6 minutes scaffolding `AI_TIME_LOG.md`; would have spent ~45 minutes solo (designing the table, arguing with myself about columns, second-guessing the multiplier framing). The act of tracking AI savings is itself an AI-saved task. Recursion is healthy.

<!-- Add new entries above this line. -->

## Recurring patterns (rolling synthesis)

A periodically-rewritten distillation of the entries above. Not authoritative — entries are. This section is the cliff-notes a future-me can scan in 30 seconds.

- _Too few entries yet to synthesize. Revisit at ~10 entries._
