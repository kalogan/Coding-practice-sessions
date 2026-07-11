# C-Programming Track — Locked Design & Roadmap

_Status: SHIPPED — a full **zero-to-hero curriculum of 81 taught sessions across 13 modules** is live at
`/c-programming`, each session a right-side teacher lesson + one gcc-verified exercise, culminating in the
matmul performance ladder (naive → transpose-for-cache → tiled → Strassen). Every reference is independently
compiled on real gcc via [`scripts/verify-c-exercises.mjs`](../scripts/verify-c-exercises.mjs) before each
deploy. Binding constraints live in [`CLAUDE.md`](../CLAUDE.md); the method is
[`docs/pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md`](pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md)._

## Standing state (2026-07-11) — curriculum buildout complete
- **81 sessions, 13 ordered modules** (grouped by the `module` + `order` fields, ascending):
  1 · Values & Operators · 2 · Making Decisions · 3 · Loops · 4 · Functions & Recursion ·
  5 · Arrays · 6 · Text & Characters · 7 · Pointers & Memory · 8 · Structs & Enums ·
  9 · Reading Input (program mode) · 10 · Bit Manipulation · 11 · Data Structures in C ·
  12 · Matrices · 13 · The Matmul Ladder (capstone).
- **Teacher panel:** [`src/c/LessonPanel.tsx`](../src/c/LessonPanel.tsx) renders a rich `lesson` (intro →
  sections → worked example → why-it-matters → common mistakes → on-demand hint) as a RIGHT column in
  [`ExerciseView`](../src/c/ExerciseView.tsx) — sticky on desktop, stacked on top on mobile (<900px). Every
  session ships a lesson; the gate ([`src/c/__tests__/exercises.test.ts`](../src/c/__tests__/exercises.test.ts))
  fails any session missing a non-empty `lesson.intro`, and enforces a 50-session / 10-module floor.
- **Verification:** `pnpm verify:c` (node, no new deps; TypeScript strips the type-only import, `fetch` drives
  Wandbox). Assembles each exercise like [`runner.ts`](../src/c/exercises/runner.ts) (function mode:
  reference + harness; program mode: reference per case), POSTs to Wandbox with a pinned `gcc-*-c`, and asserts
  the exact normalized output. Run before every batch commit — **81/81 pass**.
- **Modes:** function-mode (write a named function; hidden harness calls it) for the early rungs; program-mode
  (full `main` + stdin/stdout cases) from Module 9 onward.
- **Next / open:** extend individual modules as desired (each new `*.cx.ts` is zero-wiring); optional recursive
  Strassen on block submatrices as a further stretch rung; an opt-in matmul visualizer (Slice 3, still open).

## What it is
A new `/c-programming` route: **write real C by hand, compile & run it in the browser**, with a
beginner→mastery **matrix-multiplication ladder** of verified exercises, plus a free scratch sandbox.
Motivation: get production-quality strong at matmul (and the C fundamentals under it).

## Locked decisions (the grill outcome)
1. **Real in-browser C compilation** — genuine C + compiler errors, no interpreter subset. Rides the
   **Pyodide precedent**: heavyweight toolchain lazy-loaded from a CDN on first use, cached after.
   **No backend, no external run-service, no user code leaves the device at runtime.** Exact toolchain
   TBD by Slice 0; footprint + dependency choice come back to the Director for approval before it's permanent.
2. **IDE-like UI** — code editor is the focus; a **console/output panel below** (compile + run + stdout +
   compiler errors); an **optional, toggled visualization panel** (off by default, so coding stays central).
3. **Exercise-led + free sandbox.** Structured ladder AND a blank pad. New exercises are **zero-wiring**
   (drop a `*.cx.ts`, it appears — mirrors `*.algo.ts`).
4. **Two harness modes** (`CExercise.mode`):
   - `function` (early rungs) — user writes a named function (e.g.
     `void matmul(int n,int m,int p,const double* A,const double* B,double* C)`); a hidden harness calls
     it, feeds test cases, checks the result, and injects the `step()` hook for the visualizer. Low
     boilerplate; uniform testing + viz.
   - `program` (later rungs) — user writes a full `main` reading stdin / printing stdout; output is
     diffed against expected. Teaches full-program C + I/O.
