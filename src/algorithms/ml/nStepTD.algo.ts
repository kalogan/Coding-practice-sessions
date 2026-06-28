import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// n-step SARSA (n=3) on the SAME 4x4 gridworld as Q-learning / SARSA.
// Scenario: a game NPC starts top-left and must learn to reach the goal at the
// bottom-right (+1) while dodging a hazard (-1), with a -0.04 cost per step and
// no knowledge of the rules. The twist over 1-step SARSA: instead of backing up
// only the very next reward, an n-step update accumulates the NEXT n=3 rewards
// plus the bootstrapped Q-value n steps ahead. So a single update can shove
// credit back THREE cells at once — reward propagates back faster, giving
// quicker credit assignment than 1-step TD.

const SIZE = 4;
const N = SIZE * SIZE; // 16 states
const START = 0; // (0,0)
const GOAL = 15; // (3,3)
const HAZARD = 6; // (1,2)  -> row 1, col 2 -> 1*4 + 2
const NSTEP = 3; // accumulate this many rewards before bootstrapping

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

  // Epsilon-greedy action selection — this is the policy the bot follows, and
  // (n-step SARSA is on-policy) also the one whose value it learns.
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

  // --- Training: on-policy n-step SARSA episodes. ---
  // We remember the trajectory of states/actions/rewards, and when the "update
  // time" τ has n rewards available ahead of it, we apply the n-step return:
  //   G = r_{τ+1} + γ r_{τ+2} + ... + γ^{n-1} r_{τ+n} + γ^n Q[s_{τ+n}][a_{τ+n}]
  // dropping the bootstrap term once the lookahead reaches a terminal state.
  for (let ep = 0; ep < EPISODES; ep++) {
    // Linear epsilon decay across episodes.
    const epsilon =
      EPISODES > 1
        ? EPS_START + (EPS_END - EPS_START) * (ep / (EPISODES - 1))
        : EPS_END;

    const states: number[] = [START];
    const actions: number[] = [chooseAction(START, epsilon)];
    const rewards: number[] = [0]; // rewards[0] unused; reward t lands with state t

    let T = Infinity; // step at which the episode terminates
    let tt = 0; // current time index
    let steps = 0;
    let outcome = 'capped';
    const MAX_STEPS = 100;

    while (true) {
      if (tt < T) {
        // Act: take a_tt from s_tt, observe r and s'.
        const s2 = stepEnv(states[tt], actions[tt]);
        const r = reward(s2);
        states[tt + 1] = s2;
        rewards[tt + 1] = r;
        steps++;
        if (isTerminal(s2)) {
          T = tt + 1; // episode ends after this transition
          outcome = s2 === GOAL ? 'reached goal' : 'hit hazard';
        } else {
          // Pick the next on-policy action for the still-running episode.
          actions[tt + 1] = chooseAction(s2, epsilon);
        }
      }

      // τ is the step whose estimate we are now ready to update.
      const tau = tt - NSTEP + 1;
      if (tau >= 0) {
        // Accumulate the discounted sum of the up-to-n rewards we have seen.
        let G = 0;
        const last = Math.min(tau + NSTEP, T);
        for (let i = tau + 1; i <= last; i++) {
          G += Math.pow(GAMMA, i - tau - 1) * rewards[i];
        }
        // Bootstrap with Q n steps ahead — unless the lookahead hit a terminal
        // state (then there is no future to bootstrap from).
        if (tau + NSTEP < T) {
          const sN = states[tau + NSTEP];
          const aN = actions[tau + NSTEP];
          G += Math.pow(GAMMA, NSTEP) * Q[sN][aN];
        }
        const s = states[tau];
        const a = actions[tau];
        Q[s][a] += ALPHA * (G - Q[s][a]);
      }

      if (tau === T - 1) break; // all steps updated
      tt++;
      if (steps >= MAX_STEPS) break; // safety cap on runaway episodes
    }

    // ONE digestible step per episode: the current greedy policy.
    t.step({
      view: { kind: 'grid', rows: renderPolicy() },
      state: [
        { label: 'phase', value: 'train' },
        { label: 'episode', value: ep + 1, highlight: true },
        { label: 'n', value: NSTEP },
        { label: 'epsilon', value: Math.round(epsilon * 100) / 100 },
        { label: 'outcome', value: outcome },
        { label: 'steps', value: steps },
      ],
      note: `Episode ${ep + 1}/${EPISODES} (ε=${(Math.round(epsilon * 100) / 100).toFixed(
        2,
      )}): bot ${outcome} in ${steps} steps. n-step SARSA (n=${NSTEP}) backs up ${NSTEP} rewards plus the bootstrapped Q three cells ahead per update, so credit spreads back faster; arrows show the greedy policy learned so far (each cell's number is its best Q-value).`,
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
  id: 'n-step-td',
  title: 'n-step TD (3-step SARSA)',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  complexity: 'O(episodes × steps)',
  scenario:
    'The same 4x4 gridworld as Q-learning and SARSA: a game NPC starts top-left and must reach the goal bottom-right (+1) while dodging a hazard tile (-1), paying -0.04 per step, knowing none of the rules. Plain 1-step SARSA only nudges the single move it just made toward the very next reward, so credit trickles backward one cell per visit. n-step SARSA (here n=3) instead waits three moves, sums those three rewards, and bootstraps off the Q-value three cells ahead — pushing credit back three tiles in a single update. The bot finds the optimal route sooner, then walks the greedy optimum in 6 steps.',
  pattern:
    'n-step TD control (model-free, ON-policy, tabular). Keep Q[state][action] estimates and act epsilon-greedily. Instead of the 1-step target r + γ·Q[s′][a′], use the n-step return G = r_{τ+1} + γ·r_{τ+2} + … + γ^{n-1}·r_{τ+n} + γ^n·Q[s_{τ+n}][a_{τ+n}], then update Q[s_τ][a_τ] += α·(G − Q[s_τ][a_τ]). Buffer the trajectory; once step τ has n future rewards available, apply its update; drop the bootstrap term when the n-step lookahead crosses a terminal state. n interpolates between TD(0) (n=1, low variance, high bias, slow credit propagation) and Monte Carlo (n=∞, unbiased, high variance). Bigger n spreads reward back faster but its target depends on more random future moves, so it is noisier. Decay epsilon so the policy firms up.',
  defaultInput: { params: { seed: 7, episodes: 40 } },
  expected: 6,
  run,
  code: `function nStepSarsa() {
  const N = 16, START = 0, GOAL = 15, HAZARD = 6, n = 3;
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
  const choose = (s, eps) => Math.random() < eps ? (Math.random() * 4 | 0) : best(s);

  const ALPHA = 0.5, GAMMA = 0.9, EPISODES = 40;
  for (let ep = 0; ep < EPISODES; ep++) {
    const eps = 0.3 + (0.02 - 0.3) * (ep / (EPISODES - 1));   // decay 0.3 -> 0.02
    const S = [START], A = [choose(START, eps)], R = [0];     // trajectory buffers
    let T = Infinity, t = 0;
    while (true) {
      if (t < T) {
        const s2 = step(S[t], A[t]), r = reward(s2);
        S[t + 1] = s2; R[t + 1] = r;
        if (terminal(s2)) T = t + 1; else A[t + 1] = choose(s2, eps);
      }
      const tau = t - n + 1;                      // step ready to be updated
      if (tau >= 0) {
        let G = 0;                                // n-step return
        for (let i = tau + 1; i <= Math.min(tau + n, T); i++)
          G += GAMMA ** (i - tau - 1) * R[i];
        if (tau + n < T) G += GAMMA ** n * Q[S[tau + n]][A[tau + n]];   // bootstrap
        Q[S[tau]][A[tau]] += ALPHA * (G - Q[S[tau]][A[tau]]);
      }
      if (tau === T - 1) break;
      t++;
    }
  }

  // Follow the trained greedy policy from start to goal.
  let s = START, steps = 0;
  while (s !== GOAL && steps < 30) { s = step(s, best(s)); steps++; }
  return steps;                                  // 6 on this grid
}`,
  eli5: `## Praising the last few good moves, not just the last one

Imagine coaching a kid through a maze toward a prize. With plain 1-step learning you only ever tell them "that LAST move was good." Praise crawls backward one step at a time, so it takes many runs before the move at the very start gets any credit. n-step learning is like telling them "those last THREE moves were good" — credit jumps back three squares at once, and the whole path lights up far sooner.

## The n-step return, in words

For each step we wait, collect the next \`n\` rewards, discount them, then add a peek at how good things look \`n\` steps later. As a formula: \`G = r1 + γ·r2 + … + γ^(n-1)·rn + γ^n·Q(s_n, a_n)\`. We nudge \`Q\` for the move we made \`n\` steps ago toward that \`G\`. Bigger \`n\` means we trust more real, observed rewards before falling back on an estimate.

## The bias / variance trade-off

This is the whole point of choosing \`n\`. At \`n = 1\` you bootstrap immediately off a single estimate: low variance but high bias, and credit oozes back slowly. At \`n = ∞\` you wait for the entire episode — that is Monte Carlo: unbiased, but the target now depends on every random move you happened to make, so it is noisy (high variance). A middle \`n\` like 3 spreads credit fast while keeping the noise manageable.

## Pitfalls

- Episode ends inside the n-window: stop summing at the terminal step and drop the bootstrap term — there is no future to peek at.
- Bigger \`n\` propagates reward faster but adds variance; tune it.
- You must buffer the recent trajectory of states, actions, and rewards.

This is how you train a game bot to credit a whole winning combo of moves, not just its final button press — so good strategies sink in after far fewer playthroughs.`,
};

export default descriptor;
