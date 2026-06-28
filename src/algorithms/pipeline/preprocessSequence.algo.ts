import type { AlgoDescriptor, AlgoInput, AlgoResult, BarRole } from '../types';
import { Tracer } from '../tracer';

// Preprocess a raw sensor sequence into a clean, fixed-length model input.
//
// Real models want a FIXED-SHAPE, gap-free tensor. Raw telemetry rarely obliges:
// samples drop out (gaps), arrive at an irregular cadence, and vary in length.
// We normalise in three stages so every example becomes exactly L numbers:
//   1. FORWARD-FILL  — replace each "missing" sentinel (-1) with the last known value.
//   2. RESAMPLE      — keep one value per fixed time-step (downsample by `stride`).
//   3. CAP + PAD     — truncate to L if too long, or pad with zeros up to L if short.

const MISSING = -1; // sentinel value meaning "no sample here"

function run(input: AlgoInput): AlgoResult {
  const raw = (input.array ?? []).slice();
  const L = input.params?.length ?? 8;
  const stride = input.params?.stride ?? 2; // keep every `stride`-th sample
  const t = new Tracer();

  const baseState = (extra: { label: string; value: string | number; highlight?: boolean }[] = []) => [
    { label: 'L (target length)', value: L },
    ...extra,
  ];

  // Intro: the raw, irregular series.
  t.step({
    view: {
      kind: 'array',
      values: raw.slice(),
      markers: [],
      bars: raw.map((v) => (v === MISSING ? 'compare' : 'plain') as BarRole),
    },
    state: baseState([{ label: 'raw length', value: raw.length, highlight: true }]),
    note: `Raw sensor series of length ${raw.length}. Cells holding ${MISSING} (highlighted) are MISSING samples — gaps we must repair before a model can use this.`,
  });

  // ── STAGE 1: FORWARD-FILL ──────────────────────────────────────────────────
  // Walk left→right; carry the last seen real value forward into each gap.
  const filled = raw.slice();
  const wasFilled: boolean[] = filled.map(() => false);
  let lastKnown = 0; // value to use if the series opens with a gap

  for (let i = 0; i < filled.length; i++) {
    if (filled[i] === MISSING) {
      filled[i] = lastKnown;
      wasFilled[i] = true;
    } else {
      lastKnown = filled[i];
    }

    t.step({
      view: {
        kind: 'array',
        values: filled.slice(),
        markers: [{ index: i, role: 'eval', label: 'i' }],
        bars: filled.map((_, j) => {
          if (j === i) return wasFilled[j] ? 'compare' : 'min';
          return wasFilled[j] ? 'compare' : ('plain' as BarRole);
        }),
      },
      state: baseState([
        { label: 'stage', value: '1 · forward-fill' },
        { label: 'last known', value: lastKnown, highlight: true },
      ]),
      note: wasFilled[i]
        ? `Index ${i} was missing → forward-fill with the last known value ${lastKnown}. Filled cells are coloured 'compare'.`
        : `Index ${i} has a real reading (${filled[i]}); remember it as the new "last known" value.`,
    });
  }

  t.step({
    view: {
      kind: 'array',
      values: filled.slice(),
      markers: [],
      bars: filled.map((_, j) => (wasFilled[j] ? 'compare' : 'plain') as BarRole),
    },
    state: baseState([{ label: 'stage', value: '1 · done', highlight: true }]),
    note: `Forward-fill complete: no more gaps. 'compare' cells were synthesised from neighbours; everything else is a true reading.`,
  });

  // ── STAGE 2: RESAMPLE (downsample) ─────────────────────────────────────────
  // Keep one value per fixed time-step: indices 0, stride, 2·stride, …
  const keptFlags: boolean[] = filled.map((_, i) => i % stride === 0);

  t.step({
    view: {
      kind: 'array',
      values: filled.slice(),
      markers: [],
      bars: filled.map((_, i) => (keptFlags[i] ? 'min' : 'swap') as BarRole),
    },
    state: baseState([
      { label: 'stage', value: '2 · resample' },
      { label: 'stride', value: stride, highlight: true },
    ]),
    note: `Resample at every ${stride}-th time-step. KEPT cells (indices 0, ${stride}, ${2 * stride}, …) are 'min'; DROPPED cells are 'swap'. This downsamples the cadence to one value per fixed step.`,
  });

  const resampled = filled.filter((_, i) => keptFlags[i]);

  t.step({
    view: {
      kind: 'array',
      values: resampled.slice(),
      markers: [],
      bars: resampled.map(() => 'min' as BarRole),
    },
    state: baseState([
      { label: 'stage', value: '2 · done' },
      { label: 'resampled length', value: resampled.length, highlight: true },
    ]),
    note: `After dropping the in-between samples we have ${resampled.length} values — one per fixed time-step.`,
  });

  // ── STAGE 3: CAP + PAD ─────────────────────────────────────────────────────
  // Force the sequence to be EXACTLY L: truncate if too long, zero-pad if short.
  let output: number[];
  let padCount = 0;
  let capped = false;

  if (resampled.length > L) {
    // CAP: keep the first L, drop the overflow tail.
    capped = true;
    output = resampled.slice(0, L);
    t.step({
      view: {
        kind: 'array',
        values: resampled.slice(),
        markers: [{ index: L - 1, role: 'window', label: 'L' }],
        bars: resampled.map((_, i) => (i < L ? 'min' : 'swap') as BarRole),
      },
      state: baseState([
        { label: 'stage', value: '3 · cap' },
        { label: 'over by', value: resampled.length - L, highlight: true },
      ]),
      note: `Length ${resampled.length} > L=${L}: CAP (truncate). Keep the first ${L} values ('min'); drop the overflow tail ('swap').`,
    });
  } else {
    // PAD: append zeros until we reach length L.
    padCount = L - resampled.length;
    output = resampled.concat(new Array(padCount).fill(0));
    t.step({
      view: {
        kind: 'array',
        values: output.slice(),
        markers: [],
        bars: output.map((_, i) => (i < resampled.length ? 'min' : 'sorted') as BarRole),
      },
      state: baseState([
        { label: 'stage', value: '3 · pad' },
        { label: 'pad count', value: padCount, highlight: true },
      ]),
      note: `Length ${resampled.length} < L=${L}: PAD with ${padCount} zero(s) ('sorted'). Real values stay 'min'. (A model would also build a MASK so these pads are ignored during learning.)`,
    });
  }

  // Final fixed-length sequence.
  t.step({
    view: {
      kind: 'array',
      values: output.slice(),
      markers: [{ index: L - 1, role: 'window', label: 'L' }],
      bars: output.map((_, i) =>
        capped ? ('min' as BarRole) : i < resampled.length ? ('min' as BarRole) : ('sorted' as BarRole),
      ),
    },
    state: baseState([
      { label: 'stage', value: 'done' },
      { label: 'final length', value: output.length, highlight: true },
    ]),
    note: `Output is exactly L=${L} values: [${output.join(', ')}]. Fixed shape, gap-free — ready to feed a model.`,
  });

  // The ANSWER is the final fixed sequence length (always L).
  return { steps: t.steps, answer: output.length };
}

