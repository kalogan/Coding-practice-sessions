import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// PPO (Proximal Policy Optimization) on the same 5-state corridor (states 0..4,
// goal at 4). The agent starts at 0 and must walk right. As in actor-critic the
// policy is a softmax over {left, right} per state, parameterized by preferences
// theta[s][a], with a simple return baseline V(s) for advantages.
//
// What makes it PPO: each ITERATION we collect a BATCH of episodes under the
// CURRENT policy (call it π_old and freeze its action probabilities). Then we
// run several UPDATE EPOCHS over that frozen batch. In every epoch, for each
// recorded (state, action) we form the probability RATIO = π_new(a|s)/π_old(a|s)
// and maximize the CLIPPED surrogate
//     L = min( ratio · A , clip(ratio, 1−ε, 1+ε) · A )
// with advantage A. The clip is a trust region: if a single update would move
// the policy too far (ratio outside [1−ε, 1+ε]) on the helpful side, the
// gradient is cut off, so one good or bad batch can never overcorrect. ε ≈ 0.2.
// This stability is why PPO trains real game bots (OpenAI Five, Dota, etc.).
// Over ~40 iterations the policy learns to always go right; greedy = 4 steps.

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

const clip = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

// One sample (state, taken action, π_old prob of that action, advantage).
interface Sample {
  s: number;
  a: number;
  oldP: number;
  adv: number;
}

