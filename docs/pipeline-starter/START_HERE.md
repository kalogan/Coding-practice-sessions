# Pipeline Starter Pack — copy this WHOLE FOLDER into any new project

This folder is the **fully self-contained, portable** form of the Architect–Builder methodology —
everything needed to run it in a bare repo with no studio infrastructure (e.g. a work project).
Copy the folder in, fill the templates, go.

**Two layers.** The *portable core* (pipeline / harness / playbook + the contract/taste/status
templates) works for any project. If this repo is a **studio game built on a shared kit**, also read
**`STUDIO_GAME_LAYER.md`** — the part the portable pack doesn't cover: how a game *reuses* the kit and
*contributes back* to it, so the learnings live in this folder, not trapped in one game's repo.

| File | What it is | What you do with it |
|---|---|---|
| `ARCHITECT_BUILDER_PIPELINE.md` | **The engine** — the full methodology the orchestrating agent executes | Hand it to the AI first, always. |
| `PREVIEW_HARNESS.md` | The runtime-smoke companion (how the agent *sees* the running thing) | Reference for the AI when building the preview/labs. |
| `GAME-DESIGN-PLAYBOOK.md` | The design process (grill → master plan → roadmap → slices) + §9 execution rules | Game/creative projects. For plain apps/sites, skim §9 anyway — the rules hold. |
| `STUDIO_GAME_LAYER.md` | **The studio overlay** — reuse-in / contribute-out the shared kit, promotion cycle, inspiration-not-a-rip, reference-extraction, postmortem/harvest | **Read only if this repo is a game on a shared kit.** Skip for standalone work projects. |
| `AGENT_ONBOARDING.template.md` | The single "start a fresh session here" orientation doc | **Fill it**, save as `docs/AGENT_ONBOARDING.md` — the first thing you point a new agent at. |
| `PROJECT_CONTRACT.template.md` | The standing constraints for THIS project | **Fill it** (30 min once), save as the repo's `CLAUDE.md`, add an `AGENTS.md` that says "read CLAUDE.md". |
| `TASTE_AND_REVIEW.template.md` | Your taste, machine-readable: art bible, domain checklists, review queue, open forks | **Fill the art-bible before any visual work**; the agent maintains the rest. |
| `STATUS.template.md` | The durable cold-resume file (gate history, shipped slices, open forks, incidents→constraints) | Save as `STATUS.md`; the agent updates it every slice. |
| `ci.yml.template` | The gate as CI (frozen install + typecheck + lint + test + build) | Save as `.github/workflows/ci.yml`, adapt commands. |

_These are snapshots of the masters in crucible `docs/`. When the masters improve, re-run
`node scripts/sync-pipeline-starter.mjs` in crucible to refresh this folder._

## Day-zero ritual (do these in order, ~1 hour)

1. `git init` + **create a remote** + push. A repo on one disk is a bet against hardware.
2. Copy this folder in. Fill `PROJECT_CONTRACT.template.md` → save as `CLAUDE.md`, and
   `AGENT_ONBOARDING.template.md` → save as `docs/AGENT_ONBOARDING.md` (the single start-here you point
   a fresh agent at). Put the method docs (pipeline / harness / playbook — and `STUDIO_GAME_LAYER.md`
   if this is a game on a shared kit) under the repo's **`docs/`** — every scaffolded project is
   METHOD-SELF-CONTAINED so an agent working in this repo alone has the full methodology. Write a
   **`README.md`** with the boot commands AND an explicit "if you are an AI agent, read in this order:
   docs/AGENT_ONBOARDING.md → CLAUDE.md → STATUS.md → TASTE_AND_REVIEW.md → docs/ARCHITECT_BUILDER_
   PIPELINE.md" section — the README is the front door agents actually hit first.
   - **Studio game?** Also write a **`REUSE-INDEX.md`** (source-verified: what to vendor from the kit
     vs port from sibling repos — audit BEFORE building; a new game is mostly assembly) and follow
     `STUDIO_GAME_LAYER.md` for the reuse-in / contribute-out cycle.
3. Define the **gate** (the exact commands = "done") in the contract, and add a CI workflow that
   runs it on every push (frozen-lockfile install → typecheck → lint → test → build).
4. Fill the **art-bible** section of the taste file — one reference image + one anti-reference per
   visual surface. Adjectives alone are not a spec.
5. Tell the agent: *"Read CLAUDE.md and ARCHITECT_BUILDER_PIPELINE.md. Grill me until the design
   is locked, then plan disjoint slices."* — and answer the grill.

## The five rules that do 80% of the work (if you remember nothing else)

1. **Nothing a builder claims is true until independently verified** (real exit codes, recorded
   test counts).
2. **If nobody SAW it, it isn't verified** — UNVERIFIED-VISUAL blocks shipping; demand the
   screenshot or drive it yourself.
3. **Art ships as a versioned variant behind a lab/preview; the human promotes it** — never the
   builder, never straight to live.
4. **Builders never touch dependencies, never broad-add, never cross their file surface.**
5. **"Done" includes the release gate**: frozen install, deploy, verify the deployed artifact
   (content-type + build stamp), CI green.

## Your duties as the human (the machine can't do these)

- Answer grills **decisively**; chase your own open-forks list — silence becomes an agent's guess.
- Provide the **reference images** before art work, not rejections after.
- Show up at the **feel gates** — they're scheduled precisely because only your eye can judge them.
- Define **shipped** for the project and hold the line (a URL someone else can open, not "works
  for me").
