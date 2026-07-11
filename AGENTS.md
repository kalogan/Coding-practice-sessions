# AGENTS

This is a **standalone coding-practice repo** (not a studio game on the shared game-kit). The team's
build methodology — the **Architect–Builder pipeline** — is vendored under **`docs/pipeline-starter/`**.

**Read first:** [`docs/pipeline-starter/START_HERE.md`](docs/pipeline-starter/START_HERE.md), then the
engine itself, [`docs/pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md`](docs/pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md).

Because this is a plain project (not a game, not on the kit), the **portable core** is what applies —
**skip** the studio/game-only docs in the pack: `STUDIO_GAME_LAYER.md`, `GAME-DESIGN-PLAYBOOK.md`
(skim its §9 rules anyway — they hold), and `TASTE_AND_REVIEW.template.md`.

**When you want a standing contract for this repo:** fill
`docs/pipeline-starter/PROJECT_CONTRACT.template.md` → save as `CLAUDE.md` (and
`AGENT_ONBOARDING.template.md` → `docs/AGENT_ONBOARDING.md`).

**Working style in brief:** grill the task until unambiguous → decompose into disjoint, gate-able
slices → build → verify with **real exit codes** (typecheck / lint / test / build) → **targeted git
adds only** → never add/remove dependencies unasked → stop at safety boundaries (deploys, deps, auth).
Nothing a builder claims is true until independently verified; if a change is visible, it isn't done
until someone has SEEN it.
