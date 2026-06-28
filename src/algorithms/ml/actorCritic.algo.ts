import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// ACTOR-CRITIC on a tiny 5-state corridor (states 0..4, goal at 4). The agent
// starts at 0 and must walk right to the goal. Two learners cooperate:
//   ACTOR  — a softmax policy over {left, right} per state, parameterized by
//            preferences theta[s][a]. It DECIDES what to do.
//   CRITIC — a state-value estimate V(s). It JUDGES how good a state is.
// Each step the actor samples an action; the env returns a reward and the next
// state; the critic computes the TD error delta = r + gamma*V(s') - V(s); the
// critic nudges V(s) by delta, and the actor nudges theta of the taken action by
// delta (the "advantage"). delta is a low-variance learning signal (REINFORCE
// uses the noisy raw return instead). Over episodes the policy learns to always
// go right, and the greedy policy reaches the goal in 4 steps.

const GOAL = 4; // corridor length: states 0..4
const ACTIONS = [-1, +1]; // 0 = left, 1 = right

// softmax: turn raw preferences into a probability distribution over actions.
const softmax = (theta: number[]): number[] => {
  const m = Math.max(...theta);
  const ex = theta.map((x) => Math.exp(x - m)); // subtract max for numerical stability
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / s);
};

const argmax = (xs: number[]): number => xs.indexOf(Math.max(...xs));

