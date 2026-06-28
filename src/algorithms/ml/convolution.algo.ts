import type { AlgoDescriptor, AlgoInput, AlgoResult } from '../types';
import { Tracer } from '../tracer';

// Convolution — the operation a convnet uses to "see" a game board.
// A small kernel (filter) slides over the input image; at each position it
// computes a weighted sum of the pixels under it, producing one number in the
// output feature map. An edge-detecting kernel lights up where the board changes.

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // input "board": a vertical edge — left side 0, right side 1
  const image = [
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
  ];
  // vertical-edge detector (Sobel-x)
  const kernel = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ];
  const kh = kernel.length;
  const kw = kernel[0].length;
  const oh = image.length - kh + 1;
  const ow = image[0].length - kw + 1;

  const output: Array<Array<number | null>> = Array.from({ length: oh }, () =>
    Array.from({ length: ow }, () => null),
  );

  let peak = 0;

  for (let r = 0; r < oh; r++) {
    for (let c = 0; c < ow; c++) {
      // weighted sum of the window under the kernel
      let sum = 0;
      for (let i = 0; i < kh; i++) {
        for (let j = 0; j < kw; j++) {
          sum += image[r + i][c + j] * kernel[i][j];
        }
      }
      output[r][c] = sum;
      peak = Math.max(peak, Math.abs(sum));

      t.step({
        view: { kind: 'conv', input: image, kernel, output: output.map((row) => [...row]), window: { row: r, col: c }, active: { row: r, col: c } },
        state: [
          { label: 'output cell', value: `(${r}, ${c})` },
          { label: 'weighted sum', value: sum, highlight: true },
          { label: 'peak |response|', value: peak },
        ],
        note: `Slide the kernel to (${r}, ${c}); multiply-and-add the window → ${sum}. Big magnitude = an edge here.`,
      });
    }
  }

  t.step({
    view: { kind: 'conv', input: image, kernel, output: output.map((row) => [...row]) },
    state: [{ label: 'peak |response|', value: peak, highlight: true }],
    note: `Done. The feature map is strongest (|${peak}|) along the vertical edge — the convnet "saw" it.`,
  });

  return { steps: t.steps, answer: peak };
}

const descriptor: AlgoDescriptor = {
  id: 'convolution',
  title: 'Convolution: a convnet sees the board',
  category: 'Machine Learning',
  difficulty: 'Medium',
  scenario:
    'A game bot that learns from pixels uses a convolutional layer. A small kernel slides over the board and, at each spot, multiplies-and-adds the pixels under it. An edge-detecting kernel produces a feature map that lights up wherever the board changes.',
  pattern:
    'Cross-correlation: for every output position, overlay the kernel on the input, multiply element-wise, and sum. The kernel weights ARE the learned feature detector. Output size = input − kernel + 1 (valid). Shared weights = far fewer parameters than a dense layer, and translation invariance.',
  complexity: 'O(outH · outW · kH · kW)',
  defaultInput: {},
  expected: 4,
  run,
  code: `function convolve(image, kernel) {
  const kh = kernel.length, kw = kernel[0].length;
  const oh = image.length - kh + 1, ow = image[0].length - kw + 1;
  const out = [];
  for (let r = 0; r < oh; r++) {
    out[r] = [];
    for (let c = 0; c < ow; c++) {
      let sum = 0;
      for (let i = 0; i < kh; i++)
        for (let j = 0; j < kw; j++)
          sum += image[r + i][c + j] * kernel[i][j];   // multiply-and-add
      out[r][c] = sum;
    }
  }
  return out;                                            // the feature map
}`,
  eli5: `## The everyday picture

Imagine sliding a little stencil (the kernel) across a photo. At each spot you peek through the holes, add up what you see weighted by the stencil, and write down one number. Slide it everywhere and those numbers form a new, smaller picture — a "feature map" that highlights one kind of pattern, like vertical edges.

## What problem it solves

A game bot that learns from raw pixels can't afford a separate weight for every pixel — boards are huge. A convolution reuses the SAME small kernel everywhere, so it learns one feature detector cheaply and finds that feature anywhere on the board.

## How it works step by step

- Place the \`kernel\` (here a vertical-edge detector) over the top-left of the image.
- Multiply each overlapping pair and add them up → one output number.
- Slide one step right; repeat across the row, then down. The result is the \`feature map\`.

## Why it works

The kernel's weights are a tiny pattern template. The weighted sum is large (positive or negative) exactly where the image matches that pattern — so an edge kernel spikes along edges. Stack many kernels and deeper layers and you get the eyes of AlphaGo / Atari agents.

## Complexity in plain terms

For each of the output cells you do kernel-size multiply-adds: O(outH·outW·kH·kW). Cheap, and massively parallel on a GPU.

## Common pitfalls

- Padding/stride: "valid" convolution shrinks the image (output = input − kernel + 1).
- Cross-correlation vs true convolution (flipping the kernel) — frameworks use cross-correlation.
- Forgetting that the kernel weights are LEARNED, not hand-set, in a real convnet.`,
};

export default descriptor;
