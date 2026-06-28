import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Stage: ASSEMBLE the model's input tensor (the design matrix) from preprocessed
// samples. We have N preprocessed gameplay samples, each a feature vector already
// normalized to [0, 1]. Stacking them gives a [batch × features] tensor — exactly
// the fixed-shape numeric block the model (and the GPU) wants to eat.

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // N = 4 preprocessed samples, each a feature vector of length F = 5, in [0, 1].
  const samples: number[][] = [
    [0.12, 0.44, 0.91, 0.03, 0.58],
    [0.27, 0.66, 0.5, 0.71, 0.4],
    [0.5, 0.8, 0.22, 0.95, 0.11],
    [0.6, 0.31, 0.07, 0.49, 0.83],
  ];
  const cols = samples[0].length; // F = 5 features
  const columns = Array.from({ length: cols }, (_, c) => `f${c}`);

  // The tensor we build up one row at a time.
  const tensor: number[][] = [];

  const table = (highlightRow?: number, caption?: string): DataTable => ({
    name: `input_tensor [${tensor.length} × ${cols}]`,
    columns,
    rows: tensor.map((r) => [...r]),
    heat: true,
    heatMin: 0,
    heatMax: 1,
    highlightRow,
    caption,
  });

  t.step({
    view: { kind: 'table', tables: [table(undefined, 'empty tensor — stack samples to form the batch')] },
    state: [
      { label: 'shape', value: `0 × ${cols}` },
      { label: 'elements', value: 0 },
    ],
    note: 'Start empty. Each preprocessed sample is one feature vector (length 5). We will stack them into a [batch × features] matrix — the design matrix the model reads.',
  });

  for (let r = 0; r < samples.length; r++) {
    tensor.push([...samples[r]]); // append this sample as the next batch row
    t.step({
      view: {
        kind: 'table',
        tables: [table(r, `added sample ${r} → row ${r}`)],
      },
      state: [
        { label: 'shape', value: `${tensor.length} × ${cols}`, highlight: true },
        { label: 'elements', value: tensor.length * cols },
      ],
      note: `Stacked sample ${r} as row ${r}. Heat colours each feature by magnitude (dark = low, bright = high). The batch now holds ${tensor.length} sample${tensor.length === 1 ? '' : 's'}.`,
    });
  }

  const rows = tensor.length;
  const elements = rows * cols;

  t.step({
    view: {
      kind: 'table',
      tables: [table(undefined, `full input tensor [${rows} × ${cols}] — ${elements} elements`)],
    },
    state: [
      { label: 'shape', value: `${rows} × ${cols}`, highlight: true },
      { label: 'elements', value: elements, highlight: true },
    ],
    note: `Done. The design matrix is [${rows} × ${cols}]: rows = the batch of samples, columns = features f0..f4. That is ${rows} × ${cols} = ${elements} numbers, ready to feed the model in one shot.`,
  });

  return { steps: t.steps, answer: elements };
}

const descriptor: AlgoDescriptor = {
  id: 'build-tensor',
  title: 'Build the input tensor [batch × features]',
  category: 'Data Pipeline',
  difficulty: 'Medium',
  scenario:
    'A model does not eat rows of a database — it eats one fixed-shape block of numbers. After preprocessing, every gameplay sample is a feature vector of the same length. This stage stacks those vectors into the input tensor (the design matrix): a [batch × features] grid that gets handed to the model in a single forward pass.',
  pattern:
    'Stack equal-length vectors into a batch matrix: shape = [batch, features]. Rows index samples, columns index features. A fixed, rectangular numeric tensor is the contract every model and every GPU kernel expects.',
  complexity: 'O(batch × features)',
  defaultInput: {},
  expected: 20,
  run,
  code: `function buildTensor(samples) {
  // samples: N feature vectors, each length F, all normalized to [0, 1]
  const tensor = [];
  for (const sample of samples)
    tensor.push([...sample]);          // stack each vector as one batch row
  const rows = tensor.length;          // batch size N
  const cols = tensor[0].length;       // feature count F
  return rows * cols;                  // total elements in the [N × F] tensor
}`,
  eli5: `## The everyday picture

Imagine four people each fill out the SAME five-question form. To read them quickly you don't keep four loose sheets — you copy each form onto one row of a spreadsheet: four rows, five columns. Now the whole batch is one neat grid you can scan in a single glance. That grid is the input tensor, and the model reads it exactly like you read the spreadsheet.

## What batch and features mean

The rows are the BATCH — one row per sample (here, one per gameplay snapshot). The columns are the FEATURES — f0..f4, the same five measurements for every sample. So a cell (row r, column c) is "feature c of sample r".

## How it's actually laid out

In memory the grid is flattened row-major: all of row 0's numbers, then all of row 1's, and so on. A [4 × 5] tensor is just 20 numbers in a line, with the shape telling the model where each row begins.

## Why fixed shape + batching matter

GPUs are fast because they do the same math on many numbers at once. A rectangular [batch × features] block lets the hardware process all four samples in parallel in one pass, instead of looping one form at a time.

## Common pitfalls

- Ragged rows — one sample has 4 features, another has 6. The tensor isn't rectangular and the stack fails (or silently misaligns).
- Wrong axis order — putting features on rows and samples on columns feeds the model transposed garbage.
- Un-normalized columns — one feature on a 0–100 scale drowns out the others; normalize before you stack.`,
};

export default descriptor;