function run(input: AlgoInput): AlgoResult {
  const numEpisodes = Math.round(input.params?.episodes ?? 40);
  const aLr = input.params?.actorLr ?? 0.3; // actor learning rate
  const cLr = input.params?.criticLr ?? 0.3; // critic learning rate
  const gamma = input.params?.gamma ?? 0.95; // discount factor
  const maxSteps = Math.round(input.params?.maxSteps ?? 40); // step cap per episode

  // Deterministic seeded RNG (LCG) — no Math.random/Date, so the trace is reproducible.
  let seed = (input.params?.seed ?? 11) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  // ACTOR preferences theta[state][action]; CRITIC value V[state]. Goal is terminal.
  const theta: number[][] = Array.from({ length: GOAL }, () => [0, 0]);
  const V: number[] = Array.from({ length: GOAL + 1 }, () => 0);

  const t = new Tracer();

  const optimalReturn = stepReturn(GOAL, gamma); // best-case return: walk straight to goal
  const xRange: [number, number] = [0, numEpisodes];
  const yRange: [number, number] = [Math.min(0, optimalReturn - 1), Math.max(1, optimalReturn + 0.2)];
  const curve: Array<[number, number]> = []; // episode return per episode

  const pRight = (s: number): number => softmax(theta[s])[1];

  const draw = (
    episode: number,
    epReturn: number | null,
    note: string,
    done = false,
  ) => {
    const points: ChartPoint[] = [];
    if (curve.length > 0) {
      const [lx, ly] = curve[curve.length - 1];
      points.push({
        x: lx,
        y: ly,
        role: done ? 'match' : 'active',
        label: `return=${ly.toFixed(2)}`,
      });
    }
    t.step({
      view: {
        kind: 'chart',
        lines: [{ points: curve.slice(), role: 'plain' }],
        points,
        xRange,
        yRange,
        xLabel: 'episode',
        yLabel: 'episode return',
      },
      state: [
        { label: 'episode', value: `${episode} / ${numEpisodes}` },
        { label: 'return', value: epReturn === null ? '—' : epReturn.toFixed(3), highlight: true },
        { label: 'V(0)', value: V[0].toFixed(3) },
        { label: 'P(right | s=0)', value: pRight(0).toFixed(3) },
      ],
      note,
    });
  };

  draw(
    0,
    null,
    `Corridor of 5 states (0..4), goal at 4. Actor starts indifferent (P(right|0)=${pRight(0).toFixed(2)}) and the critic starts with V≡0. Each episode the actor walks until it reaches the goal; the critic's TD error teaches both.`,
  );

  for (let ep = 1; ep <= numEpisodes; ep++) {
    let s = 0;
    let epReturn = 0;
    let steps = 0;

    while (s !== GOAL && steps < maxSteps) {
      const p = softmax(theta[s]); // actor's policy at this state

      // SAMPLE an action from the policy using the seeded RNG against cumulative p.
      const u = rand();
      let a = 0;
      let cum = 0;
      for (let i = 0; i < p.length; i++) {
        cum += p[i];
        if (u <= cum) {
          a = i;
          break;
        }
        a = i; // fallback for float rounding on the last bucket
      }

      // ENV step: move, clamp at the left wall, reward -0.05 per step (+1 at goal).
      const sNext = Math.max(0, Math.min(GOAL, s + ACTIONS[a]));
      const atGoal = sNext === GOAL;
      const reward = atGoal ? 1 : -0.05;
      epReturn += reward;

      // CRITIC: TD error delta = r + gamma*V(s') - V(s)  (V(goal)=0, terminal).
      const vNext = atGoal ? 0 : V[sNext];
      const delta = reward + gamma * vNext - V[s];

      // CRITIC update: nudge V(s) toward the TD target.
      V[s] += cLr * delta;

      // ACTOR update: nudge theta of the taken action by delta (the advantage).
      // chosen action up by aLr*delta*(1 - p[a]); the other down by aLr*delta*p[i].
      for (let i = 0; i < theta[s].length; i++) {
        if (i === a) theta[s][i] += aLr * delta * (1 - p[i]);
        else theta[s][i] -= aLr * delta * p[i];
      }

      s = sNext;
      steps++;
    }

    curve.push([ep, epReturn]);
    draw(
      ep,
      epReturn,
      `Episode ${ep}: walked to the goal in ${steps} steps for a return of ${epReturn.toFixed(2)}. ` +
        `The critic now values the start at V(0)=${V[0].toFixed(2)} and the actor prefers right with P(right|0)=${pRight(0).toFixed(2)}. ` +
        (epReturn >= optimalReturn - 0.01
          ? `That is the optimal straight-line return.`
          : `Still tightening toward the optimal return of ${optimalReturn.toFixed(2)}.`),
    );
  }

  // Run the FINAL GREEDY policy (always pick the most-preferred action) and count
  // steps from 0 to the goal — this is the real answer.
  let gs = 0;
  let greedySteps = 0;
  while (gs !== GOAL && greedySteps < maxSteps) {
    const a = argmax(theta[gs]);
    gs = Math.max(0, Math.min(GOAL, gs + ACTIONS[a]));
    greedySteps++;
  }

  draw(
    numEpisodes,
    curve.length > 0 ? curve[curve.length - 1][1] : 0,
    `Done. The greedy policy (always take the actor's top action) walks 0→1→2→3→4 and reaches the goal in ${greedySteps} steps — the optimal corridor path.`,
    true,
  );

  return { steps: t.steps, answer: greedySteps };
}

// Best-case return: (length-1) penalized steps then a +1 goal step, discounted.
function stepReturn(length: number, gamma: number): number {
  let ret = 0;
  let g = 1;
  for (let i = 0; i < length; i++) {
    const r = i === length - 1 ? 1 : -0.05;
    ret += g * r;
    g *= gamma;
  }
  return ret;
}

