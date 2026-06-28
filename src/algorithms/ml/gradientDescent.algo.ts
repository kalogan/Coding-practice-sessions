import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// Gradient descent — the optimizer under almost every learned game bot.
// We train a single weight `w` to minimize a loss curve. Each step nudges `w`
// downhill by the gradient (slope) times a learning rate, until the slope flattens
// out at the minimum. Here the loss is f(w) = (w - 3)^2 + 2, whose minimum is at w = 3.

const f = (w: number) => (w - 3) * (w - 3) + 2; // loss
const grad = (w: number) => 2 * (w - 3); // df/dw

function run(input: AlgoInput): AlgoResult {
  const lr = input.params?.lr ?? 0.15; // learning rate (step size)
  let w = input.params?.start ?? 9;
  const t = new Tracer();

  // sample the loss curve once for the backdrop line
  const curve: Array<[number, number]> = [];
  for (let x = -1; x <= 9.0001; x += 0.25) curve.push([x, f(x)]);
  const xRange: [number, number] = [-1, 9];
  const yRange: [number, number] = [0, 40];

  const visited: Array<[number, number]> = [];

  const draw = (note: string, done = false) => {
    const points: ChartPoint[] = visited.map(([vx, vy]) => ({ x: vx, y: vy, role: 'plain' }));
    points.push({ x: w, y: f(w), role: done ? 'match' : 'active', label: `w=${w.toFixed(2)}` });
    t.step({
      view: { kind: 'chart', lines: [{ points: curve }], points, xRange, yRange, xLabel: 'weight w', yLabel: 'loss' },
      state: [
        { label: 'weight w', value: w.toFixed(3) },
        { label: 'loss f(w)', value: f(w).toFixed(3), highlight: true },
        { label: 'gradient', value: grad(w).toFixed(3) },
      ],
      note,
    });
  };

  draw(`Start at w = ${w}. Loss is ${f(w).toFixed(2)} — high, and the slope points uphill to the right.`);

  let steps = 0;
  while (Math.abs(grad(w)) > 0.1 && steps < 60) {
    const g = grad(w);
    visited.push([w, f(w)]);
    w = w - lr * g; // step downhill, opposite the gradient
    steps++;
    draw(
      `Gradient is ${g.toFixed(2)} (slope). Step downhill: w ← w − ${lr} × ${g.toFixed(2)} = ${w.toFixed(3)}. Loss drops to ${f(w).toFixed(3)}.`,
    );
  }

  const answer = Math.round(w);
  draw(`The slope is ~flat — we've reached the minimum. The best weight is w ≈ ${answer}.`, true);

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'gradient-descent',
  title: 'Gradient descent: training a weight',
  category: 'Machine Learning',
  difficulty: 'Medium',
  scenario:
    'Every learned game bot tunes its weights to minimize a loss. Gradient descent rolls a weight downhill on the loss curve: read the slope, take a small step against it, repeat until the slope flattens at the bottom.',
  pattern:
    'Iterative optimization: w ← w − learningRate × gradient(w). The gradient points uphill, so stepping the opposite way lowers the loss. Too-small a learning rate crawls; too-large overshoots and diverges.',
  complexity: 'O(steps) — converges geometrically near a smooth minimum',
  defaultInput: { params: { start: 9, lr: 0.15 } },
  expected: 3,
  run,
  code: `function gradientDescent(start, lr) {
  let w = start;
  const grad = (w) => 2 * (w - 3);     // slope of the loss f(w)=(w-3)^2+2
  while (Math.abs(grad(w)) > 0.1) {
    w = w - lr * grad(w);              // step DOWNHILL, against the gradient
  }
  return Math.round(w);                // the weight that minimizes the loss
}`,
  eli5: `## The everyday picture

You're standing on a foggy hillside and want the lowest point in the valley. You can't see far, but you can feel which way the ground slopes under your feet. So you take a small step straight downhill, feel again, step again. Keep going and you end up at the bottom. That's gradient descent.

## What problem it solves

A game bot's "brain" is a bunch of numbers (weights). Training means finding weights that make it play well — i.e. that make a \`loss\` (how wrong it is) as small as possible. Here we shrink it to one weight \`w\` and one loss curve so you can watch it.

## How it works step by step

- The \`gradient\` is just the slope of the loss at your current \`w\` — which way is uphill, and how steep.
- Step the OPPOSITE way: \`w ← w − learningRate × gradient\`. Downhill lowers the loss.
- The steeper the slope, the bigger the step (the gradient is large); as you near the bottom the slope flattens, so the steps shrink and you settle.

## Why the learning rate matters

\`learningRate\` is your step size. Too small and you crawl forever; too big and you leap past the bottom and bounce up the other side — sometimes flying off to infinity. Picking it well is most of the art of training.

## Complexity in plain terms

Each step is cheap; near a smooth minimum the distance to the bottom shrinks by a constant factor each step, so it converges fast. Real nets just do this in thousands of dimensions at once.

## Common pitfalls

- A learning rate that's too high — the loss oscillates or explodes instead of falling.
- Local minima: a bumpy loss can have little valleys that trap you above the true bottom.
- Forgetting the minus sign — adding the gradient climbs UP, maximizing the loss.`,
};

export default descriptor;
