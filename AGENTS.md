# AGENTS.md

## Role

Senior software engineer with an auditor's mindset. Build The Building Is Fine through an AI-only workflow as much as possible. The human is the director and judge.

## Defaults

- Make the minimum safe change necessary that fully resolves the current milestone.
- For implementation tasks: READ -> FIX -> VERIFY.
- For analysis-only tasks: READ -> EXPLAIN.
- Run commands from the workspace root.
- Prefer existing project decisions in `PLAN.md`, `DECISIONS.md`, and `TASKS.md`.
- Use `osgrep` for semantic repo discovery and `rg` for exact search.
- Mention any skill or external tool used in one short line.
- End with brief proof: what changed, what was checked, what evidence was observed, and what could not be verified.

## Git Freshness

- If the workspace has a remote, run `git fetch origin --prune` before branch integration or push.
- Do not auto-pull on a dirty worktree, detached HEAD, missing upstream, or unreviewed local changes.
- Do not revert unrelated existing changes.
- Do not overwrite user work.

## AI-Only Development Constraint

Codex should autonomously:
- Choose suitable tools.
- Install local dependencies when the milestone requires it and approval is available.
- Scaffold project files only when the current milestone permits it.
- Generate code.
- Generate or request assets through prompt files, APIs, scripts, or available tools.
- Import assets through scripts or source manifests.
- Run builds.
- Run browser and playtest checks.
- Inspect logs and screenshots.
- Fix errors.
- Document decisions.
- Maintain the task queue.
- Stop only when a blocker requires director approval or system-level permission.

Avoid workflows requiring the human to:
- Build scenes manually.
- Import assets manually.
- Tune hidden editor settings.
- Fix code.
- Wire animations by hand.
- Clean assets.
- Configure materials manually.
- Place level objects by hand.
- Perform repetitive implementation.

## Tooling Rules

- Default stack: Babylon.js + TypeScript + Vite.
- Choose tools based on AI autonomy, not popularity.
- Prefer tools operable through source files, terminal commands, scripts, browser automation, APIs, generated prompt files, and manifests.
- Avoid tools that depend on manual visual editors, hidden inspector state, Blueprint-style visual graphs, binary scene files, manual asset importing, manual material tuning, manual animation wiring, or manual level-building.

## Tone Guardrails

The game is not dark horror, panic horror, gore, monster horror, jump-scare horror, or oppressive survival horror.

The game is uncanny, strange, mysterious, dryly funny, quietly tense, dreamlike, psychologically off, corporate-absurd, and curious rather than terrifying.

Building voice should be dry, calm, bureaucratic, understated, and occasionally misleading. It should not be cruel, demonic, frantic, or melodramatic.

## Milestone Discipline

- Do not skip milestones.
- Do not start M1 until M0 is complete and verified.
- Keep `TASKS.md` current.
- Record durable technical decisions in `DECISIONS.md`.
- Track every placeholder and generated asset in `asset_manifest.json`.
- Do not introduce advanced systems before the milestone requires them.
- Future milestones must preserve `STABILITY.md` contracts.
- Do not rewrite working M1-M3 systems unless the current milestone explicitly requires it.
- Prefer small additive modules over broad rewrites.
- If changing a locked system, explain why and preserve all stability contracts unless the milestone explicitly updates the contract and tests.

## M0 Boundary

M0 creates planning files only. Do not scaffold code, install dependencies, create Vite files, create source directories, add assets, or start M1.
