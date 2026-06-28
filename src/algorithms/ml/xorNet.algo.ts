import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// A 2-3-1 sigmoid neural network learns XOR end-to-end by full-batch backprop.
// XOR is the classic proof that neural nets learn NON-LINEAR functions: you cannot
// separate its two classes with a single straight line, so a perceptron fails — but
// add ONE hidden layer and the net learns the curved decision boundary. We train on
// all four examples at once (full-batch gradient descent) from FIXED initial weights
// (deterministic, NO Math.random), watching the mean-squared-error loss fall to ~0.

const sig = (z: number) => 1 / (1 + Math.exp(-z));

// the four XOR examples and their targets
const inputs: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
const targets = [0, 1, 1, 0];

function run(input: AlgoInput): AlgoResult {
  const lr = input.params?.lr ?? 0.5; // learning rate (full-batch gradient sum)
  const epochs = Math.round(input.params?.epochs ?? 5000);
  const H = 3; // hidden units: a 2-3-1 net
  const t = new Tracer();

  // FIXED initial weights/biases — deterministic and tuned to converge.
  // W1[i][j]: input i -> hidden j ; W2[j]: hidden j -> output
  let W1: number[][] = [
    [0.5, -0.4, 0.3],
    [-0.5, 0.4, 0.6],
  ];
  let b1 = [0.1, -0.2, 0.3];
  const W2 = [0.6, -0.7, 0.5];
  let b2 = -0.1;

  // forward pass for one input -> { hidden activations, output }
  const forward = (x: [number, number]) => {
    const h = b1.map((bj, j) => sig(W1[0][j] * x[0] + W1[1][j] * x[1] + bj));
    const o = sig(W2.reduce((s, wj, j) => s + wj * h[j], 0) + b2);
    return { h, o };
  };

  // outputs + mean-squared-error loss across all four examples
  const evalAll = () => {
    const outs = inputs.map((x) => forward(x).o);
    const mse = outs.reduce((s, o, n) => s + (o - targets[n]) * (o - targets[n]), 0) / inputs.length;
    return { outs, mse };
  };

  const curve: Array<[number, number]> = []; // loss vs epoch
  const xRange: [number, number] = [0, epochs];
  const yRange: [number, number] = [0, 0.3];

  // ~40 evenly-spaced snapshots over training
  const SNAPSHOTS = 40;
  const every = Math.max(1, Math.floor(epochs / SNAPSHOTS));

  const draw = (epoch: number, note: string, done = false) => {
    const { outs, mse } = evalAll();
    const points: ChartPoint[] = [{ x: epoch, y: mse, role: done ? 'match' : 'active', label: `loss=${mse.toFixed(4)}` }];
    t.step({
      view: {
        kind: 'chart',
        lines: [{ points: curve.map(([a, b]) => [a, b] as [number, number]) }],
        points,
        xRange,
        yRange,
        xLabel: 'epoch',
        yLabel: 'MSE loss',
      },
      state: [
        { label: 'epoch', value: epoch },
        { label: 'loss (MSE)', value: mse.toFixed(5), highlight: true },
        { label: 'pred [0,0]→0', value: outs[0].toFixed(3) },
        { label: 'pred [0,1]→1', value: outs[1].toFixed(3) },
        { label: 'pred [1,0]→1', value: outs[2].toFixed(3) },
        { label: 'pred [1,1]→0', value: outs[3].toFixed(3) },
      ],
      note,
    });
  };

  // record the starting loss
  curve.push([0, evalAll().mse]);
  draw(
    0,
    `A 2-3-1 sigmoid net with FIXED initial weights. XOR can't be split by one straight line, so we need the hidden layer. Loss starts at ${evalAll().mse.toFixed(4)}.`,
  );

  for (let epoch = 1; epoch <= epochs; epoch++) {
    // FULL-BATCH backprop: accumulate gradients over all four examples
    const gW1 = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const gb1 = [0, 0, 0];
    const gW2 = [0, 0, 0];
    let gb2 = 0;

    inputs.forEach((x, n) => {
      const { h, o } = forward(x);
      const dO = 2 * (o - targets[n]) * o * (1 - o); // dL/dz_out
      for (let j = 0; j < H; j++) gW2[j] += dO * h[j];
      gb2 += dO;
      const dZ1 = h.map((hj, j) => dO * W2[j] * hj * (1 - hj)); // chain rule into hidden layer
      for (let j = 0; j < H; j++) {
        gW1[0][j] += dZ1[j] * x[0];
        gW1[1][j] += dZ1[j] * x[1];
        gb1[j] += dZ1[j];
      }
    });

    // gradient-descent update on every weight
    for (let j = 0; j < H; j++) W2[j] -= lr * gW2[j];
    b2 -= lr * gb2;
    W1 = [
      [W1[0][0] - lr * gW1[0][0], W1[0][1] - lr * gW1[0][1], W1[0][2] - lr * gW1[0][2]],
      [W1[1][0] - lr * gW1[1][0], W1[1][1] - lr * gW1[1][1], W1[1][2] - lr * gW1[1][2]],
    ];
    b1 = [b1[0] - lr * gb1[0], b1[1] - lr * gb1[1], b1[2] - lr * gb1[2]];

    if (epoch % every === 0 || epoch === epochs) {
      const mse = evalAll().mse;
      curve.push([epoch, mse]);
      draw(epoch, `Epoch ${epoch}: full-batch step on all 4 examples. Loss = ${mse.toFixed(5)} — sliding down the curve.`);
    }
  }

  // final tally: how many of the 4 XOR inputs are classified correctly
  const { outs } = evalAll();
  const correct = outs.filter((o, n) => Math.round(o) === targets[n]).length;
  draw(
    epochs,
    `Trained. Predictions round to ${outs.map((o) => Math.round(o)).join(', ')} vs targets ${targets.join(', ')} — ${correct} of 4 correct.`,
    true,
  );

  return { steps: t.steps, answer: correct };
}

