import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Monte Carlo control (first-visit, epsilon-greedy) on a 4x4 gridworld.
// Scenario: the SAME setup as Q-learning and SARSA — a game NPC starts top-left
// and must learn to reach the goal bottom-right while dodging a hazard, told
// nothing in advance. The defining difference from the TD methods is that Monte
// Carlo waits for the WHOLE episode to finish before learning anything. It plays
// a full game to termination, then walks the episode BACKWARDS computing the
// return G (the discounted sum of rewards from each step to the end) and updates
// Q[s][a] toward the AVERAGE return seen for the FIRST visit of each (s, a).
// No bootstrapping — the target is the real, observed outcome, not an estimate.

const SIZE = 4;
const N = SIZE * SIZE; // 16 states
const START = 0; // (0,0)
const GOAL = 15; // (3,3)
const HAZARD = 6; // (1,2)  -> row 1, col 2 -> 1*4 + 2

// Actions: 0=up, 1=down, 2=left, 3=right.
const ARROWS = ['↑', '↓', '←', '→'];
const DR = [-1, 1, 0, 0];
const DC = [0, 0, -1, 1];

const rc = (s: number): [number, number] => [Math.floor(s / SIZE), s % SIZE];
const idx = (r: number, c: number) => r * SIZE + c;

// Deterministic step: move within bounds, otherwise stay put (wall).
function stepEnv(s: number, a: number): number {
  const [r, c] = rc(s);
  const nr = r + DR[a];
  const nc = c + DC[a];
  if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return s; // wall -> stay
  return idx(nr, nc);
}

function reward(s: number): number {
  if (s === GOAL) return 1;
  if (s === HAZARD) return -1;
  return -0.04; // living penalty so shorter paths win
}

const isTerminal = (s: number) => s === GOAL || s === HAZARD;

