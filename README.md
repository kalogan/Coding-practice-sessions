# AlgoHarness

A **production-truthful preview harness** for learning algorithms visually — built to
prep for structured coding interviews while transitioning into software engineering.

Each algorithm is **real code** that emits a snapshot at every meaningful step
(grow the window, shrink the window, record a new best). The visualization only ever
draws those snapshots, so **what you see is exactly what the code does** — it can't
drift into a pretty lie. A gate test asserts every traced run returns the real,
known-correct answer.

## Two entries, one project

| URL | Entry | What it is |
|-----|-------|------------|
| `/` | `index.html` → `src/main.tsx` → `<App>` | Production learning view: pick an algorithm, play/step/scrub through it. |
| `/preview` | `preview.html` → `src/preview/main.tsx` → `<PreviewApp>` | Harness workbench: the **same** real components, plus knobs to edit the input and a raw-trace inspector. |

Both mount the **same** `Workbench` and the **same** algorithm registry — never a fork.

## Run it locally

```bash
pnpm install
pnpm dev            # http://localhost:5173/  and  /preview.html
```

## The gate (run before every commit)

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest — proves each trace returns the real answer
pnpm build          # tsc + vite build (emits dist/index.html + dist/preview.html)
pnpm smoke          # runtime smoke: serve dist on :4319, drive both screens, scan console
```

## Adding an algorithm (zero-wiring)

Drop a `*.algo.ts` file under `src/algorithms/**` that `export default` an
`AlgoDescriptor`. It appears in the picker automatically — no registration. Add its
known answer to `src/algorithms/__tests__/algorithms.test.ts` so the honesty gate
covers it.

## Deploy: Vercel (auto-deploy on push)

This repo is Vercel-ready. `vercel.json` builds both entries and rewrites
`/preview` → `/preview.html`, in **one** project.

**One-time link (needs your Vercel account — do this once):**

1. Go to [vercel.com/new](https://vercel.com/new) and **Import** this GitHub repo.
2. Framework preset: **Vite** (auto-detected). Leave build/output as-is — `vercel.json`
   already sets `pnpm run build` → `dist`.
3. Click **Deploy**.

After that, **every push auto-deploys**: pushes to your production branch publish to
the production URL; pushes to any other branch get their own preview URL. Your app is
at `/` and the workbench at `/preview` on the same domain.

> Linking the repo to Vercel is the one step that needs your login, so it's left to
> you. Everything else (build config, the `/preview` route, the two entries) is wired
> in the repo.
