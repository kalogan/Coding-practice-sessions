import type { AlgoDescriptor, AlgoInput, AlgoResult, Marker } from '../types';
import { Tracer } from '../tracer';

// Variable-size sliding window.
// Scenario: an LLM has a fixed token budget. Each message costs some tokens.
// Find the LONGEST run of *consecutive* messages that fits within the budget.

function run(input: AlgoInput): AlgoResult {
  const tokens = input.array ?? [];
  const budget = input.params?.budget ?? 0;
  const t = new Tracer();

  const markers = (left: number, right: number): Marker[] => [
    { index: left, role: 'left', label: 'L' },
    { index: right, role: 'right', label: 'R' },
  ];

  let left = 0;
  let sum = 0;
  let best = 0;
  let bestStart = 0;

  for (let right = 0; right < tokens.length; right++) {
    // grow the window to the right
    sum += tokens[right];
    t.step({
      view: { kind: 'array', values: tokens, markers: markers(left, right), window: { start: left, end: right } },
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
        view: { kind: 'array', values: tokens, markers: markers(left, right), window: { start: left, end: right } },
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
        view: { kind: 'array', values: tokens, markers: markers(left, right), window: { start: left, end: right } },
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
    view: {
      kind: 'array',
      values: tokens,
      markers: [
        { index: bestStart, role: 'window' },
        { index: bestStart + best - 1, role: 'window' },
      ],
      window: { start: bestStart, end: bestStart + best - 1 },
    },
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
  difficulty: 'Medium',
  eli5: `Imagine you are packing a suitcase that can only hold a fixed weight. You want to fit as many books as possible, but only books that sit next to each other on the shelf — you can't skip around. As you add a book to the right end, the bag might get too heavy, so you remove books from the left end until it's under the limit again. The longest stretch of shelf you ever managed to carry is your answer.

## What problem it solves
Given a list of message costs (\`tokens\`) and a \`budget\`, find the LONGEST run of *consecutive* messages whose total stays within the budget.

## How it works step by step
- Keep two pointers, \`left\` and \`right\`, marking the ends of a window, plus a running \`sum\` of the tokens inside it.
- Each loop iteration moves \`right\` one step right and does \`sum += tokens[right]\` — growing the window.
- If \`sum > budget\`, the window is illegal, so the \`while\` loop subtracts \`tokens[left]\` and bumps \`left\` forward until it fits again.
- After fixing the window, the current length is \`right - left + 1\`; if that beats \`best\`, record it.

## Why it's correct and efficient
Every index is added to \`sum\` exactly once when \`right\` passes it, and removed at most once when \`left\` passes it. So even though there's a nested \`while\`, no element is ever touched more than twice — that's why it's O(n), not O(n²). We never miss a valid window because for each \`right\` we always shrink to the smallest legal \`left\`, giving the longest window ending at that \`right\`.

## Complexity in plain terms
One pass over the messages, constant extra memory: O(n) time, O(1) space.

## Common pitfalls
- Forgetting the \`left <= right\` guard, which can over-shrink when a single message alone exceeds the budget.
- Recomputing the whole sum instead of incrementally adding/subtracting — that quietly turns it back into O(n²).
- Confusing "longest" with "largest sum"; here we maximize the *count* of messages, not their total.`,
  defaultInput: { array: [3, 1, 4, 1, 5, 9, 2, 6], params: { budget: 10 } },
  expected: 4,
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
