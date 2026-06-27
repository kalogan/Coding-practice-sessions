import type { AlgoDescriptor, AlgoInput, AlgoResult } from '../types';
import { Tracer } from '../tracer';

// Variable-size sliding window.
// Scenario: an LLM has a fixed token budget. Each message costs some tokens.
// Find the LONGEST run of *consecutive* messages that fits within the budget.

function run(input: AlgoInput): AlgoResult {
  const tokens = input.array;
  const budget = input.params?.budget ?? 0;
  const t = new Tracer();

  let left = 0;
  let sum = 0;
  let best = 0;
  let bestStart = 0;

  for (let right = 0; right < tokens.length; right++) {
    // grow the window to the right
    sum += tokens[right];
    t.step({
      markers: [
        { index: left, role: 'left', label: 'L' },
        { index: right, role: 'right', label: 'R' },
      ],
      window: { start: left, end: right },
      state: [
        { label: 'window tokens', value: sum, highlight: sum > budget },
        { label: 'budget', value: budget },
        { label: 'best length', value: best },
      ],
      note: `Add message ${right} (${tokens[right]} tokens). Window total is now ${sum}.`,
    });

    // too big? shrink from the left until it fits
    while (sum > budget && left <= right) {
      sum -= tokens[left];
      left++;
      t.step({
        markers: [
          { index: left, role: 'left', label: 'L' },
          { index: right, role: 'right', label: 'R' },
        ],
        window: { start: left, end: right },
        state: [
          { label: 'window tokens', value: sum, highlight: sum > budget },
          { label: 'budget', value: budget },
          { label: 'best length', value: best },
        ],
        note: `Over budget (> ${budget}). Drop message ${left - 1} and slide L forward.`,
      });
    }

    // record the best window seen so far
    const len = right - left + 1;
    if (len > best) {
      best = len;
      bestStart = left;
      t.step({
        markers: [
          { index: left, role: 'left', label: 'L' },
          { index: right, role: 'right', label: 'R' },
        ],
        window: { start: left, end: right },
        state: [
          { label: 'window tokens', value: sum },
          { label: 'budget', value: budget },
          { label: 'best length', value: best, highlight: true },
        ],
        note: `New best: ${len} consecutive messages fit within ${budget} tokens.`,
      });
    }
  }

  // final answer
  t.step({
    markers: [
      { index: bestStart, role: 'window' },
      { index: bestStart + best - 1, role: 'window' },
    ],
    window: { start: bestStart, end: bestStart + best - 1 },
    state: [{ label: 'answer', value: best, highlight: true }],
    note: `Done. Longest fitting segment: messages ${bestStart}–${bestStart + best - 1} (${best} messages).`,
  });

  return { steps: t.steps, answer: best };
}

const descriptor: AlgoDescriptor = {
  id: 'chat-history-budget',
  title: 'Chat-history token budget',
  category: 'Sliding Window',
  scenario:
    'An LLM has a fixed token budget. Each message costs some tokens. Find the longest run of consecutive messages that still fits in the budget.',
  pattern:
    'Variable-size window: grow R to include more; while the window breaks the constraint, shrink L. Track the best valid window. O(n) — each index enters and leaves once.',
  complexity: 'O(n) time · O(1) space',
  defaultInput: { array: [3, 1, 4, 1, 5, 9, 2, 6], params: { budget: 10 } },
  run,
  code: `function longestSegment(tokens, budget) {
  let left = 0, sum = 0, best = 0;
  for (let right = 0; right < tokens.length; right++) {
    sum += tokens[right];              // grow the window to the right
    while (sum > budget) {             // too big? shrink from the left
      sum -= tokens[left++];
    }
    best = Math.max(best, right - left + 1);
  }
  return best;                         // longest run that fits the budget
}`,
};

export default descriptor;
