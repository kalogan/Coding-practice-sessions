import type { AlgoDescriptor, AlgoInput, AlgoResult, Marker } from '../types';
import { Tracer } from '../tracer';

// Fixed-size sliding window.
// Scenario: each post has a reaction count. Find the highest total reactions
// across any K consecutive posts. Slide a fixed window of width K, reusing the
// previous sum instead of recomputing it (add the new, drop the old).

function run(input: AlgoInput): AlgoResult {
  const reactions = input.array ?? [];
  const k = input.params?.k ?? 1;
  const t = new Tracer();

  const ends = (left: number, right: number): Marker[] => [
    { index: left, role: 'left', label: 'start' },
    { index: right, role: 'right', label: 'end' },
  ];

  // first window: posts 0..k-1
  let sum = 0;
  for (let i = 0; i < k; i++) sum += reactions[i];
  let best = sum;
  let bestStart = 0;

  t.step({
    view: { kind: 'array', values: reactions, markers: ends(0, k - 1), window: { start: 0, end: k - 1 } },
    state: [
      { label: 'window sum', value: sum },
      { label: 'window size k', value: k },
      { label: 'best sum', value: best, highlight: true },
    ],
    note: `First window: posts 0–${k - 1} total ${sum} reactions. That is our starting best.`,
  });

  for (let right = k; right < reactions.length; right++) {
    const left = right - k + 1;
    // slide: add the incoming post, drop the outgoing one
    sum += reactions[right] - reactions[right - k];
    const improved = sum > best;
    if (improved) {
      best = sum;
      bestStart = left;
    }
    t.step({
      view: { kind: 'array', values: reactions, markers: ends(left, right), window: { start: left, end: right } },
      state: [
        { label: 'window sum', value: sum, highlight: improved },
        { label: 'window size k', value: k },
        { label: 'best sum', value: best, highlight: true },
      ],
      note: improved
        ? `Slide: +post ${right} (${reactions[right]}), −post ${right - k} (${reactions[right - k]}) → ${sum}. New peak!`
        : `Slide: +post ${right} (${reactions[right]}), −post ${right - k} (${reactions[right - k]}) → ${sum}.`,
    });
  }

  // final answer
  t.step({
    view: {
      kind: 'array',
      values: reactions,
      markers: [
        { index: bestStart, role: 'window' },
        { index: bestStart + k - 1, role: 'window' },
      ],
      window: { start: bestStart, end: bestStart + k - 1 },
    },
    state: [{ label: 'answer', value: best, highlight: true }],
    note: `Done. Peak engagement: posts ${bestStart}–${bestStart + k - 1} with ${best} total reactions.`,
  });

  return { steps: t.steps, answer: best };
}

const descriptor: AlgoDescriptor = {
  id: 'peak-engagement',
  title: 'Peak engagement over K posts',
  category: 'Sliding Window',
  scenario:
    'Each post has a reaction count. Find the highest total reactions across any K consecutive posts.',
  pattern:
    'Fixed-size window: compute the first window once, then slide by adding the incoming element and subtracting the outgoing one. Avoids recomputing the whole sum — O(n) instead of O(n·k).',
  complexity: 'O(n) time · O(1) space',
  difficulty: 'Easy',
  eli5: `Picture a window exactly \`k\` posts wide sliding along a row of posts. Instead of re-counting every post inside the window each time you move it one step, you just add the new post that slides into view and subtract the post that slides out of view. It's like a moving average: you don't re-add all the numbers, you only adjust for what changed at the two edges.

## What problem it solves
Each post has a \`reactions\` count. We want the highest total reactions across any \`k\` consecutive posts.

## How it works step by step
- First, add up the very first window, posts \`0\` through \`k-1\`, into \`sum\`. That's our starting \`best\`.
- Then for each new right edge \`right\` (starting at \`k\`), slide the window: \`sum += reactions[right] - reactions[right - k]\`. The \`+reactions[right]\` brings in the incoming post; the \`-reactions[right - k]\` drops the post that just left on the left side.
- After each slide, compare \`sum\` to \`best\` and keep the larger.

## Why it's correct and efficient
The naive approach recomputes each window from scratch — \`k\` additions per position — costing O(n·k). The slide trick reuses the previous \`sum\` and only does two arithmetic ops per step, so it's O(n). It's correct because adding the entering element and removing the leaving element transforms the previous window's sum into the new window's sum exactly.

## Complexity in plain terms
One pass, constant memory: O(n) time, O(1) space.

## Common pitfalls
- Off-by-one on which post leaves: the outgoing index is \`right - k\`, not \`right - k + 1\`.
- Initializing \`best\` to \`0\` instead of the first window's \`sum\` — that fails if reactions can be negative or if you forget the first window entirely.
- Re-summing the window inside the loop, silently reverting to O(n·k).`,
  defaultInput: { array: [2, 1, 5, 1, 3, 2], params: { k: 3 } },
  expected: 9,
  run,
  code: `function peakEngagement(reactions, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += reactions[i];   // first window
  let best = sum;
  for (let right = k; right < reactions.length; right++) {
    sum += reactions[right] - reactions[right - k];   // add new, drop old
    best = Math.max(best, sum);
  }
  return best;                                         // highest K-post total
}`,
};

export default descriptor;