function run(input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Seeded LCG — deterministic, no Math.random / Date.
  let seed = (input.params?.seed ?? 17) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const EPISODES = input.params?.episodes ?? 40;
  const GAMMA = 0.9;
  const EPS_START = 0.3;
  const EPS_END = 0.02;

  // Q[state][action], all zero to start (the bot knows nothing).
  const Q: number[][] = Array.from({ length: N }, () => [0, 0, 0, 0]);
  // Running count of first-visit returns seen per (s, a) — so we can average
  // incrementally: Q += (G - Q) / count is exactly the sample mean.
  const counts: number[][] = Array.from({ length: N }, () => [0, 0, 0, 0]);

  const bestAction = (s: number): number => {
    let best = 0;
    for (let a = 1; a < 4; a++) if (Q[s][a] > Q[s][best]) best = a;
    return best;
  };
  const maxQ = (s: number): number => Math.max(Q[s][0], Q[s][1], Q[s][2], Q[s][3]);

  // Epsilon-greedy action selection — the behaviour policy that generates the
  // episode. Explore with prob epsilon, else take the current greedy best.
  const chooseAction = (s: number, epsilon: number): number =>
    rand() < epsilon ? Math.floor(rand() * 4) : bestAction(s);

  // Render the current greedy policy as a grid. Each cell shows round(maxQ,1)
  // and an arrow for its best action; goal/hazard carry their roles; an
  // optional `agent` state is drawn 'active'.
  const renderPolicy = (agent?: number): Cell[][] => {
    const rows: Cell[][] = [];
    for (let r = 0; r < SIZE; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < SIZE; c++) {
        const s = idx(r, c);
        if (s === GOAL) {
          row.push({ value: 'G', role: agent === s ? 'active' : 'goal' });
        } else if (s === HAZARD) {
          row.push({ value: 'H', role: agent === s ? 'active' : 'hazard' });
        } else {
          const v = Math.round(maxQ(s) * 10) / 10;
          row.push({
            value: v,
            role: agent === s ? 'active' : 'plain',
            arrow: ARROWS[bestAction(s)],
          });
        }
      }
      rows.push(row);
    }
    return rows;
  };

  // --- Training: play a whole episode, THEN learn from it backwards. ---
  for (let ep = 0; ep < EPISODES; ep++) {
    // Linear epsilon decay across episodes.
    const epsilon =
      EPISODES > 1
        ? EPS_START + (EPS_END - EPS_START) * (ep / (EPISODES - 1))
        : EPS_END;

    // 1) GENERATE a full episode to termination, recording (s, a, r) per step.
    const episode: Array<{ s: number; a: number; r: number }> = [];
    let s = START;
    let steps = 0;
    let outcome = 'capped';
    const MAX_STEPS = 100;
    while (steps < MAX_STEPS) {
      const a = chooseAction(s, epsilon);
      const s2 = stepEnv(s, a);
      const r = reward(s2);
      episode.push({ s, a, r });
      s = s2;
      steps++;
      if (isTerminal(s2)) {
        outcome = s2 === GOAL ? 'reached goal' : 'hit hazard';
        break;
      }
    }

    // 2) Walk the episode BACKWARDS accumulating the return G, and update Q
    //    toward the average return for the FIRST visit of each (s, a).
    //    Pre-mark which index is the first visit of each (s, a) by scanning
    //    forward, so only the earliest occurrence is used (first-visit).
    const firstAt = new Set<number>();
    const firstSeen = new Set<number>();
    for (let i = 0; i < episode.length; i++) {
      const key = episode[i].s * 4 + episode[i].a;
      if (!firstSeen.has(key)) {
        firstSeen.add(key);
        firstAt.add(i);
      }
    }
    let G = 0;
    for (let i = episode.length - 1; i >= 0; i--) {
      const { s: es, a: ea, r } = episode[i];
      G = r + GAMMA * G; // discounted return from step i to the end
      if (firstAt.has(i)) {
        // First-visit: average this real return into Q (no bootstrapping).
        counts[es][ea] += 1;
        Q[es][ea] += (G - Q[es][ea]) / counts[es][ea];
      }
    }

    // ONE digestible step per episode: the current greedy policy.
    t.step({
      view: { kind: 'grid', rows: renderPolicy() },
      state: [
        { label: 'phase', value: 'train' },
        { label: 'episode', value: ep + 1, highlight: true },
        { label: 'epsilon', value: Math.round(epsilon * 100) / 100 },
        { label: 'outcome', value: outcome },
        { label: 'steps', value: steps },
      ],
      note: `Episode ${ep + 1}/${EPISODES} (ε=${(Math.round(epsilon * 100) / 100).toFixed(
        2,
      )}): bot played a WHOLE game and ${outcome} in ${steps} steps, then walked it backwards averaging the real return into each first-visited (state, action). No bootstrapping — arrows show the greedy policy learned so far (each cell's number is its best Q-value).`,
    });
  }

  // --- Final phase: follow the greedy policy from start to goal. ---
  let s = START;
  let walkSteps = 0;
  const CAP = 30;

  t.step({
    view: { kind: 'grid', rows: renderPolicy(s) },
    state: [
      { label: 'phase', value: 'rollout' },
      { label: 'step', value: walkSteps },
      { label: 'cell', value: `(${rc(s)[0]},${rc(s)[1]})` },
    ],
    note: `Training done. Now the trained bot walks greedily from the start (0,0), following the arrows.`,
  });

  while (s !== GOAL && walkSteps < CAP) {
    const a = bestAction(s);
    s = stepEnv(s, a);
    walkSteps++;
    t.step({
      view: { kind: 'grid', rows: renderPolicy(s) },
      state: [
        { label: 'phase', value: 'rollout' },
        { label: 'step', value: walkSteps, highlight: true },
        { label: 'action', value: ARROWS[a] },
        { label: 'cell', value: `(${rc(s)[0]},${rc(s)[1]})` },
      ],
      note:
        s === GOAL
          ? `Move ${walkSteps}: ${ARROWS[a]} into the goal! Reached in ${walkSteps} steps.`
          : `Move ${walkSteps}: ${ARROWS[a]} to (${rc(s)[0]},${rc(s)[1]}).`,
    });
  }

  return { steps: t.steps, answer: walkSteps };
}