const descriptor: AlgoDescriptor = {
  id: 'preprocess-sequence',
  title: 'Preprocess: fill, resample, cap & pad',
  category: 'Data Pipeline',
  scenario:
    'A game-bot streams raw sensor readings, but the feed is messy: some samples are missing, the cadence is irregular, and different episodes have different lengths. A neural model needs a FIXED-shape, gap-free input, so we normalise every sequence to exactly L numbers before it ever reaches the network.',
  pattern:
    'Three-stage sequence normalisation: forward-fill gaps (carry the last known value), resample to a fixed time-step (downsample), then pad-or-truncate to a fixed window L. A single left-to-right O(n) pass per stage turns ragged input into a uniform tensor.',
  complexity: 'O(n) time · O(n) space',
  difficulty: 'Medium',
  eli5: `## The everyday picture

Imagine a heart-rate watch that sometimes misses a beat, samples at a wobbly rate, and records sessions of different lengths. Before you can compare sessions — or feed them to a model — you tidy them into rows of the SAME length with no blanks. That is exactly what this pipeline does to a sensor sequence.

## Why models need a fixed length and no gaps

Neural networks expect a tensor of a known, fixed shape: every example must be the same length, and every cell must hold a real number. A blank (our \`-1\` sentinel) or a ragged length breaks the matrix maths. So we force every sequence to exactly \`L\` values with no holes.

## Forward-fill vs interpolation

Forward-fill copies the LAST known reading into each gap — cheap, causal (it never peeks at the future), and ideal for "hold last state" signals. Interpolation instead blends the values on either side of a gap; it's smoother but it LEAKS future information, which is dangerous for time-series prediction.

## Downsampling trade-offs

Resampling keeps one value per fixed step. Fewer points means a shorter, faster sequence and less noise — but you can blur or miss brief spikes. The stride is a resolution-vs-cost dial.

## Padding and masking

If a sequence is short we pad with zeros to reach \`L\`; if long we truncate. Crucially, you also build a MASK marking which cells are real, so the padded zeros don't pollute attention or the loss.

## Common pitfalls

- Forward-filling across a LONG gap invents data that never happened.
- Interpolation (or filling from the right) leaks future info into the past.
- Padding WITHOUT a mask lets fake zeros bias the model's learning.`,
  defaultInput: { array: [3, -1, -1, 7, -1, 5, -1, -1, 9, 2], params: { length: 8 } },
  expected: 8,
  run,
  code: `const MISSING = -1;

function preprocess(raw, L = 8, stride = 2) {
  // 1. FORWARD-FILL: carry the last known value into each gap.
  const filled = raw.slice();
  let last = 0;
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] === MISSING) filled[i] = last;
    else last = filled[i];
  }

  // 2. RESAMPLE: keep one value per fixed time-step (downsample).
  const resampled = filled.filter((_, i) => i % stride === 0);

  // 3. CAP + PAD: force the length to exactly L.
  const out =
    resampled.length > L
      ? resampled.slice(0, L)                               // cap
      : resampled.concat(Array(L - resampled.length).fill(0)); // pad

  return out.length; // === L
}`,
};

export default descriptor;
