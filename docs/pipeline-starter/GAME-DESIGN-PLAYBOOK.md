# Game Design Playbook

_The design companion to **game-kit**. Where game-kit is the reusable **code** framework, this is the
reusable **design process** — how we take a new game from a spark to a builder-ready plan, in depth, every
time. Authored 2026-07-06, distilled from the FOUNDRY + BANNERFALL grill. Worked examples live in
`docs/games/`._

> **Use this whenever you start a new game.** Copy the templates in §5, run the process in §3, and you'll
> end with a Master Plan + a Build Roadmap a Builder can execute without you in the room.

---

## 1. Why this exists

Good games here are not one-shot ideas — they're **data-driven content engines** that recombine authored
packs into a loop (the house style). That only works if the *design* is nailed before code: the systems,
the content schemas, the kit modules, and the build order. This playbook makes that scaffolding **repeatable
and thorough**, so we never hand a Builder a vibe — we hand them decisions.

## 2. The design values (the house fingerprint)

Every game we make should honor these unless we deliberately break one:

1. **Author content as DATA, not code.** New content = a data pack, not a code change. (Lexicon relics,
   Wayfinders biome packs, BANNERFALL theme packs.)
2. **Author once, recombine forever.** The same packs feed authored *and* procedural content.
3. **Pipeline-vehicle thinking.** Ask: *what kit gap does this game harden?* Often the game is a **harness**
   for a pipeline that's the real deliverable. (FOUNDRY = 3D creature pipeline; BANNERFALL = 2D sprite
   pipeline.) Judge success by the reusable pipeline, not just the shipped game.
4. **Discovery is a reward.** Charting, codex-gating, a filling bestiary — surface the "new."
5. **Pure fantasy, no dilution.** One coherent fantasy. (The Gyre "classroom" bolt-on is the cautionary
   tale.)
