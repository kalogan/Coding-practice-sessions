# The Studio Game Layer — games grow a shared kit (read if this repo is a STUDIO GAME)

The rest of this pack (`ARCHITECT_BUILDER_PIPELINE`, `PREVIEW_HARNESS`, `GAME-DESIGN-PLAYBOOK`, the
contract/taste/status templates) is the **portable** method — it works for any project, studio or not.

**This doc is the extra layer for a game that lives in a portfolio built on a shared kit.** If this
repo is a standalone work project, skip it. If it's one game among many that all vendor a common
engine toolkit, this is the part the portable pack doesn't cover: *the game is the harness; the
reusable kit is the real deliverable.*

---

## 1 · The north star: the kit is the product, games earn its quality

Three layers that feed each other:
1. **The shared kit** — a genre-agnostic engine toolkit (seeded RNG, HUD, title flow, audio, save,
   sprite/render pipelines, domain sub-kits, …), vendored into each game. The compounding asset.
2. **The games** — real, shipped games in their own repos, each vendoring a copy of the kit. Building
   a real game is how kit modules get *proven*.
3. **(Optional) a hub** that catalogs the games.

Every game **uses** the kit and **sharpens** it. A game that only consumes is half a game.

## 2 · The kit-candidate boundary (makes promotion a file-move)

Kit-destined code lives in **`src/kit/**`** and **may not import from the rest of `src/`**, enforced
by a boundary test (`src/kit/boundary.test.ts`). Keep the pure core THREE/DOM-free; keep engine/view
code in a separate adapter file. Because the boundary holds, promoting a module to the shared kit is
a **file-move**, not a rewrite. This is the single most important structural habit.

## 3 · INBOUND — reuse first (a new game is mostly ASSEMBLY)

Before writing anything, **audit what already exists** — the kit and the sibling game repos. Most of
what a new game needs is already built; the first session's job is largely to wire it together. **Two
standing catalogs answer "who already solved this?" — consult BOTH before hand-rolling anything:**

- **The kit catalog** — `game-kit`'s `MATURITY.md` ("can I build on this module yet?"). If the kit
  does it, **vendor it**, don't hand-roll.
- **The cross-game catalog** — the studio's `CROSS-GAME-REUSE.md` (a by-domain map: "need tactics? →
  that game; need a scoring engine? → that game"). If the kit lacks it, a sibling game very likely
  solved something adjacent — **read that game's real source** (it's on this machine under
  `web-projects/<game>/`) and port the pattern.
- **Then write a `REUSE-INDEX.md`** in the new repo: a *source-verified* map (real paths + exact
  exports) of what to **vendor** (kit modules) vs **port** (game-side code from a sibling). Verify by
  opening the source — an unverified paraphrase sends agents chasing ghosts.

**Reinventing what already exists is the #1 failure mode.** If you're writing a sprite pipeline, a
save system, or a seeded RNG from scratch, stop and check the kit first.

## 4 · OUTBOUND — contribute back (the whole point)

Two directions; tell them apart:

- **Adopt** — you reinvented something the kit already has (progression, audio, input, …). That's a
  bug to fix, not a promotion: delete the fork, consume the kit module. Adopting also makes the game a
  *second consumer*, which pushes that module up the maturity ladder.
- **Promote** — you built something genuinely new with no kit equivalent. Extract it to the kit **on
  the 2nd consumer, not speculatively** (the G1 gate). One-consumer novelty **stays game-side** with a
  note flagging it as a *future* extraction (e.g. a genre sub-kit when a 2nd game wants it).

**Promotion cycle:** prove in the game → (boundary already keeps it a file-move) → move to the kit's
`src/<module>` (pure core + optional view) → test → grade in `MATURITY.md` against the quality gates →
promotion branch → owner merges → **re-vendor** into consumers (or they drift). Promotion is always
**owner-gated**, never automatic.

**Track contribution as a first-class output:** each slice notes which `src/kit` module it hardened,
and `STATUS.md` carries a "kit-contribution candidates" list — so the harvest is obvious when the game
ships. A game hardening the kit's *first* module of some kind (e.g. a combat paradigm the kit lacks) is
doing the most valuable possible work.

## 5 · When a game PAUSES — postmortem + harvest (don't let it rot)

Paused games are where kit value gets forgotten. Two artifacts recover it:
- **`POSTMORTEM.md`** — an honest scorecard: what shipped vs the roadmap, why the output missed the
  picture, what genuinely went well, and the calibration lessons (below). Written plainly, no spin.
- **A harvest assessment** — an overlap pass against the kit source-of-truth identifying what the game
  built that the kit genuinely lacks, ranked (promote / reconcile / leave), with a **HOLD-until-a-
  consumer** decision when there's no active game to prove the API. The paused code is safe in git; the
  assessment is the map; a future game adopting it is the trigger that finally promotes it. (This
  closes the loop: a *later* game building on a paused game's prototype becomes its G1 consumer.)

## 6 · Calibration lessons (hard-won — worth internalizing before you start)

- **Depth over breadth, in order.** Building systems ahead of a consumer produces enormous "green"
  and very little playable game. Keep the playable loop central; deepen it before adding standalone
  systems. Prove the *thesis* (the signature mechanic) before polishing the periphery.
- **Inspiration, not a rip.** If a beloved existing work is your reference, take its **system and
  structure** and wrap **your own** setting/characters/art. Procedural generation is great at original
  variety and **structurally cannot** reproduce a specific hand-authored IP asset — chasing that
  fidelity is the wrong tool and a copyright wall. (The creatures read fine; the "make it look exactly
  like X" hero reads janky — because your brain holds the reference.)
- **Reference extraction is STUDY-ONLY.** Extracting from an existing work (ROM/asset rips) to study
  timing, palettes, proportions, and *feel* is fine and useful — then **author your own**.
  **Measurements are facts** (safe to keep); **ripped assets are never shipped or committed** —
  gitignore the raw dir. Note the platform split (a 3D-console extractor ≠ a 2D-handheld one).
- **Feel is budgeted from S0.** The signature feel (the hit, the combo, the core-mechanic moment)
  carries the game — schedule a feel gate on every feel-carrying slice; a plan without one isn't
  builder-ready. Fix the taste loop early (a reliable way to *see* the running thing in seconds), or
  "this doesn't look/feel right" surfaces too late.
- **The harness is not the point.** The kit is the deliverable; don't sink the budget polishing a
  vanity target in the harness while the reusable core goes unproven.

## 7 · The doc set that makes a game repo self-explaining

A new game repo carries, at scaffold time: `CLAUDE.md` (contract), `STATUS.md` (cold-resume),
`TASTE_AND_REVIEW.md` (art bible + feel gates), a **`docs/AGENT_ONBOARDING.md`** (the single
start-here — fill `AGENT_ONBOARDING.template.md`), a `REUSE-INDEX.md` (§3), a `README.md` with the
"if you are an AI agent, read in this order" section, and **verbatim snapshots of the method docs**
(this pack) so the repo is method-self-contained. Remote + CI + deploy are owner-gated landing steps.

---

_For the full owner/hub-specific lifecycle (registering a game as a catalogued creation, the
maturity/quality-bar gate text, the exact vendor script), see the studio's `GROWING-CRUCIBLE.md` — this
doc is the portable distillation of it._
