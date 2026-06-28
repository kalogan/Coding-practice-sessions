import type { AlgoDescriptor, AlgoInput, AlgoResult, BarRole } from '../types';
import { Tracer } from '../tracer';

// Epsilon-greedy multi-armed bandit (explore vs exploit).
// Scenario: a game bot must repeatedly choose among K actions (weapons / strategies)
// with unknown payoffs. Each "pull" of an arm returns a reward; epsilon-greedy
// mostly exploits the best-known arm but occasionally explores a random one, so it
// can discover a better arm it would otherwise never try.

// Hidden TRUE win-probabilities. Arm 2 (0.8) is genuinely the best — the bot does
// NOT know these; it must estimate them from observed rewards.
const TRUE_P = [0.2, 0.5, 0.8, 0.3];

/** index of the largest value in `arr` (first max on ties). */
function argmax(arr: number[]): number {
  let best = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[best]) best = i;
  }
  return best;
}

function run(input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Deterministic seeded LCG — no Math.random / Date so the trace is reproducible.
  let seed = (input.params?.seed ?? 12345) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const k = TRUE_P.length;
  const pulls = Math.max(1, Math.round(input.params?.pulls ?? 80));
  const epsilon = input.params?.epsilon ?? 0.1;

  const Q = new Array(k).fill(0); // running average reward estimate per arm
  const N = new Array(k).fill(0); // number of pulls per arm
  let totalReward = 0;

  // Scale the (0..1) estimates to integers so they render as bar heights.
  const scale = (q: number) => Math.round(q * 100);

  for (let pull = 1; pull <= pulls; pull++) {
    // The arm we currently believe is best (used both for the colour and to exploit).
    const greedy = argmax(Q);

    // With probability epsilon EXPLORE a random arm; otherwise EXPLOIT the greedy arm.
    const explore = rand() < epsilon;
    const chosen = explore ? Math.floor(rand() * k) : greedy;

    // Pull the chosen arm: Bernoulli reward via its hidden true probability.
    const reward = rand() < TRUE_P[chosen] ? 1 : 0;
    totalReward += reward;

    // Incremental average update: Q[a] += (reward - Q[a]) / N[a].
    N[chosen] += 1;
    Q[chosen] += (reward - Q[chosen]) / N[chosen];

    // Recompute the believed-best arm AFTER the update for the 'sorted' highlight.
    const bestNow = argmax(Q);

    // Colour: chosen arm is 'swap' if it was an explore step, else 'compare';
    // the current argmax arm is 'sorted' (unless it is also the chosen arm).
    const bars: BarRole[] = Q.map((_, a) => {
      if (a === chosen) return explore ? 'swap' : 'compare';
      if (a === bestNow) return 'sorted';
      return 'plain';
    });

    t.step({
      view: {
        kind: 'array',
        values: Q.map(scale),
        markers: [],
        bars,
      },
      state: [
        { label: 'pull', value: pull },
        { label: 'mode', value: explore ? 'explore' : 'exploit', highlight: explore },
        { label: 'arm', value: chosen },
        { label: 'reward', value: reward, highlight: reward === 1 },
        { label: 'N', value: `[${N.join(', ')}]` },
        { label: 'Q×100', value: `[${Q.map(scale).join(', ')}]` },
        { label: 'best arm', value: bestNow, highlight: true },
        { label: 'total reward', value: totalReward },
      ],
      note: explore
        ? `Pull ${pull}: EXPLORE — rolled below epsilon (${epsilon}), so try random arm ${chosen}. It paid ${reward}. New estimate Q[${chosen}]=${Q[chosen].toFixed(3)}.`
        : `Pull ${pull}: EXPLOIT — pick the best-known arm ${chosen} (Q=${Q[chosen].toFixed(3)}). It paid ${reward}. Updated Q[${chosen}]=${Q[chosen].toFixed(3)}.`,
    });
  }

  const answer = argmax(Q);

  // Final snapshot: the believed-best arm settled.
  t.step({
    view: {
      kind: 'array',
      values: Q.map(scale),
      markers: [],
      bars: Q.map((_, a) => (a === answer ? 'sorted' : 'plain')),
    },
    state: [
      { label: 'pulls', value: pulls },
      { label: 'Q×100', value: `[${Q.map(scale).join(', ')}]` },
      { label: 'total reward', value: totalReward },
      { label: 'answer (best arm)', value: answer, highlight: true },
    ],
    note: `After ${pulls} pulls the bot's estimates converge to the true means; arm ${answer} has the highest Q, so the bot believes it is best.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'bandit-epsilon-greedy',
  title: 'Multi-armed bandit (epsilon-greedy)',
  category: 'Reinforcement Learning',
  scenario:
    'A game bot must repeatedly choose one of several actions (weapons, strategies) whose payoffs it does not know. Each choice yields a reward. Epsilon-greedy spends most pulls exploiting the arm that looks best so far, but every so often it explores a random arm so it can discover something better than its current favourite.',
  pattern:
    'Explore vs exploit with online averages: keep a running estimate Q[a] and count N[a] per action, updated incrementally as Q[a] += (reward - Q[a]) / N[a]. Each step, with probability epsilon pick a random arm, otherwise pick argmax Q. As pulls accumulate, the estimates converge to the true means and argmax Q lands on the genuinely-best action.',
  complexity: 'O(pulls) time · O(K) space',
  difficulty: 'Medium',
  eli5: `## The everyday picture

Imagine a row of slot machines (a "bandit" has one arm; this is "multi-armed"). Each machine pays out at a different secret rate, and you don't know which is best. You have a limited number of pulls. Every pull is a gamble between two urges: keep yanking the machine that has paid best SO FAR (exploit), or try a different machine in case it's secretly better (explore). Same dilemma as picking a restaurant: do you revisit your favourite, or risk a new place that might be even better?

## What epsilon does

Epsilon is a small dial (here \`0.1\`). Most of the time — 90% — the bot exploits: it pulls the arm with the highest current estimate \`Q\`. The other 10% it explores: it picks a totally random arm. That tiny stream of random tries is what saves it.

## Why pure greedy gets stuck

If you only ever exploit, an unlucky-but-good arm that paid 0 on its first try gets written off forever, while a lucky-but-mediocre arm that paid 1 early hogs every pull. The bot commits to a wrong early winner and never learns the truth. Exploration is the escape hatch.

## How averages find the truth

Each arm keeps a running average of its rewards. By the law of large numbers — in plain words, "do something enough times and the average stops lying" — \`Q[a]\` drifts toward the arm's real win-rate. With ~80 pulls the estimates separate cleanly and \`argmax Q\` reliably points at the truly-best arm (index 2, true rate 0.8).

## Pitfalls

- Epsilon too LOW: barely explores, can stay stuck on a wrong early winner.
- Epsilon too HIGH: keeps throwing pulls at known-bad arms, never commits to the winner.
- Non-stationary rewards: if an arm's true payoff CHANGES over time (a weapon gets nerfed), a plain running average reacts too slowly — you'd switch to a fixed step size to track the shift.

## Tie to game bots

A bot choosing moves, weapons, or strategies faces exactly this: it must keep winning now while still scouting for a better option, balancing the two with a single epsilon knob.`,
  defaultInput: { params: { seed: 12345, pulls: 80, epsilon: 0.1 } },
  expected: 2,
  run,
  code: `const TRUE_P = [0.2, 0.5, 0.8, 0.3]; // hidden true win-rates

function bandit({ seed = 12345, pulls = 80, epsilon = 0.1 }) {
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const k = TRUE_P.length;
  const Q = Array(k).fill(0), N = Array(k).fill(0);
  const argmax = (a) => a.reduce((b, v, i) => (v > a[b] ? i : b), 0);

  for (let pull = 1; pull <= pulls; pull++) {
    const explore = rand() < epsilon;
    const a = explore ? Math.floor(rand() * k) : argmax(Q);
    const reward = rand() < TRUE_P[a] ? 1 : 0;   // Bernoulli pull
    N[a] += 1;
    Q[a] += (reward - Q[a]) / N[a];              // incremental average
  }
  return argmax(Q); // the arm the bot believes is best
}`,
};

export default descriptor;