const descriptor: AlgoDescriptor = {
  id: 'monte-carlo-control',
  title: 'Monte Carlo control',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  complexity: 'O(episodes × steps)',
  scenario:
    'The same 4x4 gridworld as Q-learning and SARSA: a game NPC starts top-left and must reach the goal bottom-right (+1) while dodging a hazard tile (-1), with a -0.04 cost per step and no knowledge of the rules. Monte Carlo control learns differently from the TD methods — it plays a WHOLE episode to the end first, then replays it backwards computing the real return from each move and averages that into the Q-table. Over ~40 epsilon-greedy episodes the averages settle, and the greedy policy walks the optimal 6-step route around the hazard.',
  pattern:
    'Monte Carlo control (model-free, first-visit, epsilon-greedy, tabular). Per episode: (1) GENERATE a full trajectory to termination under the epsilon-greedy behaviour policy, recording (state, action, reward) at each step. (2) Walk it BACKWARDS accumulating the return G = r + γ·G. (3) For the FIRST visit of each (state, action) in that episode, average the observed return into Q via the incremental mean Q[s][a] += (G − Q[s][a]) / count. The target is the real sampled return — never another estimate — so MC is unbiased but high-variance, and it can only learn from episodes that TERMINATE. Epsilon-greedy with decay keeps exploration alive so every (state, action) is eventually sampled. Contrast with TD (Q-learning/SARSA), which bootstraps off Q[s′] after every single step.',
  defaultInput: { params: { seed: 17, episodes: 40 } },
  expected: 6,
  run,
  code: `function monteCarloControl() {
  const N = 16, START = 0, GOAL = 15, HAZARD = 6;
  const ARROWS = ['↑','↓','←','→'], DR = [-1,1,0,0], DC = [0,0,-1,1];
  const rc = (s) => [Math.floor(s / 4), s % 4];
  const step = (s, a) => {                       // deterministic, walls stay put
    const [r, c] = rc(s), nr = r + DR[a], nc = c + DC[a];
    return (nr < 0 || nr > 3 || nc < 0 || nc > 3) ? s : nr * 4 + nc;
  };
  const reward = (s) => s === GOAL ? 1 : s === HAZARD ? -1 : -0.04;
  const terminal = (s) => s === GOAL || s === HAZARD;

  const Q = Array.from({ length: N }, () => [0, 0, 0, 0]);
  const cnt = Array.from({ length: N }, () => [0, 0, 0, 0]);   // visit counts
  const best = (s) => [0,1,2,3].reduce((b, a) => Q[s][a] > Q[s][b] ? a : b, 0);
  const choose = (s, eps) => Math.random() < eps ? (Math.random() * 4 | 0) : best(s);

  const GAMMA = 0.9, EPISODES = 40;
  for (let ep = 0; ep < EPISODES; ep++) {
    const eps = 0.3 + (0.02 - 0.3) * (ep / (EPISODES - 1));    // decay 0.3 -> 0.02

    // 1) Play a WHOLE episode to termination, recording (s, a, r).
    const ep_ = [];
    let s = START;
    while (!terminal(s) && ep_.length < 100) {
      const a = choose(s, eps), s2 = step(s, a);
      ep_.push({ s, a, r: reward(s2) });
      s = s2;
    }

    // 2) Walk BACKWARDS, average the real return into each FIRST-visit (s, a).
    const seen = new Set();
    let G = 0;
    for (let i = ep_.length - 1; i >= 0; i--) {
      const { s, a, r } = ep_[i];
      G = r + GAMMA * G;                          // real return, no bootstrap
      const tail = ep_.slice(0, i).some(e => e.s === s && e.a === a);
      if (!tail) {                                // first visit of (s, a)
        cnt[s][a]++;
        Q[s][a] += (G - Q[s][a]) / cnt[s][a];     // incremental sample mean
      }
    }
  }

  // Follow the trained greedy policy from start to goal.
  let s = START, steps = 0;
  while (s !== GOAL && steps < 30) { s = step(s, best(s)); steps++; }
  return steps;                                   // 6 on this grid
}`,
  eli5: `## Grade each move only after you see how the game ended

Imagine a game bot replaying an entire match before judging any of its moves. It plays a WHOLE game to the end — win, loss, or timeout — and only THEN looks back and decides, for each move it made, "given how the whole thing turned out, was that a good move?" That final outcome is the truth it learns from.

## First-visit returns and averaging

After the game, the bot walks the trajectory BACKWARDS, adding up rewards into a running total called the return \`G\` (rewards later in the game count slightly less — that is the discount). The first time each (square, direction) pair shows up in the game, it records that pair's return. Across many games it simply AVERAGES those returns: that average becomes the move's value. No guessing about the future — just the real scores it actually saw.

## Monte Carlo vs TD

TD methods like Q-learning update after EVERY step by leaning on their own estimate of the next square (bootstrapping). Monte Carlo refuses to guess: it waits for the episode to end and uses the real return. The trade-off — MC is unbiased (it learns from truth) but high-variance (one unlucky game can swing an estimate), while TD is lower-variance but biased by its own rough estimates and learns every step.

## Why exploration (epsilon) is needed

If the bot always took its current-best move, whole (square, direction) pairs would never appear in any game, so their returns would never get averaged and stay wrong forever. So with probability \`epsilon\` it wanders randomly; we shrink \`epsilon\` over time — explore early, commit late.

## Pitfalls

- Episodes MUST terminate — no ending means no return to average, so MC stalls.
- High variance — noisy games need many episodes to settle.
- First-visit vs every-visit — here we average only the FIRST occurrence of each (s, a) per game; every-visit averages them all. Both converge, slightly differently.

This is how you train a game bot from full playthroughs: let it finish the round, then score every move by how the round actually went.`,
};

export default descriptor;