const descriptor: AlgoDescriptor = {
  id: 'actor-critic',
  title: 'Actor-Critic',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  scenario:
    'A game bot must cross a 5-tile corridor to reach a goal. An ACTOR (a softmax policy over left/right at each tile) decides moves; a CRITIC (a value estimate V(s) for each tile) judges how good each tile is. Every step the critic computes a TD error — how much better or worse things turned out than expected — and that single number trains both: it corrects V(s) and tells the actor whether to do that move more or less. The policy learns to always walk right.',
  pattern:
    'Actor-Critic: keep a parameterized policy (actor) AND a value function (critic). Per step, sample an action, observe reward r and next state s′, then form the TD error delta = r + gamma·V(s′) − V(s). Update the critic V(s) += cLr·delta and the actor theta[s][a] += aLr·delta·(1 − p[a]) (others down). delta is the advantage — a low-variance learning signal versus REINFORCE’s raw return. This actor+value combination is the backbone of A2C and PPO.',
  complexity: 'O(episodes × steps)',
  defaultInput: {
    params: { episodes: 40, actorLr: 0.3, criticLr: 0.3, gamma: 0.95, maxSteps: 40, seed: 11 },
  },
  expected: 4,
  run,
  code: `function actorCritic(episodes, aLr, cLr, gamma) {
  const GOAL = 4, ACTIONS = [-1, +1];      // corridor 0..4; left / right
  const theta = Array.from({length: GOAL}, () => [0, 0]); // ACTOR prefs per state
  const V = Array.from({length: GOAL + 1}, () => 0);      // CRITIC value per state

  const softmax = (th) => {
    const ex = th.map((x) => Math.exp(x - Math.max(...th)));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / s);
  };

  for (let ep = 1; ep <= episodes; ep++) {
    let s = 0;
    while (s !== GOAL) {
      const p = softmax(theta[s]);             // actor's policy here
      // SAMPLE an action from the policy
      let u = rand(), cum = 0, a = 0;
      for (let i = 0; i < p.length; i++) { cum += p[i]; if (u <= cum) { a = i; break; } a = i; }

      const sNext = Math.max(0, Math.min(GOAL, s + ACTIONS[a]));
      const atGoal = sNext === GOAL;
      const reward = atGoal ? 1 : -0.05;       // step penalty, goal bonus

      // CRITIC: TD error = r + gamma·V(s') − V(s)  (V(goal)=0)
      const delta = reward + gamma * (atGoal ? 0 : V[sNext]) - V[s];
      V[s] += cLr * delta;                     // critic nudges its value

      // ACTOR: nudge taken action by delta (the advantage)
      for (let i = 0; i < theta[s].length; i++) {
        if (i === a) theta[s][i] += aLr * delta * (1 - p[i]);
        else         theta[s][i] -= aLr * delta * p[i];
      }
      s = sNext;
    }
  }

  // Final GREEDY policy: count steps from 0 to the goal
  let s = 0, steps = 0;
  while (s !== GOAL) { const a = theta[s][1] >= theta[s][0] ? 1 : 0; s += ACTIONS[a]; steps++; }
  return steps;                                // = 4 (always-right corridor)
}`,
  eli5: `## The everyday picture

Picture an actor on stage trying out moves, with a coach watching from the wings. The actor doesn't know in advance which move is good — they just try one. After each try the coach doesn't replay the whole scene; they give one quick reaction: "that was better than I expected" or "worse than I expected." The actor leans into the moves the coach liked and away from the ones they didn't. That pair — a doer and a judge — is Actor-Critic.

## Who does what

- The ACTOR is a policy: at each tile of the corridor it holds a leaning toward left vs right, turned into probabilities by softmax. It picks the move.
- The CRITIC is a value estimate \`V(s)\`: a guess of how good each tile is. It picks nothing — it only judges.

## The TD error is the signal

After a move from \`s\` to \`s'\` with reward \`r\`, the critic computes \`delta = r + gamma·V(s') − V(s)\` — the gap between what actually happened and what it expected. That single number does double duty: the critic nudges \`V(s)\` to shrink the gap, and the actor nudges its leaning for the move it just took by \`delta\`. A positive \`delta\` means "better than expected, do it more."

## Why this beats raw returns

REINFORCE waits for the whole episode and learns from the noisy total return, so its updates jump around. The critic's \`delta\` is a much steadier, lower-variance signal, so learning is smoother and faster.

## Why it matters

Combining a policy with a value function is exactly the recipe behind A2C and PPO — the algorithms that train real game bots and robots. Learn the toy corridor and you understand the skeleton of the big ones.

## Common pitfalls

- TWO learning rates to balance: the critic must keep up, or the actor learns from a value estimate that's still wrong.
- Too-fast actor + too-slow critic = the policy chases a moving, unreliable target and can thrash.`,
};

export default descriptor;
