import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Q-learning on a 4x4 gridworld.
// Scenario: a game NPC starts at the top-left and must learn — by trial and
// reward, never told the rules — to walk to the goal at the bottom-right while
// avoiding a hazard. It keeps a Q-table: for every (state, action) a number for
// "how good is this move from here". Each episode it acts mostly greedily but
// sometimes explores, and after every move it nudges its estimate toward the
// reward it got plus the best value reachable from where it landed (Bellman).
// Over ~40 episodes the table converges and the greedy policy is the 6-step
// optimal path. The answer is the length of that final greedy walk.

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
  let seed = (input.params?.seed ?? 7) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const EPISODES = input.params?.episodes ?? 40;
  const ALPHA = 0.5;
  const GAMMA = 0.9;
  const EPS_START = 0.3;
  const EPS_END = 0.02;

  // Q[state][action], all zero to start (the bot knows nothing).
  const Q: number[][] = Array.from({ length: N }, () => [0, 0, 0, 0]);

  const bestAction = (s: number): number => {
    let best = 0;
    for (let a = 1; a < 4; a++) if (Q[s][a] > Q[s][best]) best = a;
    return best;
  };
  const maxQ = (s: number): number => Math.max(Q[s][0], Q[s][1], Q[s][2], Q[s][3]);

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

  // --- Training: epsilon-greedy episodes with the Bellman update. ---
  for (let ep = 0; ep < EPISODES; ep++) {
    // Linear epsilon decay across episodes.
    const epsilon =
      EPISODES > 1
        ? EPS_START + (EPS_END - EPS_START) * (ep / (EPISODES - 1))
        : EPS_END;

    let s = START;
    let steps = 0;
    let outcome = 'capped';
    const MAX_STEPS = 100;

    while (steps < MAX_STEPS) {
      // Choose action: explore with prob epsilon, else greedy.
      const a = rand() < epsilon ? Math.floor(rand() * 4) : bestAction(s);
      const s2 = stepEnv(s, a);
      const r = reward(s2);

      // Bellman update toward reward + discounted best next value.
      const target = isTerminal(s2) ? r : r + GAMMA * maxQ(s2);
      Q[s][a] += ALPHA * (target - Q[s][a]);

      s = s2;
      steps++;
      if (isTerminal(s2)) {
        outcome = s2 === GOAL ? 'reached goal' : 'hit hazard';
        break;
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
      )}): bot ${outcome} in ${steps} steps. Start is (0,0) top-left; arrows show the policy learned so far (each cell's number is its best Q-value).`,
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
  id: 'q-learning',
  title: 'Q-learning: a bot learns a gridworld',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  complexity: 'O(episodes × steps)',
  scenario:
    'A game NPC is dropped at the top-left of a 4x4 grid and must reach the goal at the bottom-right, avoiding a hazard tile that ends the run badly. It is never told the rules. By repeatedly trying moves and seeing the reward (+1 goal, -1 hazard, -0.04 per step), it learns a Q-table — a value for every move from every cell — and the greedy path through it becomes the optimal 6-step route.',
  pattern:
    'Q-learning (model-free, off-policy, tabular). Keep Q[state][action] estimates. Each episode act epsilon-greedily (explore vs exploit), and after every transition nudge Q[s][a] toward r + γ·maxₐ′ Q[s′][a′] with learning rate α (the Bellman / temporal-difference update). Decay epsilon so exploration fades as the estimates firm up. The converged greedy policy is optimal even though the agent never knew the transition or reward functions in advance.',
  defaultInput: { params: { seed: 7, episodes: 40 } },
  expected: 6,
  run,
  code: `function qLearn() {
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
  const best = (s) => [0,1,2,3].reduce((b, a) => Q[s][a] > Q[s][b] ? a : b, 0);
  const maxQ = (s) => Math.max(...Q[s]);

  const ALPHA = 0.5, GAMMA = 0.9, EPISODES = 40;
  for (let ep = 0; ep < EPISODES; ep++) {
    const eps = 0.3 + (0.02 - 0.3) * (ep / (EPISODES - 1));   // decay 0.3 -> 0.02
    let s = START;
    while (!terminal(s)) {
      const a = Math.random() < eps ? (Math.random() * 4 | 0) : best(s);
      const s2 = step(s, a), r = reward(s2);
      const target = terminal(s2) ? r : r + GAMMA * maxQ(s2);
      Q[s][a] += ALPHA * (target - Q[s][a]);     // Bellman / TD update
      s = s2;
    }
  }

  // Follow the trained greedy policy from start to goal.
  let s = START, steps = 0;
  while (s !== GOAL && steps < 30) { s = step(s, best(s)); steps++; }
  return steps;                                  // 6 on this grid
}`,
  eli5: `## A dog learning a maze with treats and shocks

Imagine a dog let loose in a small maze. It has no map and no instructions. At the far corner is a treat (+1). One tile has a mild shock (-1). Wandering tires it out a little, so each step costs a tiny bit (-0.04). The dog just tries moves and remembers how things turned out.

## What a Q-value means

For every spot in the maze and every direction it could go, the dog keeps a number: "how good is it to go THIS way from HERE?" That number is the Q-value. High means "this move tends to lead somewhere good." All Q-values start at zero — the dog assumes nothing.

## The Bellman update, in words

After each move the dog adjusts the number for the move it just made. It nudges it toward: the reward it just got, plus a slightly-discounted version of the best Q-value where it landed. So good fortune flows backward: the treat makes the tile next to it look good, which makes the tile before that look good, until the whole path lights up.

## Explore vs exploit

If the dog always took its current-best move it would lock onto the first decent path and never find better. So with probability \`epsilon\` it tries a random move (explore); otherwise it takes its best guess (exploit). We start \`epsilon\` high (~0.3) and shrink it (~0.02) — wander early, commit late.

## Why it converges without knowing the rules

The dog never learns the maze's layout or reward formula. It only samples (state, action, reward, next-state) and lets values seep backward. Given enough visits, the Q-table settles on the true best move everywhere — here, the 6-step path that dodges the shock.

## Pitfalls

- Too greedy too soon: \`epsilon\` collapses before exploring, and the bot gets stuck on a bad route.
- Learning rate \`alpha\`: too high and estimates thrash; too low and learning crawls.
- Sparse rewards: if the treat is rare, the signal barely propagates — shaping (like the small step cost) helps.

This is exactly how simple game bots are trained: let them play, reward outcomes, and the policy emerges.`,
};

export default descriptor;
