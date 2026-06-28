import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Value iteration on a 4x4 gridworld.
// Scenario: the SAME world a Q-learning bot explores by trial — Start (0,0),
// Goal (3,3) reward +1, Hazard (1,2) reward -1, step cost -0.04, deterministic
// 4-direction moves, gamma=0.9 — but here the bot KNOWS the full map and reward
// rules. So instead of LEARNING by trial-and-error, it COMPUTES the optimal
// plan with dynamic programming: repeat Bellman sweeps until the value of every
// square stops changing, then read off the greedy policy.

const ROWS = 4;
const COLS = 4;
const GAMMA = 0.9;
const STEP_COST = -0.04;
const GOAL: [number, number] = [3, 3];
const HAZARD: [number, number] = [1, 2];
const GOAL_REWARD = 1;
const HAZARD_REWARD = -1;
const EPS = 1e-4;
const MAX_SWEEPS = 30;

// Deterministic 4-direction moves. Arrow glyph paired with each.
const ACTIONS: Array<{ dr: number; dc: number; arrow: string }> = [
  { dr: -1, dc: 0, arrow: '↑' },
  { dr: 1, dc: 0, arrow: '↓' },
  { dr: 0, dc: -1, arrow: '←' },
  { dr: 0, dc: 1, arrow: '→' },
];

const isGoal = (r: number, c: number) => r === GOAL[0] && c === GOAL[1];
const isHazard = (r: number, c: number) => r === HAZARD[0] && c === HAZARD[1];
const isTerminal = (r: number, c: number) => isGoal(r, c) || isHazard(r, c);

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // V[r][c] = best total future reward achievable starting from this square.
  // Terminals are pinned to their reward; everything else starts at 0.
  const V: number[][] = Array.from({ length: ROWS }, (_r, r) =>
    Array.from({ length: COLS }, (_c, c) =>
      isGoal(r, c) ? GOAL_REWARD : isHazard(r, c) ? HAZARD_REWARD : 0,
    ),
  );

  // One Bellman backup for a non-terminal cell: look one step ahead in every
  // direction and take the best [ stepReward + gamma * V(next) ]. A move into a
  // wall stays in place. Returns the best value and the action that achieves it.
  const backup = (r: number, c: number): { value: number; arrow: string } => {
    let best = -Infinity;
    let bestArrow = '';
    for (const a of ACTIONS) {
      let nr = r + a.dr;
      let nc = c + a.dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
        nr = r; // bounce off the wall, stay put
        nc = c;
      }
      const q = STEP_COST + GAMMA * V[nr][nc];
      if (q > best) {
        best = q;
        bestArrow = a.arrow;
      }
    }
    return { value: best, arrow: bestArrow };
  };

  // Greedy action (just the arrow) for the current V — used for rendering and
  // for the final rollout.
  const greedyArrow = (r: number, c: number): string => backup(r, c).arrow;

  // Build the renderable grid from the current V and greedy policy.
  const renderGrid = (): Cell[][] =>
    V.map((row, r) =>
      row.map((v, c): Cell => {
        if (isGoal(r, c)) return { value: Math.round(v * 100) / 100, role: 'goal' };
        if (isHazard(r, c)) return { value: Math.round(v * 100) / 100, role: 'hazard' };
        const role = r === 0 && c === 0 ? 'active' : 'plain';
        return { value: Math.round(v * 100) / 100, role, arrow: greedyArrow(r, c) };
      }),
    );

  // Repeat sweeps until values settle (or we hit the cap).
  let sweep = 0;
  let converged = false;
  for (; sweep < MAX_SWEEPS; sweep++) {
    let maxChange = 0;
    // Compute every cell's new value from the CURRENT V, then write them in.
    // (Using the freshly-updated V in-place — Gauss-Seidel — only speeds
    // convergence and never changes the fixed point.)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isTerminal(r, c)) continue; // terminals are fixed to their reward
        const before = V[r][c];
        const after = backup(r, c).value;
        V[r][c] = after;
        maxChange = Math.max(maxChange, Math.abs(after - before));
      }
    }

    converged = maxChange < EPS;
    t.step({
      view: { kind: 'grid', rows: renderGrid() },
      state: [
        { label: 'sweep', value: sweep + 1 },
        { label: 'max change', value: Math.round(maxChange * 10000) / 10000, highlight: true },
        { label: 'gamma', value: GAMMA },
      ],
      note: converged
        ? `Sweep ${sweep + 1}: values changed by only ${maxChange.toFixed(4)} < ${EPS}. The value function has converged — the arrows now show the optimal policy.`
        : `Sweep ${sweep + 1}: each non-terminal square took its best one-step-ahead value (Bellman backup). Largest change this sweep: ${maxChange.toFixed(4)}. The goal's value keeps rippling outward.`,
    });

    if (converged) break;
  }

  // Roll out the final greedy policy from Start to Goal, counting steps (cap 30).
  let steps = 0;
  let r = 0;
  let c = 0;
  while (!isGoal(r, c) && steps < 30) {
    const a = ACTIONS.find((x) => x.arrow === greedyArrow(r, c))!;
    let nr = r + a.dr;
    let nc = c + a.dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
      nr = r;
      nc = c;
    }
    if (nr === r && nc === c) break; // stuck against a wall — avoid infinite loop
    r = nr;
    c = nc;
    steps++;
    if (isHazard(r, c)) break; // policy should never do this, but guard anyway
  }

  t.step({
    view: { kind: 'grid', rows: renderGrid() },
    state: [
      { label: 'sweeps', value: sweep + 1 },
      { label: 'policy length', value: steps, highlight: true },
    ],
    note: `Converged. Following the greedy arrows from Start (0,0) reaches the Goal in ${steps} steps — the Manhattan-shortest path that steers around the hazard.`,
  });

  return { steps: t.steps, answer: steps };
}

