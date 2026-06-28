import type { AlgoDescriptor, AlgoInput, AlgoResult, NetNeuron, NetEdge } from '../types';
import { Tracer } from '../tracer';

// A tiny 2-2-1 neural network, trained by backpropagation.
// This is the engine inside a learned game bot's "brain": numbers (weights) on the
// connections turn an input into an output. Training = repeatedly running the input
// FORWARD to get a prediction, measuring the error, then sending the error BACKWARD
// (backprop) to nudge every weight in the direction that shrinks the error.

const sig = (z: number) => 1 / (1 + Math.exp(-z));

function run(input: AlgoInput): AlgoResult {
  const x = [1, 0]; // the one training input
  const target = 1; // what we want the net to output
  const lr = input.params?.lr ?? 0.8;
  const iterations = input.params?.iterations ?? 20;
  const t = new Tracer();

  // fixed initial weights/biases (deterministic)
  let W1 = [
    [0.5, -0.3],
    [0.2, 0.7],
  ]; // W1[i][j]: input i -> hidden j
  let b1 = [0.1, -0.2];
  let W2 = [0.4, -0.6]; // hidden j -> output
  let b2 = 0.1;

  let h = [0, 0];
  let o = 0;

  const forward = () => {
    h = [0, 1].map((j) => sig(W1[0][j] * x[0] + W1[1][j] * x[1] + b1[j]));
    o = sig(W2[0] * h[0] + W2[1] * h[1] + b2);
  };

  const neurons = (role: NetNeuron['role']): NetNeuron[] => [
    { id: 'i0', x: 0, y: 1 / 3, value: x[0], label: 'input', role },
    { id: 'i1', x: 0, y: 2 / 3, value: x[1], role },
    { id: 'h0', x: 0.5, y: 1 / 3, value: h[0], label: 'hidden', role },
    { id: 'h1', x: 0.5, y: 2 / 3, value: h[1], role },
    { id: 'o0', x: 1, y: 0.5, value: o, label: 'output', role },
  ];
  const edges = (role: NetEdge['role']): NetEdge[] => [
    { from: 'i0', to: 'h0', weight: W1[0][0], role },
    { from: 'i0', to: 'h1', weight: W1[0][1], role },
    { from: 'i1', to: 'h0', weight: W1[1][0], role },
    { from: 'i1', to: 'h1', weight: W1[1][1], role },
    { from: 'h0', to: 'o0', weight: W2[0], role },
    { from: 'h1', to: 'o0', weight: W2[1], role },
  ];
  const loss = () => (o - target) * (o - target);

  forward();
  t.step({
    view: { kind: 'network', neurons: neurons('plain'), edges: edges('plain') },
    state: [
      { label: 'input', value: `[${x.join(', ')}]` },
      { label: 'target', value: target },
      { label: 'prediction', value: o.toFixed(3) },
      { label: 'loss', value: loss().toFixed(4), highlight: true },
    ],
    note: `A 2-2-1 net with random weights. Goal: make the output match the target (${target}).`,
  });

  for (let it = 0; it < iterations; it++) {
    // FORWARD
    forward();
    t.step({
      view: { kind: 'network', neurons: neurons('active'), edges: edges('plain') },
      state: [
        { label: 'iteration', value: it + 1 },
        { label: 'prediction', value: o.toFixed(3) },
        { label: 'loss', value: loss().toFixed(4), highlight: true },
      ],
      note: `Forward pass: activations flow left → right. Prediction ${o.toFixed(3)}, loss ${loss().toFixed(4)}.`,
    });

    // BACKWARD (gradients)
    const dO = 2 * (o - target) * o * (1 - o); // dL/dz_out
    const dW2 = [dO * h[0], dO * h[1]];
    const dB2 = dO;
    const dZ1 = [0, 1].map((j) => dO * W2[j] * h[j] * (1 - h[j]));
    const dW1 = [
      [dZ1[0] * x[0], dZ1[1] * x[0]],
      [dZ1[0] * x[1], dZ1[1] * x[1]],
    ];
    const dB1 = [dZ1[0], dZ1[1]];

    // update
    W2 = [W2[0] - lr * dW2[0], W2[1] - lr * dW2[1]];
    b2 = b2 - lr * dB2;
    W1 = [
      [W1[0][0] - lr * dW1[0][0], W1[0][1] - lr * dW1[0][1]],
      [W1[1][0] - lr * dW1[1][0], W1[1][1] - lr * dW1[1][1]],
    ];
    b1 = [b1[0] - lr * dB1[0], b1[1] - lr * dB1[1]];

    t.step({
      view: { kind: 'network', neurons: neurons('grad'), edges: edges('grad') },
      state: [
        { label: 'iteration', value: it + 1 },
        { label: 'output gradient', value: dO.toFixed(4) },
        { label: 'loss', value: loss().toFixed(4) },
      ],
      note: `Backprop: the error flows right → left, and every weight is nudged to shrink the loss.`,
    });
  }

  forward();
  const answer = Math.round(o);
  t.step({
    view: { kind: 'network', neurons: neurons('active'), edges: edges('plain') },
    state: [
      { label: 'final prediction', value: o.toFixed(3) },
      { label: 'target', value: target },
      { label: 'rounds to', value: answer, highlight: true },
    ],
    note: `Trained. The output is ${o.toFixed(3)} — it has learned to fire ~${target}.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'neural-net',
  title: 'Neural net: forward & backprop',
  category: 'Machine Learning',
  difficulty: 'Hard',
  scenario:
    "A learned game bot's brain is a neural network: weights on connections turn an input into a decision. Training runs the input FORWARD to a prediction, measures the error, then sends it BACKWARD (backprop) to nudge every weight downhill on the loss.",
  pattern:
    'Forward pass: each neuron computes sigmoid(weighted sum of its inputs). Loss measures error vs the target. Backprop applies the chain rule from the output back to the inputs to get each weight’s gradient, then gradient descent updates them. Repeat until the loss is small.',
  complexity: 'O(weights) per forward+backward pass',
  defaultInput: { params: { lr: 0.8, iterations: 20 } },
  expected: 1,
  run,
  code: `const sig = z => 1 / (1 + Math.exp(-z));
function train(x, target, lr, steps) {
  // ... fixed initial W1,b1,W2,b2 ...
  for (let s = 0; s < steps; s++) {
    // FORWARD
    const h = [0,1].map(j => sig(W1[0][j]*x[0] + W1[1][j]*x[1] + b1[j]));
    const o = sig(W2[0]*h[0] + W2[1]*h[1] + b2);
    // BACKWARD (chain rule)
    const dO = 2*(o-target) * o*(1-o);          // dLoss/dz_out
    const dZ1 = [0,1].map(j => dO*W2[j] * h[j]*(1-h[j]));
    // gradient-descent update on every weight
    W2 = W2.map((w,j) => w - lr*dO*h[j]);
    W1 = W1.map((row,i) => row.map((w,j) => w - lr*dZ1[j]*x[i]));
    // ...biases too...
  }
  return Math.round(o);                          // learned to fire ~target
}`,
  eli5: `## The everyday picture

Think of the network as a row of dimmer switches wired together. You feed in a signal on the left, it flows through the switches to a light bulb on the right. If the bulb is too dim, you walk back along the wires turning each switch a little — more for the switches that mattered most — until the bulb glows just right. That walk-back is backpropagation.

## What problem it solves

A game bot's brain is just numbers (\`weights\`) on connections. We want weights that turn an \`input\` into the right \`output\`. Here a tiny 2-2-1 net learns to fire ~\`1\` for the input \`[1,0]\`.

## How it works step by step

- **Forward pass:** each neuron computes \`sigmoid(weighted sum of its inputs)\`, layer by layer, left to right, ending in the prediction \`o\`.
- **Loss:** how wrong we are, \`(o - target)^2\`.
- **Backprop:** using the chain rule, push the error backwards to find each weight's \`gradient\` — how much it pushed the loss up.
- **Update:** nudge every weight the opposite way (gradient descent). Repeat.

## Why it works

The chain rule lets the error at the output be split fairly among all the weights that caused it, so each one knows exactly which way to move. Do this thousands of times across many examples and the net shapes itself to the data.

## Complexity in plain terms

Each pass costs one multiply per connection — cheap per step, but real nets have millions of weights and need many passes.

## Common pitfalls

- Learning rate too high: the loss bounces or explodes; too low: it crawls.
- Forgetting the activation's slope (\`o*(1-o)\` for sigmoid) in the gradient.
- Vanishing gradients: deep sigmoid nets squash the signal so early layers barely learn.`,
};

export default descriptor;
