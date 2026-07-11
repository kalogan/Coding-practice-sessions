# <PROJECT> — Agent Onboarding (save filled-in as `docs/AGENT_ONBOARDING.md`)

**Start a fresh session here.** The one file that tells a new agent what this is, how we work, where
it stands, and what to do next — without archaeology. Read it, then the two files it points at, act.

> This repo is **method-self-contained**: the method docs are vendored into `docs/` here, so a session
> that only ever opens this repo has everything it needs.

## 1 · What this is
<One paragraph: the product, its real purpose/deliverable, the signature. For a studio game: "the game
is the harness; the reusable kit is the deliverable" — name what kit capability it hardens.>

## 2 · Where it stands
<One paragraph: current phase. If it's a scaffold, say so plainly — "docs + structure only, no code
yet; the design grill comes first." Point to `STATUS.md` as the live state.>

## 3 · How we work here (the pipeline, in brief)
Three roles: **Director/Owner** (the human — taste, promotes art, holds safety boundaries),
**Architect** (you — grill the request into disjoint verifiable slices, dispatch/execute,
**independently re-run the full gate** with real exit codes, record test counts, commit with targeted
adds, stop at safety boundaries), **Builders** (optional background agents on disjoint file surfaces;
never change deps; never `git add -A`). Per-slice rhythm: cut surface → build → gate green → targeted
add → commit → (owner-gated) push/CI/deploy → update `STATUS.md` → report honest "needs your eye"
items. Full method: `docs/ARCHITECT_BUILDER_PIPELINE.md`. The non-negotiables: `CLAUDE.md`.

## 4 · Reuse first — this is mostly ASSEMBLY  <!-- STUDIO GAMES ONLY; delete for standalone projects -->
Audit BEFORE writing code — most of what you need exists. Two catalogs answer "who already solved
this?": the kit's **`MATURITY.md`** (vendor a module, don't hand-roll) and the studio's
**`CROSS-GAME-REUSE.md`** (by-domain map → which sibling game solved it; read its source under
`web-projects/<game>/`). Capture the result in this repo's `docs/REUSE-INDEX.md` (verified paths +
port-vs-vendor plan). **The flow is two-way:** reuse IN, and harden NEW kit modules to contribute OUT
(the point). Keep `src/kit/**` promotion-ready; track contribution candidates in `STATUS.md`. Full
cycle: `STUDIO_GAME_LAYER.md`.

## 5 · What to do next (in order)
1. <e.g. design grill — resolve the open forks; fill the art bible reference surfaces>
2. <e.g. S-1 scaffold toolchain>
3. <e.g. S0 the make-or-break feel-gate spike>

## 6 · Tripwires (things that WILL bite)
- <e.g. this is a scaffold — don't skip the grill and start coding>
- <e.g. reuse before building — audit the kit + prior repos first>
- <e.g. no preview/WebGL in the agent env — verify by tests + build; the look/feel is the owner's call>
- <e.g. targeted git adds only; never edit vendored kit in place; remote/CI/deploy are owner-gated>
- <e.g. inspiration-not-a-rip; reference extraction is study-only, never ship ripped assets>