const descriptor: AlgoDescriptor = {
  id: 'xor-net',
  title: 'Neural net learns XOR',
  category: 'Machine Learning',
  difficulty: 'Hard',
  scenario:
    "XOR is the classic test of whether a bot's brain can learn a non-linear rule: output 1 only when the two inputs differ. No single straight line separates its classes, so a bare perceptron fails. Give the net one hidden layer and train it by backprop, and it carves out the curved boundary on its own.",
  pattern:
    'Multi-layer net + full-batch backprop. Forward: each layer computes sigmoid(weighted sum). Loss is mean-squared error over all four examples. Backprop applies the chain rule from output to hidden layer to get every gradient; sum the gradients over the whole batch and take one gradient-descent step. Repeat for thousands of epochs until the loss collapses to ~0.',
  complexity: 'O(epochs × weights)',
  defaultInput: { params: { lr: 0.5, epochs: 5000 } },
  expected: 4,
  run,
  code: `const sig = z => 1 / (1 + Math.exp(-z));
const inputs  = [[0,0],[0,1],[1,0],[1,1]];
const targets = [0, 1, 1, 0];                  // XOR: 1 when inputs differ

function trainXOR(lr, epochs) {
  // 2-3-1 net, FIXED initial weights (deterministic — no Math.random)
  let W1 = [[0.5,-0.4,0.3],[-0.5,0.4,0.6]], b1 = [0.1,-0.2,0.3];
  let W2 = [0.6,-0.7,0.5], b2 = -0.1;
  const fwd = x => {
    const h = b1.map((bj,j) => sig(W1[0][j]*x[0] + W1[1][j]*x[1] + bj));
    const o = sig(W2.reduce((s,wj,j) => s + wj*h[j], 0) + b2);
    return { h, o };
  };
  for (let e = 0; e < epochs; e++) {
    const gW1=[[0,0,0],[0,0,0]], gb1=[0,0,0], gW2=[0,0,0]; let gb2=0;
    inputs.forEach((x,n) => {                  // FULL-BATCH: sum grads over all 4
      const { h, o } = fwd(x);
      const dO = 2*(o-targets[n]) * o*(1-o);    // dLoss/dz_out
      h.forEach((hj,j) => { gW2[j]+=dO*hj; });  gb2+=dO;
      const dZ1 = h.map((hj,j) => dO*W2[j] * hj*(1-hj));   // chain rule -> hidden
      dZ1.forEach((d,j) => { gW1[0][j]+=d*x[0]; gW1[1][j]+=d*x[1]; gb1[j]+=d; });
    });
    W2 = W2.map((w,j) => w - lr*gW2[j]); b2 -= lr*gb2;     // gradient-descent step
    W1 = W1.map((row,i) => row.map((w,j) => w - lr*gW1[i][j]));
    b1 = b1.map((b,j) => b - lr*gb1[j]);
  }
  const outs = inputs.map(x => fwd(x).o);
  return outs.filter((o,n) => Math.round(o) === targets[n]).length;  // 4 when solved
}`,
  eli5: `## The everyday picture

XOR means "one or the other, but not both" — the light turns on only when the two switches disagree. Plot the four cases on a square: the two ON corners sit on one diagonal, the two OFF corners on the other. Try to draw a SINGLE straight line that puts the ONs on one side and OFFs on the other — you can't. That's why XOR famously broke the early single-layer perceptron.

## Why a hidden layer fixes it

The trick is to bend the space first. The hidden neurons each learn a simple line-shaped feature — roughly an OR-ish detector and an AND-ish detector. Combine "fires when EITHER input is on" with "fires when BOTH are on" and the output neuron can express "either but not both." One hidden layer turns an impossible straight-line problem into an easy one.

## How training works

- **Forward:** push each input through the net; every neuron computes \`sigmoid(weighted sum)\`, ending in a prediction.
- **Loss:** mean-squared error of all four predictions versus their targets.
- **Backprop:** the chain rule pushes the error backward, giving every weight its gradient.
- **Full-batch step:** sum gradients over all four examples and nudge each weight downhill. Repeat for thousands of epochs.

## Why the loss plateaus then drops

Early on every prediction hovers near 0.5 and the gradients are tiny, so the curve looks flat — the net is still untangling the two features. Once the hidden units lock onto useful AND/OR shapes, the error cascades down quickly toward zero.

## Common pitfalls

- Bad initial weights — a net can stall in a flat region and never separate the classes.
- Too small a net (no hidden layer) literally cannot represent XOR.
- Learning rate too high oscillates or diverges; too low crawls and looks stuck.`,
};

export default descriptor;