const descriptor: AlgoDescriptor = {
  id: 'value-iteration',
  title: 'Value iteration: planning a policy',
  category: 'Reinforcement Learning',
  scenario:
    'A game bot on a 4x4 board: Start (0,0), Goal (3,3) reward +1, Hazard (1,2) reward -1, every step costs -0.04, moves are deterministic. Unlike the Q-learning bot that must explore to discover the rules, this bot already KNOWS the full map and reward model — so it can COMPUTE the optimal plan directly with dynamic programming instead of learning by trial.',
  pattern:
    'Value iteration. Give every square a value V(s) = the best total future reward obtainable from it. Repeat Bellman sweeps: for each non-terminal square, V(s) = max over actions of [ stepReward + gamma · V(next) ]; terminals stay pinned to their reward. The goal’s value ripples outward sweep by sweep. Stop when the largest change falls below a tolerance, then read the optimal policy off as “always step toward the highest-value neighbour”.',
  complexity: 'O(sweeps × states × actions)',
  difficulty: 'Medium',
  eli5: `## The big idea

Imagine a game bot dropped onto a 4x4 board. The Q-learning bot from the other slice has to *wander around* bumping into things to figure out the rules. This bot is different: it was handed the whole map and the rulebook up front — it knows where the goal is, where the trap is, and what every move costs. Because it knows the rules, it doesn't need to learn by trial. It can sit down and *compute* the best plan.

## What a "value" means

Every square gets a number called its value: the best total future reward you could collect if you started standing on that square and played perfectly from there. The goal square is worth +1. The trap is worth -1. At the start, every other square is a blank 0 — the bot hasn't worked out their worth yet.

## The Bellman backup: look one step ahead

To improve a square's value, the bot does one simple thing: it looks at its four neighbours, and for each it computes "the step cost (-0.04) plus a discounted slice of that neighbour's value". It then keeps the *best* of those four. That's a Bellman backup — "I'm worth as much as the best place I can step to next, minus the cost of walking there".

## Ripples from the goal

Do that for every square, over and over (a "sweep"). On the first sweep only the goal's neighbours learn they're valuable. On the next sweep *their* neighbours catch on. The +1 spreads outward like a ripple in a pond until even the far Start corner knows which way leads home. When a whole sweep barely changes any value (under 1e-4), we've converged.

## Gamma = patience

\`gamma\` (0.9) discounts future reward: a payoff one step away is multiplied by 0.9, two steps away by 0.81, and so on. It's the bot's patience dial — high gamma means "a distant goal is still worth chasing", low gamma means "only care about reward right under my nose".

## Reading the plan

Once values settle, the policy is trivial: from any square, step toward the highest-value neighbour (that's the arrow drawn in each cell). Following the arrows from Start walks the shortest safe path to the goal — \`6\` steps here, neatly avoiding the trap.

## Complexity in plain terms

Each sweep touches every square and tries every action: states × actions of work, repeated for however many sweeps it takes to settle — O(sweeps × states × actions).

## Pitfalls

- It needs the *full model* — the map and every reward — up front. No model, no value iteration; that's when you fall back to Q-learning.
- The state space can explode: a real game with thousands of tiles, items, and enemies has astronomically many states, so plain value iteration becomes infeasible and you approximate (e.g. with a neural net).`,
  defaultInput: {},
  expected: 6,
  run,
  code: `function valueIteration() {
  const GAMMA = 0.9, STEP = -0.04, EPS = 1e-4;
  const isGoal = (r, c) => r === 3 && c === 3;
  const isHaz  = (r, c) => r === 1 && c === 2;
  const term   = (r, c) => isGoal(r, c) || isHaz(r, c);
  const ACT = [[-1,0,'↑'],[1,0,'↓'],[0,-1,'←'],[0,1,'→']];

  // values: goal +1, hazard -1, everything else 0
  const V = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) =>
      isGoal(r, c) ? 1 : isHaz(r, c) ? -1 : 0));

  // one-step-ahead best action for a square
  const backup = (r, c) => {
    let best = -Infinity, arrow = '';
    for (const [dr, dc, a] of ACT) {
      let nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 3 || nc < 0 || nc > 3) { nr = r; nc = c; } // wall
      const q = STEP + GAMMA * V[nr][nc];
      if (q > best) { best = q; arrow = a; }
    }
    return { value: best, arrow };
  };

  // Bellman sweeps until values settle
  for (let sweep = 0; sweep < 30; sweep++) {
    let change = 0;
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        if (term(r, c)) continue;          // terminals fixed to reward
        const before = V[r][c];
        V[r][c] = backup(r, c).value;
        change = Math.max(change, Math.abs(V[r][c] - before));
      }
    if (change < EPS) break;
  }

  // follow the greedy policy from Start, count steps
  let r = 0, c = 0, steps = 0;
  while (!isGoal(r, c) && steps < 30) {
    const [dr, dc] = ACT.find(a => a[2] === backup(r, c).arrow);
    let nr = r + dr, nc = c + dc;
    if (nr < 0 || nr > 3 || nc < 0 || nc > 3) { nr = r; nc = c; }
    r = nr; c = nc; steps++;
  }
  return steps;                            // 6 — shortest safe path
}`,
};

export default descriptor;
