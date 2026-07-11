# <PROJECT> — Standing Contract (save this filled-in file as the repo's `CLAUDE.md`)

_Binding for every agent in this repo. Short on purpose — depth lives in
`ARCHITECT_BUILDER_PIPELINE.md` (the methodology) and `TASTE_AND_REVIEW.md` (the taste file).
Also create an `AGENTS.md` containing one line: "Read CLAUDE.md — it is the binding contract."_

## What this is
<One paragraph: what the product is, who it's for, the current phase.>

## Tech spine
- Stack: <langs/frameworks/build tool>
- Layers: <e.g. pure core in src/core (NO framework/DOM/GL imports — enforced by
  <dependency-cruiser/lint rule>); rendering in src/client; content in content/>
- Entry points: <dev server cmd + port · preview harness cmd · test cmd>

## The gate (the definition of "done" — run with real exit codes, each under a timeout)
```
timeout 300 <typecheck>        → exit 0
timeout 180 <lint + arch-guard>→ exit 0
timeout 180 <content lint>     → exit 0   (if content packs exist)
timeout 600 <tests>            → exit 0   (record the COUNTS every run)
timeout 300 <build>            → exit 0
```
**Release gate** (before anything ships): frozen-lockfile install → build → deploy → verify the
DEPLOYED artifact (asset Content-Type + visible build stamp matches the commit). CI runs the gate
on every push: `<.github/workflows/ci.yml>`.

## Non-negotiable constraints (gated, not hoped-for)
1. **Deterministic core to the UI boundary** — inject seeded RNG + clock; `Math.random()`/
   `Date.now()` in logic (components, AI, data rolls) is a bug.
2. **Content is data** — registries/config with schemas + a content lint; tuning numbers never
   hardcoded. Persisted shapes are schema-versioned with forward migrations + golden fixtures.
3. **Every system ships tests.** No system is done untested.
4. **Visible changes are SEEN before they ship** — UNVERIFIED-VISUAL blocks handoff/deploy.
   Art/look changes land as versioned variants behind the lab/preview; the human promotes.
5. **Builders never add/remove dependencies** — request them; the Architect installs with
   lockfile sync.
6. **Targeted git adds only** (each specific file); no destructive git; commit model named per
   slice (builder-commits / architect-commits / worktree+branch — see pipeline §6b).
7. **Accessibility + mobile/responsive are standing constraints** on every UI slice (WCAG AA,
   keyboard, contrast, 44px targets, reflow at 320px), gated by <a11y lint/scan>.
8. <Project-specific rule — e.g. "server-authoritative; clients optimistic-cosmetic">
9. <Project-specific rule>

## Environment quirks (things that WILL bite an agent that doesn't know)
- <e.g. platform GPU/WebGL context caps; workspace/monorepo quirks; ports already in use;
  which processes must never be killed; OS line-ending phantom-dirt; auth peculiarities>

## Safety boundaries (never unattended)
Destructive git · deploys to <prod env> · real messages/emails/spend · dependency changes ·
auth/secrets/access changes · <project-specific stop-and-ask items>.

## Commands
- dev: `<cmd>` (port <N>) · test: `<cmd>` · gate: `<cmd or script>` · deploy: `<cmd>`
- preview harness: `<cmd>` · labs/galleries: `<route>`

## Standing state (keep current — a fresh agent resumes from here)
- Done: <...>  · In flight: <...>  · Next: <...>
- OPEN FORKS awaiting the human: <list — re-surface these every report until answered>
