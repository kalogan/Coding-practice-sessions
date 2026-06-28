import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// SARSA (State-Action-Reward-State-Action) on a 4x4 gridworld.
// Scenario: the SAME setup as Q-learning — a game NPC starts top-left and must
// learn to reach the goal bottom-right while dodging a hazard, told nothing in
// advance. The crucial difference is that SARSA is ON-POLICY: after taking a
// step it picks the NEXT action a' the same epsilon-greedy way it actually
// behaves, and updates toward Q[s'][a'] — the value of the move it will REALLY
// make — not the best-possible move. So SARSA values the policy it follows,
// exploration included, which makes it play it safer near the hazard.

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
  let seed = (input.params?.seed ?? 42) >>> 0;
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

  // Epsilon-greedy action selection — this is the policy the bot actually
  // follows, and (because SARSA is on-policy) also the one it learns the value
  // of. Explore with prob epsilon, else take the current greedy best.
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

  // --- Training: on-policy SARSA episodes with the TD update. ---
  for (let ep = 0; ep < EPISODES; ep++) {
    // Linear epsilon decay across episodes.
    const epsilon =
      EPISODES > 1
        ? EPS_START + (EPS_END - EPS_START) * (ep / (EPISODES - 1))
        : EPS_END;

    let s = START;
    // Pick the FIRST action up front — SARSA needs (s, a) before the loop.
    let a = chooseAction(s, epsilon);
    let steps = 0;
    let outcome = 'capped';
    const MAX_STEPS = 100;

    while (steps < MAX_STEPS) {
      const s2 = stepEnv(s, a);
      const r = reward(s2);

      if (isTerminal(s2)) {
        // No next action from a terminal state: target is just the reward.
        Q[s][a] += ALPHA * (r - Q[s][a]);
        steps++;
        outcome = s2 === GOAL ? 'reached goal' : 'hit hazard';
        break;
      }

      // ON-POLICY: choose the NEXT action a' the same epsilon-greedy way the
      // bot will actually act, and update toward Q[s'][a'] — the value of the
      // move it WILL make — not max over a'. (That single change is SARSA.)
      const a2 = chooseAction(s2, epsilon);
      Q[s][a] += ALPHA * (r + GAMMA * Q[s2][a2] - Q[s][a]);

      s = s2;
      a = a2;
      steps++;
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
      )}): bot ${outcome} in ${steps} steps. SARSA updates toward the value of the next action it ACTUALLY takes (on-policy); arrows show the greedy policy learned so far (each cell's number is its best Q-value).`,
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
  id: 'sarsa',
  title: 'SARSA: on-policy TD control',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  complexity: 'O(episodes × steps)',
  scenario:
    'The same 4x4 gridworld as Q-learning: a game NPC starts top-left and must reach the goal bottom-right (+1) while dodging a hazard tile (-1), with a -0.04 cost per step and no knowledge of the rules. SARSA learns by acting epsilon-greedily and updating each move toward the value of the NEXT move it actually takes. Because it values the policy it really follows — exploratory wobbles included — it learns a route that gives the hazard a slightly wider berth, then walks the greedy optimum in 6 steps.',
  pattern:
    'SARSA (model-free, ON-policy, tabular TD control). Keep Q[state][action] estimates. Each episode pick a starting action epsilon-greedily, then repeatedly: take the action, observe r and s′, pick the next action a′ epsilon-greedily (the move you will REALLY make), and update Q[s][a] += α·(r + γ·Q[s′][a′] − Q[s][a]). The contrast with Q-learning is one term: SARSA uses Q[s′][a′] for the action actually chosen, not maxₐ′ Q[s′][a′]. So it learns the value of the behaviour policy itself — which, with a non-zero epsilon, stays away from cliff edges a greedy off-policy learner would happily skirt (the classic cliff-walking result). Decay epsilon so the policy firms up over time.',
  defaultInput: { params: { seed: 42, episodes: 40 } },
  expected: 6,
  run,
  code: `function sarsa() {
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
  // Epsilon-greedy: the policy the bot follows AND the one SARSA values.
  const choose = (s, eps) => Math.random() < eps ? (Math.random() * 4 | 0) : best(s);

  const ALPHA = 0.5, GAMMA = 0.9, EPISODES = 40;
  for (let ep = 0; ep < EPISODES; ep++) {
    const eps = 0.3 + (0.02 - 0.3) * (ep / (EPISODES - 1));   // decay 0.3 -> 0.02
    let s = START, a = choose(s, eps);           // need (s, a) before the loop
    while (true) {
      const s2 = step(s, a), r = reward(s2);
      if (terminal(s2)) { Q[s][a] += ALPHA * (r - Q[s][a]); break; }
      const a2 = choose(s2, eps);                // the NEXT action we WILL take
      Q[s][a] += ALPHA * (r + GAMMA * Q[s2][a2] - Q[s][a]);   // on-policy TD update
      s = s2; a = a2;                            // SARSA: no max over a'
    }
  }

  // Follow the trained greedy policy from start to goal.
  let s = START, steps = 0;
  while (s !== GOAL && steps < 30) { s = step(s, best(s)); steps++; }
  return steps;                                  // 6 on this grid
}`,
  eli5: `## A cautious explorer mapping a cliffside trail

Picture a hiker learning a trail to a cabin (the treat, +1), with a cliff tile that ends the trip badly (-1) and tired legs costing a little each step (-0.04). The hiker has no map. They keep, for every spot and every direction, a number for "how good is going THIS way from HERE?" — the Q-value, all starting at zero.

## On-policy vs off-policy — the heart of SARSA

Here is the one idea that separates SARSA from Q-learning. After a step, the hiker first decides the NEXT move the same way they really move — usually their best guess, but sometimes a random wander (\`epsilon\`-greedy). Then they update the move they just made toward the reward plus the value of that next ACTUAL move.

Q-learning instead updates toward the BEST possible next move, ignoring that it might wander. So Q-learning is "off-policy" — it values an ideal it doesn't always follow. SARSA is "on-policy" — it values the policy it truly walks, random stumbles included.

## Why that makes SARSA safer (cliff walking)

Because SARSA knows it sometimes stumbles, the squares hugging the cliff look risky — one stray step is a fall. So it learns a route a little further from the edge. In the famous "cliff walking" problem, Q-learning learns the shortest cliff-edge path but keeps falling while exploring; SARSA takes a slightly longer, safer path. For a game bot near lava or a pit, that caution is exactly what you want.

## The TD update, in words

Nudge \`Q[s][a]\` toward: reward + (discount × \`Q[s'][a']\`) for the next action \`a'\` you'll really take. Good and bad fortune both seep backward along the path you actually follow.

## Complexity and pitfalls

- Cost is \`O(episodes × steps)\` — cheap per update, just a table lookup.
- \`epsilon\` decay: too fast and it commits early to a poor route; too slow and it never settles.
- Learning rate \`alpha\`: too high and estimates thrash; too low and learning crawls.
- As \`epsilon\` shrinks toward zero, SARSA's safe path converges to the same greedy optimum — here, the 6-step route that dodges the hazard.

This is how you train a game bot that not only reaches the goal but does it without recklessly clipping the danger tiles.`,
};

export default descriptor;