5. **Production-quality verification** — each exercise runs the user's C against **rigorous hidden test
   cases** (edge dims, non-square, row-major indexing, overflow) with a green "passed" gate. Same
   "independently verified, real exit codes" discipline as the rest of the repo.
6. **Ladder** — starts at **C fundamentals** (variables/loops → 1D arrays → functions → pointers → 2D
   arrays & row-major indexing), THEN naive matmul → loop-reorder/transpose-for-cache → tiled/blocked →
   stretch (Strassen / SIMD). ~20 rungs is fine. Ordered like [`src/curriculum.ts`](../src/curriculum.ts).

## Roadmap (disjoint, gate-able slices)
| # | Slice | Surface (disjoint) | Done when green |
|---|---|---|---|
| **0** | **Compile-engine spike** (blocks all) | `src/c/_spike/` (throwaway) | Real C compiles + runs + captures stdout **and** compiler errors in-browser; footprint + latency measured; exact toolchain pinned; **Director approves the dependency/footprint**. |
| 1 | Route + IDE shell (sandbox) | `c.html`, `src/c/` (main, IDE layout, console); reuse `src/playground/Editor` + Prism C mode | Type C → Run → see output/errors. Sandbox usable standalone. |
| 2 | Exercise model + zero-wiring registry + verifier | `src/c/exercises/`, `*.cx.ts`, runner + tests | Pick exercise → compile vs hidden cases (both modes) → per-case pass/fail + "passed" gate. |
| 3 | Opt-in matmul visualizer | `src/c/viz/` — `step()` hook → shared `<Player>` + a matrix-grid view (adapt existing linalg matmul view) | Toggle on → result grid fills cell-by-cell from the real C. |
| 4…N | Ladder content (~20 exercises) | one `*.cx.ts` per exercise (parallelizable) | Beginner→advanced, each with production-grade tests. |

Slice 0 gates everything; 1→2→3 sequential; content (4+) fans out once the model exists.

## Gate (unchanged from CLAUDE.md)
`pnpm typecheck` · `pnpm lint` · `pnpm test` (record counts) · `pnpm build` · `pnpm smoke`. The new
`/c-programming` route joins the smoke drive. Visible changes are UNVERIFIED-VISUAL until SEEN.

## Engine decision (2026-07-10) — hosted gcc via Wandbox ✅
Path taken after evaluating two client-side options and a hosted one:
- **Slice-0 spike proved client-side Wasmer clang works** (compiled + ran a matmul in-browser), BUT the
  runtime-smoke found a **worker-pool hang**: the Wasmer SDK wedges after ~3–5 compiles (leaked pooled
  `Instance` workers; `free()` helped identify but didn't fully resolve). Green-but-broken under real use.
- **Piston (hosted) was chosen to sidestep it — but the public API went whitelist-only on 2/15/2026** (401).
- **Wandbox (hosted, public, no signup) is the live engine.** Verified: 10 back-to-back compiles, **zero
  hangs**, all 5 reference solutions pass twice through; compile errors surface real gcc diagnostics; stdin
  works (program mode). ~1.5s per compile (network). Pinned compiler resolved from `list.json` (`gcc-*-c`).
- The engine sits behind `CCompiler` (`src/c/engine/index.ts` picks it) — swapping is a one-line change.
  `wasmerCompiler.ts` kept as the offline alternative (has the hang); `wandboxCompiler.ts` is active.
- **Trade-off accepted by Director:** needs network per run; code is sent to Wandbox's sandbox (fine for
  practice code). No cross-origin-isolation / COOP-COEP needed (it's a plain `fetch`).

## Open items
- Smoke coverage for `/c-programming` (drive the route in CI). Note: the smoke would hit Wandbox live —
  keep it a light DOM-mount check, not a full compile, to avoid a network dependency in CI.
- Author the rest of the ladder (cache-aware → tiled → stretch matmul; more fundamentals).
- Optional: a self-hosted Wandbox/Piston or a fixed client-side engine if Wandbox rate-limits become a problem.
