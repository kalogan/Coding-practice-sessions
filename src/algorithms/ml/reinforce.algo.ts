import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// REINFORCE — the simplest policy-gradient method, and how a game bot can learn
// to PICK actions directly. A bot at one state holds 3 action "preferences"
// (theta). Its policy is the softmax of those preferences. Each episode it SAMPLES
// an action from the policy, sees that action's reward, then nudges theta so the
// actions that paid off become more likely. With a running-mean baseline to cut
// variance, theta converges and the policy locks onto the best action (index 1).

// True (hidden) reward of each action. Action 1 is best.
const R = [0.0, 1.0, 0.3];

// softmax: turn raw preferences into a probability distribution over actions.
const softmax = (theta: number[]): number[] => {
  const m = Math.max(...theta);
  const ex = theta.map((x) => Math.exp(x - m)); // subtract max for numerical stability
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / s);
};

const argmax = (xs: number[]): number => xs.indexOf(Math.max(...xs));

const fmtP = (p: number[]): string => `[${p.map((x) => x.toFixed(2)).join(' ')}]`;

function run(input: AlgoInput): AlgoResult {
  const numEpisodes = Math.round(input.params?.episodes ?? 80);
  const lr = input.params?.lr ?? 0.2; // learning rate (step size)

  // Deterministic seeded RNG (LCG) — no Math.random/Date, so the trace is reproducible.
  let seed = (input.params?.seed ?? 7) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const theta = [0, 0, 0]; // action preferences (start indifferent)
  let baseline = 0; // running mean reward — our variance-reducing baseline
  let avgReward = 0; // running-average reward, plotted vs episode

  const t = new Tracer();

  const xRange: [number, number] = [0, numEpisodes];
  const yRange: [number, number] = [0, 1];
  const curve: Array<[number, number]> = []; // running-average reward per episode

  const draw = (
    episode: number,
    p: number[],
    lastReward: number | null,
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
        label: `avg=${ly.toFixed(2)}`,
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
        yLabel: 'avg reward',
      },
      state: [
        { label: 'episode', value: `${episode} / ${numEpisodes}` },
        { label: 'policy p', value: `p=${fmtP(p)}` },
        { label: 'last reward', value: lastReward === null ? '—' : lastReward.toFixed(2) },
        { label: 'avg reward', value: avgReward.toFixed(3), highlight: true },
      ],
      note,
    });
  };

  // initial policy: uniform, since all preferences are 0
  draw(
    0,
    softmax(theta),
    null,
    `Start indifferent: theta=[0 0 0] so the policy is uniform p=${fmtP(softmax(theta))}. The bot will try actions, then do more of whatever pays off.`,
  );

  for (let ep = 1; ep <= numEpisodes; ep++) {
    const p = softmax(theta); // current policy

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

    const reward = R[a];

    // running averages (avg reward for the plot, baseline for the update)
    avgReward = avgReward + (reward - avgReward) / ep;
    baseline = baseline + (reward - baseline) / ep;

    // REINFORCE update with baseline:
    //   chosen action a: push its preference UP by lr*(reward-b)*(1 - p[a])
    //   others a':       push their preference DOWN by lr*(reward-b)*p[a']
    // (reward - baseline) is the "advantage": better-than-average outcomes raise
    // the chosen action's probability; worse-than-average lower it.
    const adv = reward - baseline;
    for (let i = 0; i < theta.length; i++) {
      if (i === a) theta[i] += lr * adv * (1 - p[i]);
      else theta[i] -= lr * adv * p[i];
    }

    curve.push([ep, avgReward]);
    const pAfter = softmax(theta);
    draw(
      ep,
      pAfter,
      reward,
      `Episode ${ep}: sampled action ${a} (reward ${reward.toFixed(2)}). Advantage = reward − baseline = ${reward.toFixed(2)} − ${baseline.toFixed(2)} = ${adv.toFixed(2)}. ` +
        (adv >= 0
          ? `Above average → push action ${a} UP. New policy p=${fmtP(pAfter)}.`
          : `Below average → push action ${a} DOWN. New policy p=${fmtP(pAfter)}.`),
    );
  }

  const finalP = softmax(theta);
  const answer = argmax(finalP); // the action the final policy prefers
  draw(
    numEpisodes,
    finalP,
    R[answer],
    `Done. The policy converged to p=${fmtP(finalP)} — it now overwhelmingly prefers action ${answer}, the highest-reward choice.`,
    true,
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'reinforce',
  title: 'REINFORCE: policy gradient',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  scenario:
    'A game bot at one decision point holds three action preferences and acts by softmax over them — a policy. Each episode it samples an action, sees a reward, and REINFORCE nudges the preferences so high-reward actions grow more likely. It tunes the policy DIRECTLY, no value table needed.',
  pattern:
    'Policy gradient: parameterize a policy p = softmax(theta), sample an action, then move theta along the gradient of expected reward — for the chosen action a, theta[a] += lr·(reward − baseline)·(1 − p[a]); others move down. A running-mean baseline subtracts the average reward to cut variance and stabilize learning.',
  complexity: 'O(episodes) — one cheap sample-and-update per episode',
  defaultInput: { params: { episodes: 80, lr: 0.2, seed: 7 } },
  expected: 1,
  run,
  code: `function reinforce(episodes, lr) {
  const R = [0.0, 1.0, 0.3];          // hidden reward per action (1 is best)
  const theta = [0, 0, 0];            // action preferences
  let baseline = 0;                   // running mean reward (variance reducer)

  const softmax = (th) => {
    const ex = th.map((x) => Math.exp(x - Math.max(...th)));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / s);
  };

  for (let ep = 1; ep <= episodes; ep++) {
    const p = softmax(theta);
    // SAMPLE an action from the policy
    let u = rand(), cum = 0, a = 0;
    for (let i = 0; i < p.length; i++) { cum += p[i]; if (u <= cum) { a = i; break; } a = i; }

    const reward = R[a];
    baseline += (reward - baseline) / ep;     // update running mean
    const adv = reward - baseline;            // advantage

    // REINFORCE update: chosen action up, others down, scaled by advantage
    for (let i = 0; i < theta.length; i++) {
      if (i === a) theta[i] += lr * adv * (1 - p[i]);
      else         theta[i] -= lr * adv * p[i];
    }
  }

  const p = softmax(theta);
  return p.indexOf(Math.max(...p));   // the action the policy now prefers
}`,
  eli5: `## The everyday picture

Imagine a slot-machine room with three levers and you don't know which pays best. You don't keep a notebook of each lever's value. Instead you keep a gut feeling — a leaning toward each lever — and you pull one at random in proportion to how much you lean toward it. When a pull pays well, you lean a bit MORE toward that lever next time. Try things, then do more of what paid off. That's REINFORCE.

## The softmax policy

The bot's three leanings are numbers called \`theta\`. To turn them into actual pull-probabilities we run \`softmax\`: bigger leanings get bigger shares, and all three shares add to 1. So the policy is literally a dice roll the bot tilts in its own favor.

## Why we multiply by the reward

After sampling action \`a\` and seeing its \`reward\`, we nudge \`theta[a]\` UP by an amount proportional to the reward (and pull the others down a touch). Good outcomes push their action's probability up; bad outcomes push it down. Over many episodes the leaning piles onto whichever lever pays most.

## The baseline

Raw rewards are noisy, so the updates jump around. We subtract a \`baseline\` — the average reward so far — and use \`reward − baseline\` (the "advantage"). Now only better-than-average results raise an action and worse-than-average lower it. This cuts the variance and makes learning steady instead of jittery.

## How this differs from value methods

Q-learning learns the VALUE of each action, then picks the best. REINFORCE skips that and tunes the policy directly. That's a big deal when there are millions of actions or continuous ones (steering angles, aim) — you can't tabulate values, but you can still nudge a policy.

## Complexity

One sample and one cheap update per episode: \`O(episodes)\`. Real bots do the same with a neural net producing \`theta\`.

## Common pitfalls

- High variance — without a baseline the noisy rewards make learning wander.
- Learning rate — too high overshoots and the policy thrashes; too low barely moves.
- It can settle on a decent-but-not-best action if it stops exploring too early.`,
};

export default descriptor;
