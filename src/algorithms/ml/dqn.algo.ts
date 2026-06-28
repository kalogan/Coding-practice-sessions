import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// DQN — Q-learning where a FUNCTION APPROXIMATOR predicts Q instead of a table.
//
// Scenario: a tiny game bot lives in a 1-D corridor of 5 cells. It starts at the
// left end (state 0) and the goal is the right end (state 4, reward +1). Every
// step costs a little (-0.05). It can move left or right (and bumps stay put at
// the ends). Instead of a Q-table it learns a small parameterized function
// Q(s,a) = w·features(s,a) and trains it by gradient descent on TD targets, with
// a replay buffer and a periodically-synced target network — the two tricks that
// make deep Q-learning stable. After ~40 episodes the greedy policy should walk
// 0 -> 4 in the optimal 4 steps (always right).

const N = 5; // corridor length
const START = 0;
const GOAL = N - 1; // state 4
const STEP_R = -0.05; // living penalty
const GOAL_R = 1; // reward for reaching the goal
const ACTIONS = [-1, 1]; // 0 = left, 1 = right
const ARROWS = ['←', '→'];

// Deterministic environment: move and clamp at the ends.
const stepEnv = (s: number, a: number): number =>
  Math.max(0, Math.min(N - 1, s + ACTIONS[a]));
const reward = (s2: number): number => (s2 === GOAL ? GOAL_R : STEP_R);
const isTerminal = (s: number): boolean => s === GOAL;

// Features of (state, action): one-hot over state (length N), repeated per action,
// plus a bias term. This is a LINEAR function approximator — the same idea as a
// deep net, just with no hidden layer, so it's stable and easy to follow. A real
// DQN would replace `features` + the dot product with a multi-layer net whose
// weights are tuned by the identical TD-target gradient step.
const NA = ACTIONS.length;
const FEAT = N * NA + 1; // one-hot(state) per action + bias
function features(s: number, a: number): number[] {
  const f = new Array(FEAT).fill(0);
  f[a * N + s] = 1; // active state cell for this action block
  f[FEAT - 1] = 1; // bias
  return f;
}

