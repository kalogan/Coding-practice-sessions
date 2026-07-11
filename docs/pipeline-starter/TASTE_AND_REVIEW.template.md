# <PROJECT> — Taste & Review (save filled-in as `TASTE_AND_REVIEW.md`)

_The human's taste, made machine-readable — so it arrives as a CONSTRAINT before the build
instead of a rejection after. The agent reads this before any visual/feel slice and maintains
the queue sections. Companion to `CLAUDE.md` and pipeline §5b-ii/§7._

## 1. Art bible (fill BEFORE any visual work — adjectives alone are not a spec)

- **The vibe, one line:** <e.g. "warm hand-made picture-book, bright and slightly goofy">
- **Reference images** (files in `docs/refs/` or links) — one per surface minimum:
  - <surface: e.g. characters> → `refs/<img>` — what to take from it: <silhouette? palette? line?>
  - <surface: environment/UI/type> → `refs/<img>` — <...>
- **Anti-references ("NOT this")**: <img/desc> — why: <e.g. "too neon", "too realistic">
- **Palette:** <hexes or a swatch image> · **Type:** <faces/weights> · **Motion feel:** <e.g.
  "snappy in, soft settle; hitstop on impact; honor reduced-motion">
- **The signature moment** (the thing that must land): <e.g. "the clash cut-in", "the reveal">

## 2. Domain verification checklists (pipeline §5b-ii — each box checked by OBSERVATION)

### DOMAIN: <e.g. UI change>
- [ ] The changed control WORKS when driven (clicked/tapped), not just compiled
- [ ] Neighbors unharmed (nothing covered/wedged/reflowed wrong)
- [ ] Real viewport(s): <e.g. 390×844 portrait + desktop> · keyboard path works
- [ ] <property the human actually cares about for this surface>

### DOMAIN: <e.g. generated art / 3D asset / data-viz scene>
- [ ] <the property that MATTERS, not just the easy-to-render one — e.g. "limbs move the
      correct direction", "chart axes match the data", "asset reads at target size">
- [ ] <completeness — all expected states/frames/variants present>
- [ ] Matches the art bible (vibe line + reference, not vibes-from-memory)

## 3. Review queue (agent-maintained: taste items awaiting the human — DRIVABLE, not prose)

| # | Item | Where to drive it (lab/route/preview) | Versions to compare | Status |
|---|---|---|---|---|
| 1 | <e.g. tile restyle v2 vs v1> | <lab route> | v1 / v2 | awaiting human |

_Rule: art lands as a NEW VERSION in a lab/gallery next to the current look; the human promotes
with a one-line flip. Nothing visual goes live unreviewed._

## 4. Open forks (agent-maintained: decisions awaiting the human — resurface EVERY report)

| # | Fork | Options (with consequence) | Default if unanswered | Answer |
|---|---|---|---|---|
| 1 | <question> | A: <…> / B: <…> | <what the agent will do> | — |

## 5. Feel gates (scheduled human playtests — the highest-value minutes the human spends)

| Gate | When it's ready | What only the human can judge | Verdict |
|---|---|---|---|
| <e.g. S0 look> | <slice> | <"does it have character?"> | — |
| <e.g. first playable> | <slice> | <"does the loop click?"> | — |

_Feedback format: BLOCKER / worse / better / love-it — plus verdicts on any open forks above._
