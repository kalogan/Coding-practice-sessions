# AlgoHarness — Standing Contract

_Binding for every agent in this repo. Short on purpose — the methodology lives in
[`docs/pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md`](docs/pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md);
the front door is [`AGENTS.md`](AGENTS.md). This is the binding contract._

## What this is
A **production-truthful preview harness for learning algorithms visually** (package `algo-harness`),
built to prep for structured coding interviews. Each algorithm is **real code** that emits a snapshot
at every meaningful step; the visualization only ever draws those snapshots, so **what you see is
exactly what the code did** — it can't drift into a pretty lie. A gate test asserts every traced run
returns the real, known-correct answer. Current phase: a working single-page app (205 passing
algorithm traces across sliding-window → graphs → DP → ML/game-AI → linear-algebra → ROM-hacking
tracks), now adding more practice problems one gate-green slice at a time.

## Tech spine
- **Stack:** Vite 5 + React 18 + TypeScript 5.6 (strict, `noUnusedLocals`/`noUnusedParameters`,
  `noFallthroughCasesInSwitch`) · Vitest 2 (node env, globals) · ESLint 9 flat config
  (`typescript-eslint` recommended; `no-explicit-any` off; unused-vars honor a leading `_`) ·
  Prism for code highlighting. **Package manager: pnpm.** Node 24 locally.
- **Four entries, ONE project** (all mount the SAME real components + SAME algorithm registry —
  never a fork; see [`vite.config.ts`](vite.config.ts) `rollupOptions.input` + [`vercel.json`](vercel.json) rewrites):

  | URL | Entry HTML → source | What it is |
  |-----|--------------------|------------|
  | `/` | `index.html` → `src/main.tsx` → `<App>` | Production learning view: pick an algo, play/step/scrub. |
  | `/preview` | `preview.html` → `src/preview/main.tsx` → `<PreviewApp>` | Harness workbench: same components + input knobs + raw-trace inspector. |
  | `/playground` | `playground.html` → `src/playground/main.tsx` | Write JS/Python, run it in a worker, watch the real trace render. |
  | `/learn` | `learn.html` → `src/learn/main.tsx` | Curriculum study path (ordered modules → algo ids). |
- **Layers:**
  - `src/algorithms/**/*.algo.ts` — **pure algorithm descriptors** (`export default` an `AlgoDescriptor`,
    see [`src/algorithms/types.ts`](src/algorithms/types.ts)). Emit trace snapshots via
    [`src/algorithms/tracer.ts`](src/algorithms/tracer.ts). **Zero-wiring:**
    [`registry.ts`](src/algorithms/registry.ts) auto-discovers every `*.algo.ts` — no manual
    registration.
  - `src/harness/**` — the view components (`ArrayView`, `GraphView`, `HexView`, …) + `Controls` /
    `StepView` / `CodePanel`.
  - `src/core/**` — the shared shell: `Workbench`, `AppShell`, `Player`.
  - `src/curriculum.ts` — the study-path ordering used by `/learn`.
  - `src/playground/**` — the user-code runner (JS + Python via a web worker).

## The gate (the definition of "done" — run with real exit codes; verified green 2026-07-10)
```
pnpm typecheck     # tsc --noEmit                              → exit 0
pnpm lint          # eslint .                                  → exit 0
pnpm test          # vitest run — every traced run == known answer   → exit 0  (205 tests)
pnpm build         # tsc --noEmit && vite build → dist/ (4 entries)  → exit 0
pnpm smoke         # runtime smoke (see below) — builds dist first
```
**Record the test count every run.** A drop from 205 with everything "green" means tests were
deleted/skipped, not passing.

**`pnpm smoke`** ([`scripts/smoke.mjs`](scripts/smoke.mjs)) is the runtime-smoke layer: serves the
freshly-built `dist/` on `:4319`, drives all four screens, **drives every algorithm** in the picker
(mounts a view + renders a note + steps once), checks a **mobile viewport** for horizontal overflow,
exercises the playground JS path, and scans the console. ⚠️ Its Chromium discovery (`findChrome()`)
looks under a **Linux path** (`/opt/pw-browsers`) — it runs in the managed Linux env / CI, **not**
natively on this Windows box. Treat a visible change as UNVERIFIED-VISUAL until it clears smoke there
(or is driven by hand).

**Release gate** (before anything ships): frozen-lockfile install → build → deploy → verify the
DEPLOYED artifact (asset Content-Type + a visible build stamp matching the commit). **No CI workflow
exists yet** (`.github/workflows/` is absent) — adding `ci.yml` is an open item (see OPEN FORKS).

## Non-negotiable constraints (gated, not hoped-for)
1. **Trace-truth (the whole point).** The visualization draws ONLY snapshots the real algorithm emits
   via the tracer. Never add parallel "display" logic that can drift from the executed code. If a
   change makes the picture and the code disagree, it's a bug, not a feature.
2. **Every algorithm ships a known-answer test.** Add its expected result to
   [`src/algorithms/__tests__/algorithms.test.ts`](src/algorithms/__tests__/algorithms.test.ts) —
   the honesty gate must cover each traced run.