function run(input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Seeded LCG — deterministic, no Math.random / Date.
  let seed = (input.params?.seed ?? 13) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const EPISODES = input.params?.episodes ?? 40;
  const GAMMA = 0.9;
  const LR = 0.1; // gradient-step size
  const EPS_START = 0.4;
  const EPS_END = 0.02;
  const BATCH = 4; // replay samples per learning step
  const SYNC = 5; // sync the target network every N learning steps
  const MAX_STEPS = 20;

  // Online weights and a target-network copy (frozen between syncs).
  const w = new Array(FEAT).fill(0);
  let wTarget = w.slice();

  const dot = (a: number[], b: number[]): number => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  };
  const qOnline = (s: number, a: number): number => dot(w, features(s, a));
  const qTarget = (s: number, a: number): number => dot(wTarget, features(s, a));

  const bestAction = (s: number): number =>
    qOnline(s, 1) >= qOnline(s, 0) ? 1 : 0;
  const maxQTarget = (s: number): number =>
    Math.max(qTarget(s, 0), qTarget(s, 1));
  const maxQOnline = (s: number): number =>
    Math.max(qOnline(s, 0), qOnline(s, 1));

  // One gradient step on (Q(s,a) - target)^2 for a single transition.
  const learnOn = (s: number, a: number, target: number) => {
    const f = features(s, a);
    const err = qOnline(s, a) - target; // dL/dQ = 2*err (drop the 2 into LR)
    for (let i = 0; i < FEAT; i++) w[i] -= LR * err * f[i];
  };

  type Tr = { s: number; a: number; r: number; s2: number; done: boolean };
  const replay: Tr[] = [];
  const REPLAY_CAP = 200;

  // Render the corridor as a 1xN grid: each cell shows its predicted max-Q
  // (rounded) and the greedy-action arrow; goal carries 'goal'; an optional
  // `agent` cell is drawn 'active'.
  const renderCorridor = (agent?: number): Cell[][] => {
    const row: Cell[] = [];
    for (let s = 0; s < N; s++) {
      if (s === GOAL) {
        row.push({ value: 'G', role: agent === s ? 'active' : 'goal' });
      } else {
        const v = Math.round(maxQOnline(s) * 100) / 100;
        row.push({
          value: v,
          role: agent === s ? 'active' : 'plain',
          arrow: ARROWS[bestAction(s)],
        });
      }
    }
    return [row];
  };

  let learnSteps = 0;

  // --- Training: epsilon-greedy episodes, replay + target-net gradient steps. ---
  for (let ep = 0; ep < EPISODES; ep++) {
    const epsilon =
      EPISODES > 1
        ? EPS_START + (EPS_END - EPS_START) * (ep / (EPISODES - 1))
        : EPS_END;

    let s = START;
    let steps = 0;
    let outcome = 'capped';

    while (steps < MAX_STEPS) {
      // epsilon-greedy action selection.
      const a = rand() < epsilon ? (rand() < 0.5 ? 0 : 1) : bestAction(s);
      const s2 = stepEnv(s, a);
      const r = reward(s2);
      const done = isTerminal(s2);

      // Store the transition in the replay buffer.
      replay.push({ s, a, r, s2, done });
      if (replay.length > REPLAY_CAP) replay.shift();

      // Sample a small batch from replay and take a TD gradient step on each.
      // The target uses the FROZEN target network so it doesn't chase itself.
      for (let b = 0; b < BATCH; b++) {
        const tr = replay[Math.floor(rand() * replay.length)];
        const target = tr.done ? tr.r : tr.r + GAMMA * maxQTarget(tr.s2);
        learnOn(tr.s, tr.a, target);
      }

      learnSteps++;
      if (learnSteps % SYNC === 0) wTarget = w.slice(); // sync target network

      s = s2;
      steps++;
      if (done) {
        outcome = 'reached goal';
        break;
      }
    }

    t.step({
      view: { kind: 'grid', rows: renderCorridor() },
      state: [
        { label: 'phase', value: 'train' },
        { label: 'episode', value: ep + 1, highlight: true },
        { label: 'epsilon', value: Math.round(epsilon * 100) / 100 },
        { label: 'replay', value: replay.length },
        { label: 'outcome', value: outcome },
        { label: 'steps', value: steps },
      ],
      note: `Episode ${ep + 1}/${EPISODES} (ε=${(Math.round(epsilon * 100) / 100).toFixed(
        2,
      )}): bot ${outcome} in ${steps} steps. Each cell shows the net's predicted best Q-value and its greedy arrow; the goal is the right end.`,
    });
  }

  // --- Final phase: follow the greedy policy from start to goal. ---
  let s = START;
  let walkSteps = 0;
  const CAP = 20;

  t.step({
    view: { kind: 'grid', rows: renderCorridor(s) },
    state: [
      { label: 'phase', value: 'rollout' },
      { label: 'step', value: walkSteps },
      { label: 'cell', value: s },
    ],
    note: `Training done. The trained bot now walks greedily from state 0, following the arrows toward the goal.`,
  });

  while (s !== GOAL && walkSteps < CAP) {
    const a = bestAction(s);
    s = stepEnv(s, a);
    walkSteps++;
    t.step({
      view: { kind: 'grid', rows: renderCorridor(s) },
      state: [
        { label: 'phase', value: 'rollout' },
        { label: 'step', value: walkSteps, highlight: true },
        { label: 'action', value: ARROWS[a] },
        { label: 'cell', value: s },
      ],
      note:
        s === GOAL
          ? `Move ${walkSteps}: ${ARROWS[a]} into the goal! Reached in ${walkSteps} steps.`
          : `Move ${walkSteps}: ${ARROWS[a]} to state ${s}.`,
    });
  }

  return { steps: t.steps, answer: walkSteps };
}

