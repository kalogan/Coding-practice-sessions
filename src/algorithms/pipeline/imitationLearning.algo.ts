import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// Stage 6 of the bot-training pipeline: IMITATION LEARNING (behavioral cloning).
// We have a handful of expert demonstrations — (state -> action) pairs a human made.
// We train a tiny logistic-regression classifier by gradient descent to COPY them:
// minimize the cross-entropy between the model's predicted action and the human's
// action. This is plain supervised learning — the label IS the expert's action.
//
// The 4 demos are linearly separable (action 1 when feature x0 is large, else 0),
// so the model can fit all of them perfectly: it ends up classifying 4/4 correctly.

const sig = (z: number) => 1 / (1 + Math.exp(-z));

// Expert demonstrations: [feature0, feature1] -> action (0 or 1).
// Linearly separable: action = 1 exactly when x0 > x1 (a clean diagonal boundary).
const DEMOS: Array<{ x: [number, number]; a: 0 | 1 }> = [
  { x: [2, 0], a: 1 }, // human shot here
  { x: [3, 1], a: 1 }, // human shot here
  { x: [0, 2], a: 0 }, // human held here
  { x: [1, 3], a: 0 }, // human held here
];

function run(input: AlgoInput): AlgoResult {
  const lr = input.params?.lr ?? 0.5; // learning rate
  const epochs = input.params?.epochs ?? 40; // training epochs
  const t = new Tracer();

  // Fixed initial weights + bias (deterministic, NO Math.random).
  let w0 = 0;
  let w1 = 0;
  let b = 0;

  // model: P(action = 1 | state) = sigmoid(w0*x0 + w1*x1 + b)
  const predictProb = (x: readonly [number, number]) => sig(w0 * x[0] + w1 * x[1] + b);

  // cross-entropy loss averaged over the 4 demos
  const meanLoss = () => {
    let s = 0;
    for (const { x, a } of DEMOS) {
      const p = predictProb(x);
      s += -(a * Math.log(p + 1e-9) + (1 - a) * Math.log(1 - p + 1e-9));
    }
    return s / DEMOS.length;
  };

  // how many of the 4 demos the model currently predicts correctly
  const accuracyCount = () => {
    let correct = 0;
    for (const { x, a } of DEMOS) if ((predictProb(x) >= 0.5 ? 1 : 0) === a) correct++;
    return correct;
  };

  const lossHistory: Array<[number, number]> = []; // [epoch, loss]
  const xRange: [number, number] = [0, epochs];

  const draw = (note: string, done = false) => {
    const lines: ChartLine[] = [{ points: lossHistory.map(([e, l]) => [e, l] as [number, number]), role: 'plain' }];
    const points: ChartPoint[] = [];
    const last = lossHistory[lossHistory.length - 1];
    if (last) {
      points.push({ x: last[0], y: last[1], role: done ? 'match' : 'active', label: `loss=${last[1].toFixed(3)}` });
    }
    const correct = accuracyCount();
    t.step({
      view: {
        kind: 'chart',
        lines,
        points,
        xRange,
        yRange: [0, 0.8],
        xLabel: 'epoch',
        yLabel: 'cross-entropy loss',
      },
      state: [
        { label: 'epoch', value: lossHistory.length ? last[0] : 0 },
        { label: 'loss', value: meanLoss().toFixed(4), highlight: true },
        { label: 'train accuracy', value: `${correct}/${DEMOS.length}` },
      ],
      note,
    });
  };

  // epoch 0: untrained snapshot
  lossHistory.push([0, meanLoss()]);
  draw(
    `4 expert demos: (state → action) the human chose. The model starts at all-zero weights, so it guesses 0.5 for everyone — loss ${meanLoss().toFixed(3)}.`,
  );

  for (let epoch = 1; epoch <= epochs; epoch++) {
    // Full-batch gradient of mean cross-entropy w.r.t. (w0, w1, b).
    // For logistic regression, dL/dz = (p - a); chain through the inputs.
    let g0 = 0;
    let g1 = 0;
    let gb = 0;
    for (const { x, a } of DEMOS) {
      const p = predictProb(x);
      const err = p - a; // gradient of cross-entropy through the sigmoid
      g0 += err * x[0];
      g1 += err * x[1];
      gb += err;
    }
    g0 /= DEMOS.length;
    g1 /= DEMOS.length;
    gb /= DEMOS.length;

    // gradient-descent update: step every weight downhill
    w0 -= lr * g0;
    w1 -= lr * g1;
    b -= lr * gb;

    lossHistory.push([epoch, meanLoss()]);

    // trace ~every few epochs (plus the last one) to keep the animation snappy
    if (epoch % 4 === 0 || epoch === epochs) {
      const correct = accuracyCount();
      draw(
        `Epoch ${epoch}: nudged the weights against the gradient. Loss ${meanLoss().toFixed(
          3,
        )}, now matching the human on ${correct}/${DEMOS.length} demos.`,
      );
    }
  }

  const answer = accuracyCount(); // number of expert demos cloned correctly
  draw(
    `Done. The cloned policy reproduces the human's action on ${answer}/${DEMOS.length} demos — it perfectly copied the expert.`,
    true,
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'imitation-learning',
  title: 'Imitation learning (behavioral cloning)',
  category: 'Imitation Learning',
  difficulty: 'Hard',
  scenario:
    "Clone a human: in each captured state the human picked an action (shoot / hold), so we learn state → action straight from their demonstrations. Feed the (state, expert-action) pairs to a classifier and it copies what the human would do — the simplest way to bootstrap a game bot from recorded play.",
  pattern:
    'Behavioral cloning = supervised classification on (state, expert-action) pairs. A logistic/softmax model outputs P(action | state); cross-entropy loss measures how far its prediction is from the human\'s actual action; gradient descent shrinks that loss until the model reproduces the expert.',
  complexity: 'O(epochs × examples × features)',
  defaultInput: { params: { lr: 0.5, epochs: 40 } },
  expected: 4,
  run,
  code: `const sig = z => 1 / (1 + Math.exp(-z));

// expert demos: (state) -> action the human chose
const DEMOS = [
  { x: [2, 0], a: 1 }, { x: [3, 1], a: 1 },
  { x: [0, 2], a: 0 }, { x: [1, 3], a: 0 },
];

function cloneExpert(lr, epochs) {
  let w0 = 0, w1 = 0, b = 0;                  // fixed init (deterministic)
  const P = x => sig(w0*x[0] + w1*x[1] + b);  // P(action=1 | state)

  for (let e = 0; e < epochs; e++) {
    let g0 = 0, g1 = 0, gb = 0;
    for (const { x, a } of DEMOS) {
      const err = P(x) - a;                    // d(cross-entropy)/dz
      g0 += err*x[0]; g1 += err*x[1]; gb += err;
    }
    w0 -= lr*g0/DEMOS.length;                  // gradient descent
    w1 -= lr*g1/DEMOS.length;
    b  -= lr*gb/DEMOS.length;
  }
  // how many expert actions did we reproduce?
  return DEMOS.filter(({x,a}) => (P(x) >= 0.5 ? 1 : 0) === a).length;
}`,
  eli5: `## The everyday picture

Imagine a student learning chess by sitting beside a grandmaster and copying every move: "in this position the master played knight-f3, so I'll play knight-f3 too." The student isn't reasoning about why — they're just memorizing master move → master move until they can reproduce the master's choices. That's behavioral cloning.

## What problem it solves

We have recorded human gameplay: in each \`state\` the human took some \`action\`. We want a bot that, dropped into the same state, does what the human did. So we turn it into ordinary supervised learning — the \`state\` is the input and the human's \`action\` is the label — and train a classifier to predict the label.

## How it works step by step

- Each demo is a \`(state, expert-action)\` pair. The human's action IS the training label.
- The model outputs \`P(action | state)\` via a sigmoid/softmax over a weighted sum of the state features.
- \`Cross-entropy\` loss scores how far its prediction is from the human's actual action.
- \`Gradient descent\` nudges the weights to shrink that loss, epoch after epoch, until the model copies all the demos.

## Why it's the simplest way to train a bot

No reward function, no simulator, no trial-and-error — just labeled examples. If you have human demonstrations, you can clone a passable bot with the same machinery you'd use to classify spam.

## Where it breaks

- **Distribution shift / compounding errors:** the bot only ever saw the expert's states. Make one small mistake and it drifts into a state the human never visited, where it has no idea what to do — and the next mistake pushes it further off. Errors compound. The fix is **DAgger**: let the bot drive, then have the expert label the new states it stumbles into, and retrain.
- Pitfalls: it can only be as good as the demos (it copies the human's mistakes too), it ignores long-term consequences, and noisy or contradictory demonstrations confuse it.`,
};

export default descriptor;
