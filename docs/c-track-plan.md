# C-Programming Track — Locked Design & Roadmap

_Status: design locked (grilled 2026-07-10). Slice 0 (compile-engine spike) PASSED — engine pending Director approval.
This is the resume-cold spec for the `/c-programming` feature. Binding constraints live in
[`CLAUDE.md`](../CLAUDE.md); the method is [`docs/pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md`](pipeline-starter/ARCHITECT_BUILDER_PIPELINE.md)._

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

## Slice 0 result (spike, 2026-07-10) — PASS ✅
Drove a throwaway prototype in the in-app browser; real Clang compiled + ran a hand-written matmul.
- **Engine:** `@wasmer/sdk@0.10.0` (real unmodified Clang) via ESM from `unpkg` — **zero npm deps** added.
- **Verified:** `crossOriginIsolated=true`; `clang example.c -o example.wasm` → `ok, exit 0`; produced wasm
  ran → stdout `58 64 / 139 154` (correct 2×3·3×2 product); clean stderr. A 2nd program (Σ1..100=5050) also correct.
- **Latency:** first-ever compile ~26–30s (toolchain streams + instantiates), **warm compile ~0.94s**. Same
  shape as Pyodide (big first load, fast after) → warm the toolchain on route entry with a loading state + cache.
- **Requirement found:** needs **cross-origin isolation** (COOP `same-origin` + COEP `credentialless`). Dev:
  `vite.config` `server.headers`. **Prod: must add these headers in `vercel.json` for `/c-programming`** (Slice 1).
- **Standing risk (Director call):** the ~30MB clang streams at runtime from **Wasmer's registry**, and the SDK
  is **pre-1.0** (pin `@0.10.0`). Fallback #2 = self-host binji/wasm-clang (~15–20MB gzip vendored, no external
  runtime dep, more wiring). **Awaiting approval: accept Wasmer-CDN engine, or switch to self-hosted binji?**

## Open items
- **Engine approval** (above) — blocks Slice 1.
- 5th Vite entry (`c.html`) + `vercel.json` rewrite `/c-programming` → `/c.html` **+ COOP/COEP headers** (Slice 1).
- Smoke coverage for the new route (Slice 1+).