6. **Deep systems from simple parts.** Legible rules, emergent depth (the Lexicon / Into-the-Breach feel).
7. **The hook is REMIX + VIBE + FEEL — not novelty.** Players don't need a never-seen mechanic; they're
   drawn to a *sharp remix* of familiar parts + a *cohesive vibe* + *great moment-to-moment feel*. ("Balatro
   but words" = Lexicon; Vampire Survivors / Hades / Stardew all won this way.) Corollary and **hard rule**:
   **feel + vibe are a first-class workstream budgeted from S0, never deferred to end-of-project polish** —
   they are the product, and the #1 way a pipeline-vehicle game dies is the tech eating the feel budget. Give
   feel its own **"feel gate"** on the relevant slices (does casting/attacking/the-vignette actually feel
   good?), alongside the functional gate. Every master plan gets a **"Hook — Remix, Vibe & Feel"** section.

## 3. The process (five phases)

**Phase 0 — Premise & Purpose.** One paragraph of fantasy + one sentence of *kit purpose* (what gap it
hardens / what pipeline it builds). If you can't name the kit purpose, question whether to build it.

**Phase 1 — The Grill.** The Architect interrogates the Director in **disjoint rounds** until every
load-bearing fork is decided. Ground deep grilling in reality first (audit the relevant kit/pipeline before
asking how to improve it — see FOUNDRY's art audit). Rules of a good grill in §4. Output: a **decision log**
(every fork → decision → why).

**Phase 2 — Master Plan.** Turn the decisions into the design doc (template §5.1). Premise, pillars, the
*real deliverable*, core loop, a **systems → kit-module map**, **content-pack schemas**, milestone slices,
risks, and the decision log. This is the "why + what."

**Phase 3 — Build Roadmap.** Enumerate **everything that must be built** across the full build surface
(§6), decompose into **slices with verify gates**, set **content targets**, and flag open decisions. This is
the "how + in what order." (template §5.2)

**Phase 4 — Offload to Builders.** Slices are disjoint and independently verifiable, so a Builder (human,
session, or agent) can take one cold. Parallel tracks where files/modules are disjoint; sequence kit merges.

## 4. How to grill well

- **Fork into crisp decisions.** Turn fuzzy vision into a small set of concrete, mutually-exclusive options.
- **Recommend, don't dictate.** Offer an Architect rec + the trade-offs; the Director decides. Always leave
  an escape hatch for "none of these — here's what I actually mean."
- **Capture the WHY.** A decision without its reason rots. Log it.
- **Disjoint rounds.** Round 1 = foundations (scope, platform, core genre/ruleset spine). Later rounds go
  deeper (structure, progression, combat depth, content scale, onboarding). Don't ask a detail you can't use
  yet.
- **Ground before you drill.** If the game hinges on a pipeline/system, AUDIT the current state first
  (honest diagnosis) so the grill is about reality, not vibes.
- **Watch for the reframe.** The Director's answer often reveals the *real* goal (e.g. "I want to build out
  3D procgen" reframed FOUNDRY from "an action-RPG" to "a character-pipeline vehicle"). Follow it.
- **Name the fingerprint.** Tie decisions back to §2 so the game stays coherent with the house style.

## 5. Templates (copy these)

### 5.1 Master Plan template
```
# <CODENAME> — master plan (Game <X>)
1. Premise & tone (pure fantasy; one paragraph + tone line + guardrail)
2. Pillars (3–5; each a sentence)
3. THE REAL DELIVERABLE (the pipeline/kit gap this game exists to build; diagnosis + target + levers)
4. Core loop (a small diagram + the discovery hooks + progression)
5. Systems → kit-module map (table: system | kit module | build/harden)
6. Content-pack schemas (each authored content type as a data shape — the author-once-recombine model)
7. Milestone slices (S0..Sn; each ends on a VERIFY GATE)
8. Risks & open questions
9. Decision log (fork | decision | why)
```

### 5.2 Build Roadmap template
```
# <CODENAME> — build roadmap
0. Snapshot (scope, platform/input, target content counts, key decisions — 1 screen)
1. Build surface (walk §6 A–F: for each layer → reuse / spec / build, + a one-line plan)
2. Kit work (new modules to build + existing to harden, with MATURITY targets)
3. Content targets (concrete counts per pack type; note ALL authored THROUGH the pipeline)
3.5 **Feel & Vibe workstream** (REQUIRED) — the remix + vibe + feel north star (pull from the master plan's
    "Hook — Remix, Vibe & Feel" section) + which slices carry **feel gates**. This is a first-class,
    S0-budgeted workstream, not the polish tail.
4. Slice plan (ordered S0..Sn; each: goal, tasks, dependencies, VERIFY GATE — feel-carrying slices ALSO get a FEEL GATE)
5. Dependencies & sequencing (what unblocks what; the pipeline-first ordering)
6. Open decisions (still-unresolved forks, with a recommended default)
7. Risks & mitigations
```

### 5.3 Decision-log row
`| <round/id> | <fork> | <decision> | <why> |`

## 6. The build surface (the everything-checklist)

Walk this for every game so nothing is forgotten. Tag each: **[reuse]** kit/prior pattern, **[spec]**
Architect default, **[GRILL]** needs the Director.

**A — Shell & meta:** studio ident · splash/title + wordmark · main menu / mode select · settings
(audio/controls/accessibility/save-mgmt) · save/load persistence · meta progression + codex/unlocks · audio
(music + SFX packs).
**B — Onboarding:** first-time UX / tutorial flow.
**C — Core systems:** ruleset engine · core loop / session shape · level/zone/map + campaign structure ·
character/creature/unit design + the pipeline · progression (leveling/gear/roster) · economy · AI.
**D — Content:** content catalog + target counts (all pack types) · lore/naming/bestiary text.
**E — Production:** the asset pipeline itself (usually the real deliverable) · build/deploy · content-
authoring + tuning tooling.
**F — Polish:** finish / accessibility — the *end-of-project finish pass*: accessibility, transitions cleanup,
final FX tuning, difficulty sign-off. (This is NOT the feel workstream — see G.)
**G — Feel & Vibe (CONTINUOUS, from S0):** the **remix statement** (the 10-sec "X but Y" hook) · the
**vibe/mood target** (one coherent world-feel) · the **moment-to-moment feel** list (juice/tactility ·
audio/SFX · hitstop/impact · escalation/power-spike · the **signature-moment payoff** — the reveal, the crit,
the vignette punch). This is the **core dopamine** and it runs the *whole* build, not the tail. **G is not F:**
F is finish + accessibility (done last); **G is the product** and is budgeted from S0 with its own **feel gate**
on every feel-carrying slice. The #1 way a pipeline-vehicle game dies is the tech eating the feel budget — G is
the mitigation, made structural.

## 7. Slices & verify gates

- A **slice** is the smallest chunk that produces a **verifiable** result. Every slice ends on a gate: a
  concrete, observable check ("12 creatures read as distinct species"; "swapping a data pack changes the
  game with no code edits"; "typecheck + tests + build green").
- **Pipeline-first ordering.** When the game is a pipeline vehicle, the pipeline's spike slices come FIRST —
  content is authored *through* the pipeline, so it can't precede it.
- Slices should be **disjoint** enough to hand to different Builders.
- **Feel is budgeted from S0 — every game.** Feel + vibe (build-surface group **G**) are a first-class
  workstream that runs the whole build, never deferred to an end-of-project polish slice. Feel-carrying slices
  (combat, casting, the vignette, the reveal/payoff, the kill/juice moments) get a dedicated **"feel gate"**
  ALONGSIDE the functional gate: a subjective-but-honest check — *does casting / attacking / the vignette / the
  payoff actually feel GOOD?* The functional gate asks "does it work"; the feel gate asks "does it land." A
  game plan with **no feel gate on any slice is not builder-ready** — send it back until feel is budgeted.

## 8. Worked examples

- `docs/games/PORTFOLIO-KIT-PLAN.md` — the two-game portfolio + kit map.
- `docs/games/game-a-magitech/MASTER-PLAN.md` — FOUNDRY (3D creature-pipeline vehicle). Full decision log.
- `docs/games/game-b-tactics/MASTER-PLAN.md` — BANNERFALL (2D sprite-pipeline vehicle). Full decision log.
- Their `BUILD-ROADMAP.md` siblings — the Phase-3 output.
- `docs/games/game-b-tactics/BUILD-AUDIT.md` — the CARAPACE plan-vs-built audit + incident post-mortem
  that produced §9.

## 9. Execution rules (the Builder-era discipline)

_Distilled from the CARAPACE one-day parallel-agent build (2026-07-06; evidence in its BUILD-AUDIT.md).
These govern Phase 4 — HOW builders execute — the way §2–§7 govern design. Every incident that day traced
to one root: **builders (agents) cannot see pixels or play the game**; typecheck/tests/build were green
through every failure. These rules are the structural mitigations._

1. **Kit-candidate convention.** Pipeline code destined for the kit lives behind an enforced boundary
   from day one (e.g. `src/kit/` with a lint/test rule: zero imports from game modules). Promotion
   becomes a file move, not a port. Content couples to the pipeline via data packs only.
2. **Promotion is a scheduled slice.** The kit merge is the real deliverable of a pipeline-vehicle game —
   give it a slice with a verify gate (module lands per the MATURITY gates, in the planned merge order).
   A build that ends with the pipeline still inside the game did not finish.
3. **Art never ships live unreviewed.** Any player-visible art change lands as a NEW VERSION in a
   versioned registry, previewed in a lab (Sprite/Tile/Prop/Bake-lab pattern) side-by-side with the
   current look. The Director promotes to live — one-line flip — never the builder. (Born from the
   CARAPACE tiles-v2 miss.)
4. **Render-path changes get a human eyeball before deploy.** Builders must not claim visual
   verification they didn't perform; "compiles + serves" is not "renders correctly." Stamp a build
   hash/date visibly in the UI so a playtest is never ambiguous about what it's testing (and warn the
   Director to hard-reload after audio/art/module-singleton changes — HMR lies).
5. **Pre-deploy gate = frozen-lockfile install + build** (a script or CI). Builders never add
   dependencies; the parent/owner does, with lockfile sync, and on-demand dev tools (e.g. a headless
   browser for baking) are installed on demand — not committed.
6. **Balance-sim before content.** A pure deterministic ruleset makes an auto-playtest harness cheap
   (greedy bots both sides, seeded). Build it early; every content slice gates on win-rate/turn-count
   bands. A Director discovering an overtuned mission-1 by dying is a process failure, not a tuning note.
7. **Director playtests are scheduled AT the feel gates,** not after the build. Gates a builder can't
   verify (phone-in-hand feel, mobile ergonomics S3-style, the vignette punch) block until the Director
   plays. Deploy to a real URL by the second slice so phone playtests cost nothing.
8. **Standing constraints live in the game's CLAUDE.md from scaffold time:** platform budgets (mobile
   WebGL context caps, bundle limits, THREE-off-the-player-path policy), the art direction one-liner,
   deploy commands, dev-server quirks. If a constraint isn't written where a builder will read it, it
   does not exist.
9. **Two-way kit flow.** The vendor sync is crucible→game; without a return path, fixes and pipelines
   strand in games and drift (gyre). Maintain a reverse-promotion mechanism (script or a PROMOTIONS.md
   queue in crucible) with one kit-merge owner doing sequential merges.
10. **Plans must be visible to builders.** Design docs merged/readable from the branch builders build on;
    a roadmap the builder can't read is a roadmap that won't be followed.

**Keep doing (proven that same day):** lock decisions before building · keep the ruleset core pure +
deterministic + seeded · file-disjoint briefs with explicit READ-FIRST and OWN/DON'T-TOUCH lists ·
parent-run verify gates on the combined tree · labs as the Director's review surface · deploy early.

_Rules 11–14 added same day from the six-game studio audit (`docs/STUDIO-GAME-AUDIT.md`):_

11. **Determinism extends to the UI boundary.** The seed is created at run-init and threaded down;
    `Math.random()`/`Date.now()` in a component, AI tick, or loot roll is a bug even when the core is
    pure — it kills replay-as-resim and the headless balance sim. (Lexicon's ChallengeScreen;
    storm-break's AI; corrupted-void's loot.)
12. **Content is schema-versioned with migration fixtures.** Every registry entry / save shape carries a
    `schemaVersion`; shape changes ship a golden-corpus fixture (v1→vN) + a forward migration, so old
    saves upgrade instead of breaking silently. (project-mmo's creature fixtures are the model.)
13. **Content maturity is data, not prose.** Packs carry a `graduated` flag; the content lint blocks
    wiring un-graduated packs into live spawning/content. Built-but-unreviewed content must be
    unshippable by construction. (project-mmo's 10 un-graduated biomes live only in prose today.)
14. **The scaffold ships the contract — and the method.** A new game starts with a filled-in CLAUDE.md
    (current state · non-negotiable constraints · shared-file footguns · tech spine · commands ·
    deploy) + `STATUS.md` + `TASTE_AND_REVIEW.md` + the content template (registries dir, Zod schemas,
    content-lint, a game-layer integration test) + a **`docs/` folder carrying verbatim snapshots of
    the method docs** (pipeline/harness/playbook — the repo works standalone, no studio checkout
    needed) + a **README whose "if you are an AI agent" section gives the read-first order** — never
    an empty repo. (project-mmo's CLAUDE.md is the template; 4 of 6 audited games had none.)

---

_This playbook is itself author-once-recombine: improve it after each game so the next scaffold is sharper._