function run(input: AlgoInput): AlgoResult {
  const iterations = Math.round(input.params?.iterations ?? 40);
  const batch = Math.round(input.params?.batch ?? 8); // episodes collected per iteration
  const epochs = Math.round(input.params?.epochs ?? 4); // update passes over the batch
  const lr = input.params?.lr ?? 0.4; // policy learning rate (step size)
  const eps = input.params?.eps ?? 0.2; // PPO clip range ε
  const gamma = input.params?.gamma ?? 0.95; // discount factor
  const vLr = input.params?.valueLr ?? 0.3; // baseline (value) learning rate
  const maxSteps = Math.round(input.params?.maxSteps ?? 40); // step cap per episode

  // Deterministic seeded RNG (LCG) — no Math.random/Date, so the trace is reproducible.
  let seed = (input.params?.seed ?? 21) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  // Policy preferences theta[state][action]; value baseline V[state].
  const theta: number[][] = Array.from({ length: GOAL }, () => [0, 0]);
  const V: number[] = Array.from({ length: GOAL + 1 }, () => 0);

  const t = new Tracer();

  const optimalReturn = stepReturn(GOAL, gamma); // best-case return: walk straight to goal
  const xRange: [number, number] = [0, iterations];
  const yRange: [number, number] = [Math.min(0, optimalReturn - 1), Math.max(1, optimalReturn + 0.2)];
  const curve: Array<[number, number]> = []; // average batch return per iteration

  const pRight = (s: number): number => softmax(theta[s])[1];

  const draw = (
    iter: number,
    avgReturn: number | null,
    clipActive: boolean,
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
        xLabel: 'iteration',
        yLabel: 'avg batch return',
      },
      state: [
        { label: 'iteration', value: `${iter} / ${iterations}` },
        { label: 'avg return', value: avgReturn === null ? '—' : avgReturn.toFixed(3), highlight: true },
        { label: 'P(right | s=0)', value: pRight(0).toFixed(3) },
        { label: 'clip active', value: clipActive ? 'yes' : 'no' },
      ],
      note,
    });
  };

  draw(
    0,
    null,
    false,
    `Corridor of 5 states (0..4), goal at 4. Policy starts indifferent (P(right|0)=${pRight(0).toFixed(
      2,
    )}). PPO collects a batch of ${batch} episodes under the current policy, then does ${epochs} clipped update epochs (ε=${eps}) so no single batch overcorrects.`,
  );

  // Sample an action from a probability vector using the seeded RNG.
  const sample = (p: number[]): number => {
    const u = rand();
    let a = 0;
    let cum = 0;
    for (let i = 0; i < p.length; i++) {
      cum += p[i];
      if (u <= cum) return i;
      a = i; // fallback for float rounding on the last bucket
    }
    return a;
  };

  for (let iter = 1; iter <= iterations; iter++) {
    // ---- COLLECT: run `batch` episodes under the CURRENT (frozen) policy π_old. ----
    // We record each transition together with the action's probability under the
    // policy AT COLLECTION TIME (oldP) — that frozen number is the ratio's denominator.
    const samples: Sample[] = [];
    let batchReturnSum = 0;

    for (let b = 0; b < batch; b++) {
      let s = 0;
      let epReturn = 0;
      let steps = 0;
      const traj: Array<{ s: number; a: number; oldP: number; r: number; sNext: number; atGoal: boolean }> = [];

      while (s !== GOAL && steps < maxSteps) {
        const p = softmax(theta[s]); // π_old at this state
        const a = sample(p);
        const sNext = Math.max(0, Math.min(GOAL, s + ACTIONS[a]));
        const atGoal = sNext === GOAL;
        const reward = atGoal ? 1 : -0.05;
        epReturn += reward;
        traj.push({ s, a, oldP: p[a], r: reward, sNext, atGoal });
        s = sNext;
        steps++;
      }

      batchReturnSum += epReturn;

      // ---- ADVANTAGES via the TD/return baseline V(s). adv = r + γ·V(s') − V(s). ----
      // Also nudge V toward the TD target so the baseline tracks the policy.
      for (const tr of traj) {
        const vNext = tr.atGoal ? 0 : V[tr.sNext];
        const adv = tr.r + gamma * vNext - V[tr.s];
        V[tr.s] += vLr * adv;
        samples.push({ s: tr.s, a: tr.a, oldP: tr.oldP, adv });
      }
    }

    const avgReturn = batchReturnSum / batch;

    // ---- UPDATE: several epochs of the CLIPPED surrogate over the frozen batch. ----
    // For each sample, ratio = π_new(a|s) / π_old(a|s). The surrogate per sample is
    //   min( ratio·A , clip(ratio, 1−ε, 1+ε)·A ).
    // The clip BINDS (gradient is zeroed) when moving further would help the
    // objective yet push ratio past the trust region: i.e. (A>0 and ratio>1+ε) or
    // (A<0 and ratio<1−ε). Inside the band we follow the ordinary policy gradient.
    let clipEvents = 0;
    let updateEvents = 0;

    for (let e = 0; e < epochs; e++) {
      for (const sm of samples) {
        const p = softmax(theta[sm.s]); // π_new (changes as we update)
        const ratio = p[sm.a] / sm.oldP;
        const clipped = clip(ratio, 1 - eps, 1 + eps);

        updateEvents++;
        // Does the clipped branch win the min (so its gradient is flat → no update)?
        const unclippedObj = ratio * sm.adv;
        const clippedObj = clipped * sm.adv;
        const clipBinds = clippedObj <= unclippedObj && clipped !== ratio;
        if (clipBinds) {
          clipEvents++;
          continue; // clipped branch is flat in theta → zero gradient, skip the step
        }

        // Otherwise ascend the surrogate. d(ratio·A)/dtheta uses the softmax/score
        // gradient: chosen action up by lr·ratio·A·(1 − p[a]); others down by p[i].
        const g = lr * ratio * sm.adv;
        for (let i = 0; i < theta[sm.s].length; i++) {
          if (i === sm.a) theta[sm.s][i] += g * (1 - p[i]);
          else theta[sm.s][i] -= g * p[i];
        }
      }
    }

    const clipActive = clipEvents > 0;
    const clipPct = updateEvents > 0 ? (100 * clipEvents) / updateEvents : 0;

    curve.push([iter, avgReturn]);
    draw(
      iter,
      avgReturn,
      clipActive,
      `Iteration ${iter}: collected ${batch} episodes, avg return ${avgReturn.toFixed(2)}, then ${epochs} clipped epochs. ` +
        `P(right|0)=${pRight(0).toFixed(2)}. ` +
        (clipActive
          ? `The clip ENGAGED on ${clipPct.toFixed(0)}% of updates — the trust region stopped an oversized step.`
          : `Clip idle this round (all ratios stayed within 1±${eps}).`) +
        (avgReturn >= optimalReturn - 0.01
          ? ` That is the optimal straight-line return.`
          : ` Climbing toward the optimal return of ${optimalReturn.toFixed(2)}.`),
    );
  }

  // Run the FINAL GREEDY policy (always the most-preferred action) and count steps
  // from 0 to the goal — this is the real answer.
  let gs = 0;
  let greedySteps = 0;
  while (gs !== GOAL && greedySteps < maxSteps) {
    const a = argmax(theta[gs]);
    gs = Math.max(0, Math.min(GOAL, gs + ACTIONS[a]));
    greedySteps++;
  }

  draw(
    iterations,
    curve.length > 0 ? curve[curve.length - 1][1] : 0,
    false,
    `Done. The greedy policy (always take the top action) walks 0→1→2→3→4 and reaches the goal in ${greedySteps} steps — the optimal corridor path. Clipping kept every update small and trusted along the way.`,
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
  id: 'ppo',
  title: 'PPO: clipped policy gradient',
  category: 'Reinforcement Learning',
  difficulty: 'Hard',
  scenario:
    'A game bot crosses the same 5-tile corridor to a goal, choosing left/right by a softmax policy. PPO is how the big game bots (OpenAI Five and friends) actually train: collect a BATCH of episodes under the current policy, estimate advantages with a value baseline, then reuse that batch for several update epochs — but every update is CLIPPED so the new policy can never stray far from the one that gathered the data. Small, trusted steps make training stable enough to scale.',
  pattern:
    'PPO (clipped surrogate): freeze the data-collection policy π_old, record each action’s probability oldP, and compute advantages A. Then for several epochs maximize min(ratio·A, clip(ratio, 1−ε, 1+ε)·A) where ratio = π_new/π_old. The clip is a trust region: when a step would push ratio outside 1±ε on the helpful side, its gradient is cut, so one batch can never overcorrect. It keeps policy-gradient’s direct-policy benefits while fixing its instability — the modern default for RL.',
  complexity: 'O(iterations × batch × epochs)',
  defaultInput: {
    params: {
      iterations: 40,
      batch: 8,
      epochs: 4,
      lr: 0.4,
      eps: 0.2,
      gamma: 0.95,
      valueLr: 0.3,
      maxSteps: 40,
      seed: 21,
    },
  },
  expected: 4,
  run,
  code: `function ppo(iterations, batch, epochs, lr, eps, gamma) {
  const GOAL = 4, ACTIONS = [-1, +1];          // corridor 0..4; left / right
  const theta = Array.from({length: GOAL}, () => [0, 0]); // policy prefs per state
  const V = Array.from({length: GOAL + 1}, () => 0);      // value baseline

  const softmax = (th) => {
    const ex = th.map((x) => Math.exp(x - Math.max(...th)));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / s);
  };
  const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  for (let it = 1; it <= iterations; it++) {
    // 1) COLLECT a batch under the CURRENT policy (π_old); freeze oldP & advantages
    const data = [];
    for (let b = 0; b < batch; b++) {
      let s = 0;
      while (s !== GOAL) {
        const p = softmax(theta[s]);
        let u = rand(), cum = 0, a = 0;            // sample an action
        for (let i = 0; i < p.length; i++) { cum += p[i]; if (u <= cum) { a = i; break; } a = i; }
        const sNext = Math.max(0, Math.min(GOAL, s + ACTIONS[a]));
        const atGoal = sNext === GOAL, r = atGoal ? 1 : -0.05;
        const adv = r + gamma * (atGoal ? 0 : V[sNext]) - V[s];  // advantage
        V[s] += 0.3 * adv;                         // track the baseline
        data.push({ s, a, oldP: p[a], adv });
        s = sNext;
      }
    }

    // 2) UPDATE: several epochs of the CLIPPED surrogate over the frozen batch
    for (let e = 0; e < epochs; e++) {
      for (const d of data) {
        const p = softmax(theta[d.s]);             // π_new (moves as we update)
        const ratio = p[d.a] / d.oldP;             // π_new / π_old
        const clipped = clip(ratio, 1 - eps, 1 + eps);
        // min(ratio·A, clip·A): if the clipped branch wins, its gradient is flat → skip
        if (clipped * d.adv <= ratio * d.adv && clipped !== ratio) continue;
        const g = lr * ratio * d.adv;              // ascend the surrogate
        for (let i = 0; i < theta[d.s].length; i++)
          theta[d.s][i] += (i === d.a ? g * (1 - p[i]) : -g * p[i]);
      }
    }
  }

  // Final GREEDY policy: count steps from 0 to the goal
  let s = 0, steps = 0;
  while (s !== GOAL) { const a = theta[s][1] >= theta[s][0] ? 1 : 0; s += ACTIONS[a]; steps++; }
  return steps;                                    // = 4 (always-right corridor)
}`,
  eli5: `## The everyday picture

Imagine you're getting good at a game and you review a batch of your recent matches to adjust your strategy. One great match doesn't mean you should rip up everything and play totally differently next time — that one match might have been luck. And one terrible match shouldn't make you overhaul everything either. The smart move is to nudge your play a little in the direction the matches suggest, but never trust a single batch enough to overcorrect. That careful "improve, but only with small trusted steps" is exactly what PPO does.

## The ratio and the clip

PPO keeps a policy — at each tile, a leaning toward left vs right turned into probabilities by softmax. It plays a BATCH of episodes with the current policy, remembering how likely each move was back then (\`π_old\`). When it updates, it compares the new probability to the old one as a \`ratio = π_new / π_old\`. If an action had a positive advantage, raising its probability helps — but PPO \`clip\`s the ratio to \`[1−ε, 1+ε]\` (ε ≈ 0.2). Once the ratio leaves that band, the objective goes flat, so there's no incentive to push further. That clip is a trust region: it makes a single destructive, over-eager update impossible.

## Why this beats vanilla policy gradient

Plain REINFORCE / policy gradient takes one big gradient step per sample and can leap so far that the policy collapses — high variance, fragile training. PPO reuses each batch for several cheap epochs AND clips every step, so it learns faster and far more stably. That reliability is why PPO is the modern default and what trains real game bots like OpenAI Five.

## Common pitfalls

- ε too BIG → the clip rarely engages, so you're back to unstable, oversized steps.
- ε too SMALL → updates are throttled and learning crawls.
- Too MANY epochs on one batch → you squeeze the stale data too hard, \`π_new\` drifts far from \`π_old\`, and the policy overfits that batch.`,
};

export default descriptor;
