import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Final stage: X-RAY the input tensor before you commit/serve the model.
// The tensor the model sees should be clean and normalized (here: in [0, 1]).
// We render it as a heatmap and scan every cell, flagging anomalies — a NaN or
// an out-of-range value — that would silently corrupt training or serving.

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // a [4 x 5] input tensor that SHOULD be normalized to [0, 1] — but isn't quite
  const tensor: number[][] = [
    [0.12, 0.44, 0.91, 0.03, 0.58],
    [0.27, 0.66, NaN, 0.71, 0.4], // a NaN slipped in
    [0.5, 0.8, 0.22, 0.95, 0.11],
    [0.6, 0.31, 0.07, 0.49, 9.9], // un-normalized (out of [0,1])
  ];
  const rows = tensor.length;
  const cols = tensor[0].length;
  const columns = Array.from({ length: cols }, (_, c) => `f${c}`);

  const flags: Array<{ row: number; col: number }> = [];
  const table = (caption?: string): DataTable => ({
    name: 'input_tensor [4 × 5]',
    columns,
    rows: tensor.map((r) => [...r]),
    heat: true,
    heatMin: 0,
    heatMax: 1,
    flags: flags.map((f) => ({ ...f })),
    caption,
  });

  const isBad = (v: number) => !Number.isFinite(v) || v < 0 || v > 1;

  t.step({
    view: { kind: 'table', tables: [table('scan every cell — values should sit in [0, 1]')] },
    state: [{ label: 'anomalies', value: 0 }],
    note: 'Before committing, x-ray the tensor the model will see. Bright = high, dark = low. Now scan for trouble.',
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = tensor[r][c];
      if (isBad(v)) {
        flags.push({ row: r, col: c });
        t.step({
          view: { kind: 'table', tables: [table()] },
          state: [{ label: 'anomalies', value: flags.length, highlight: true }],
          note: `Anomaly at (row ${r}, f${c}): ${Number.isNaN(v) ? 'NaN' : `${v} is outside [0, 1]`}. Flag it — never ship this.`,
        });
      }
    }
  }

  t.step({
    view: { kind: 'table', tables: [table(`${flags.length} anomalies found — fix before commit`)] },
    state: [{ label: 'anomalies', value: flags.length, highlight: true }],
    note: `Done. ${flags.length} bad cells caught (a NaN and an un-normalized value). The x-ray stopped a silent bug.`,
  });

  return { steps: t.steps, answer: flags.length };
}

const descriptor: AlgoDescriptor = {
  id: 'tensor-xray',
  title: 'X-ray: inspect the serving tensor',
  category: 'Data Pipeline',
  difficulty: 'Medium',
  scenario:
    'Right before you commit a model or ship a bot, x-ray its input tensor as a heatmap. Most model bugs are really DATA bugs — a NaN, a feature that never got normalized, a wrong shape. Seeing the actual tensor catches them before they reach production.',
  pattern:
    'Validation gate: render the tensor as a heatmap and assert invariants (finite, in range, right shape). Flag every violation. A cheap visual + assertion pass that catches the silent data corruption unit tests miss.',
  complexity: 'O(tensor size)',
  defaultInput: {},
  expected: 2,
  run,
  code: `function xray(tensor) {
  const bad = [];
  for (let r = 0; r < tensor.length; r++)
    for (let c = 0; c < tensor[r].length; c++) {
      const v = tensor[r][c];
      if (!Number.isFinite(v) || v < 0 || v > 1)   // expected normalized range
        bad.push([r, c]);                           // flag the anomaly
    }
  return bad.length;                                // 0 = safe to commit
}`,
  eli5: `## The everyday picture

A doctor doesn't operate without an x-ray first. Same here: before you "operate" (commit a model and let a bot use it), you look at the actual numbers it will be fed, lit up as a heatmap, and check nothing looks broken.

## What problem it solves

Most "the model is acting weird" bugs aren't the model — they're the DATA. A single \`NaN\` poisons every weight it touches; a feature that's on a 0–100 scale when everything else is 0–1 drowns out the rest. These pass unit tests but wreck the bot.

## How it works step by step

- Render the input tensor as a heatmap — bright cells are big values, dark are small. Your eye spots a stray bright cell instantly.
- Scan every cell and assert your invariants: is it finite? is it inside the expected range (here \`[0, 1]\`)? is the shape right?
- Flag every violation; refuse to commit while any remain.

## Why do it visually

A shape like \`[4, 5]\` of numbers is hard to eyeball as text, but as a heatmap an outlier or a hole jumps out. It's the fastest "catch it before commit" check you can add.

## Complexity in plain terms

One pass over the tensor — O(size). Trivially cheap insurance.

## Common pitfalls

- Only checking the average — a single NaN hides in a fine-looking mean.
- Forgetting to re-check after a preprocessing change.
- Right values, wrong SHAPE — the model silently reads garbage.`,
};

export default descriptor;