const descriptor: AlgoDescriptor = {
  id: 'dqn',
  title: 'DQN: deep Q-learning',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  complexity: 'O(episodes × steps × weights)',
  scenario:
    'A game bot lives in a 1-D corridor of 5 cells. It starts at the left end (state 0); the goal is the right end (state 4, reward +1), and every step costs a little (-0.05). It can move left or right and bumps stay put at the ends. Instead of memorizing a Q-table, it learns a parameterized function Q(state, action) and tunes the parameters by gradient descent — the same idea that lets DQN play Atari from raw pixels, where a table could never fit. After ~40 episodes the greedy policy walks 0 -> 4 in the optimal 4 steps.',
  pattern:
    'DQN (Q-learning with function approximation). Replace the Q-table with a parameterized Qθ(s,a) — here a linear model over one-hot state features, a tiny net in spirit. Act epsilon-greedily, store each (s,a,r,s′,done) transition in a replay buffer, and each step sample a small batch and take a gradient step minimizing (Qθ(s,a) − target)² where target = r + γ·maxₐ′ Q_target(s′,a′). Two stabilizers matter: experience replay breaks the correlation between consecutive samples, and a target network (a frozen copy synced periodically) stops the regression target from moving while you chase it. The converged greedy policy is optimal even with no table.',
  defaultInput: { params: { seed: 13, episodes: 40 } },
  expected: 4,
  run,
  code: `function dqn() {
  const N = 5, START = 0, GOAL = 4;
  const ACTIONS = [-1, 1];                         // 0 = left, 1 = right
  const stepEnv = (s, a) => Math.max(0, Math.min(N - 1, s + ACTIONS[a]));
  const reward  = (s2) => s2 === GOAL ? 1 : -0.05;
  const done    = (s) => s === GOAL;

  // Linear function approximator: Q(s,a) = w · features(s,a).
  // (A real DQN swaps features+dot for a multi-layer net — same TD gradient.)
  const FEAT = N * 2 + 1;
  const feats = (s, a) => { const f = Array(FEAT).fill(0); f[a*N+s]=1; f[FEAT-1]=1; return f; };
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

  let w = Array(FEAT).fill(0), wT = w.slice();      // online + target weights
  const qOn = (s, a) => dot(w,  feats(s, a));
  const qTg = (s, a) => dot(wT, feats(s, a));
  const best = (s) => qOn(s, 1) >= qOn(s, 0) ? 1 : 0;
  const maxTg = (s) => Math.max(qTg(s, 0), qTg(s, 1));

  const GAMMA = 0.9, LR = 0.1, BATCH = 4, SYNC = 5;
  const replay = [];
  let learn = 0;

  for (let ep = 0; ep < 40; ep++) {
    const eps = 0.4 + (0.02 - 0.4) * (ep / 39);     // decay 0.4 -> 0.02
    let s = START, steps = 0;
    while (!done(s) && steps < 20) {
      const a = Math.random() < eps ? (Math.random() < .5 ? 0 : 1) : best(s);
      const s2 = stepEnv(s, a), r = reward(s2), d = done(s2);
      replay.push({ s, a, r, s2, d });

      for (let b = 0; b < BATCH; b++) {             // replay a small batch
        const tr = replay[Math.random() * replay.length | 0];
        const target = tr.d ? tr.r : tr.r + GAMMA * maxTg(tr.s2);
        const f = feats(tr.s, tr.a), err = qOn(tr.s, tr.a) - target;
        for (let i = 0; i < FEAT; i++) w[i] -= LR * err * f[i];   // TD gradient
      }
      if (++learn % SYNC === 0) wT = w.slice();      // sync target network
      s = s2; steps++;
    }
  }

  // Follow the trained greedy policy from start to goal.
  let s = START, steps = 0;
  while (s !== GOAL && steps < 20) { s = stepEnv(s, best(s)); steps++; }
  return steps;                                      // 4 on this corridor
}`,
  eli5: `## A table that doesn't fit

In plain Q-learning the bot keeps a Q-value for every (state, action) pair in a big lookup table. That works for a 5-cell corridor or a 4x4 grid. But a real game's "state" might be the screen pixels — billions of possibilities. No table could ever hold a row for each, and the bot would never visit the same pixel-state twice anyway.

## Learn a function instead

So instead of memorizing, we LEARN a function Qθ(state, action) with tunable parameters θ. Show it features of the state and it predicts the value of each move. Because similar states share features, what it learns in one situation GENERALIZES to nearby ones it has never seen. Here θ is a simple linear model over one-hot state features; a real DQN makes Qθ a deep neural net, but the training is identical.

## The TD-target regression

How do we train it with no labels? We bootstrap. For a transition (s, a, r, s′) the "correct" answer should be \`target = r + γ·maxₐ′ Q(s′,a′)\` — the reward plus the discounted best value of where we landed. We do one gradient step shrinking \`(Qθ(s,a) − target)²\`. Reward seeps backward from the goal, exactly like tabular Q-learning, but now through shared weights.

## Replay + target network

Two tricks keep this from blowing up. Experience REPLAY stores past transitions and samples a random mini-batch each step, so the net isn't trained on a stream of highly correlated, back-to-back moments. A TARGET NETWORK is a frozen copy used to compute \`target\`; we sync it only occasionally so the goalposts hold still while we aim — without it the prediction and its own target chase each other and diverge.

## Why it matters for game bots

This is the algorithm that learned to play Atari from raw pixels and underpins systems like AlphaGo. Pitfalls to respect: the moving target (mitigated by the target net), correlated samples (mitigated by replay), and overestimation from always taking the max (Double DQN splits action-choice from value-lookup to fix it). Same loop powers learned NPCs: let them play, regress toward TD targets, and a policy that generalizes emerges.`,
};

export default descriptor;