3. **Zero-wiring registry.** Algorithms are data: drop a `*.algo.ts` that `export default`s an
   `AlgoDescriptor` and it appears in the picker automatically. Adding one must NOT require editing
   the harness/registry by hand.
4. **Deterministic traces.** A given input always yields the same trace. Seed any randomness with a
   local seeded RNG (the house pattern is a seeded LCG — _"deterministic, no `Math.random` / Date"_);
   never call `Math.random()` / `Date.now()` in executed trace logic. The known-answer tests depend on it.
5. **Visible changes are SEEN before they ship** — UNVERIFIED-VISUAL blocks handoff/deploy. This is a
   visual learning app, so `pnpm smoke` (desktop + mobile) is load-bearing, not optional.
6. **Accessibility + mobile/responsive** are standing constraints on every UI slice (WCAG AA:
   semantic markup, keyboard-operable + visible focus, labeled controls, AA contrast, honor
   reduce-motion, no color-only meaning; reflow at ~320px, 44px touch targets, no hover-only). Mobile
   horizontal-overflow is already gated in `pnpm smoke`.
7. **Builders never add/remove/upgrade dependencies** — request them; the Architect installs with
   lockfile sync.
8. **Targeted git adds only** (each specific file); no destructive git; commit model named per slice
   (builder-commits / architect-commits / worktree+branch — pipeline §6b). Co-Authored-By trailer on
   commits.

## Environment quirks (things that WILL bite an agent that doesn't know)
- **⚠️ Stray home-directory pnpm workspace.** `C:\Users\kevin\pnpm-workspace.yaml` (+ a `package.json`
  and `node_modules` in the home dir) makes pnpm treat **`C:\Users\kevin` as the monorepo root**. This
  project isn't in that workspace's package list, so a plain `pnpm install` here **silently no-ops**
  ("Already up to date", ~250 ms, **no `node_modules` created**) and the gate can't run. **Install with
  `pnpm install --frozen-lockfile --ignore-workspace`.** Vercel is unaffected (it clones only this
  repo). Permanent fix option: add a repo-local `pnpm-workspace.yaml` so the upward walk stops here
  (OPEN FORK).
- **`esbuild` build script is unapproved** — pnpm prints `ERR_PNPM_IGNORED_BUILDS: esbuild` and exits
  1 on install, but the build still works (the bundler binary is present). Not a blocker.
- **Windows / PowerShell** is the primary shell (Bash tool also available). Node 24 local.
- The runtime `pnpm smoke` needs a Linux-path Chromium (see gate above) — it verifies in the managed
  env / CI, not on this Windows machine.

## Deploy (Vercel — a safety boundary; the Director drives it)
- [`vercel.json`](vercel.json): framework `vite`, `buildCommand: pnpm run build`, output `dist`,
  rewrites `/preview` `/playground` `/learn`. Auto-deploys on push.
- Remote: `github.com/kalogan/Coding-practice-sessions`. Repo is **not** linked locally (no `.vercel/`).
- **Production URL routing (open item):** the clean production domain is
  `https://coding-practice-sessions.vercel.app/`; the current branch is deploying to a **branch-preview**
  URL instead. That's a Vercel **Production Branch** setting mismatch, fixable only in the Vercel
  dashboard with the Director's login (see OPEN FORKS). Agents do not change Vercel settings.

## Safety boundaries (never unattended)
Destructive git (`reset --hard`, force-push, history rewrite) · deploys and Vercel dashboard/settings
changes · real messages/emails/spend · dependency add/remove/upgrade · auth/secrets/access changes.
When in doubt, checkpoint and ask.

## Commands
- dev: `pnpm dev` (Vite, port 5173) · test: `pnpm test` · build: `pnpm build` · smoke: `pnpm smoke`
- install (this machine): `pnpm install --frozen-lockfile --ignore-workspace` (see quirks)
- preview harness route: `/preview` · playground: `/playground` · study path: `/learn`

## Standing state (keep current — a fresh agent resumes from here)
- **Done:** working app; gate green at **205 tests**; tracks shipped — sliding-window, strings, lists,
  trees, heaps, graphs, DP, backtracking, pathfinding, hashing, sorting, ML, game-AI, an RL/data
  pipeline, linear-algebra, and ROM-hacking.
- **In flight:** this contract (bootstrapping `CLAUDE.md`).
- **Next:** Director hands specific practice problems, one disjoint gate-green slice at a time.
- **OPEN FORKS awaiting the Director** (re-surface every report until answered):
  1. **Vercel production routing** — point `coding-practice-sessions.vercel.app` at this branch by
     setting it as the Production Branch (or establish a real `main` production branch). Needs the
     Vercel dashboard + Director login.
  2. **Add CI** — no `.github/workflows/ci.yml` yet; the methodology wants the gate on every push.
  3. **Permanent pnpm isolation** — add a repo-local `pnpm-workspace.yaml` so `pnpm install` works
     here without `--ignore-workspace`?
