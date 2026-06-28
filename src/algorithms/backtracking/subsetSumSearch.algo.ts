import type { AlgoDescriptor, AlgoInput, AlgoResult, Frame } from '../types';
import { Tracer } from '../tracer';

// Backtracking made visible: the DFS decision path IS the call stack.
// Scenario: pick a subset of items to maximize total value without exceeding a
// capacity. We brute-force every subset with an include/exclude depth-first
// recursion. Each frame on the stack is a decision already taken on the path
// from the root to where we are now ("include 8" / "skip 6"). We push a frame
// when we make a decision and pop it on backtrack — exactly mirroring the real
// recursion — so the stack always shows the current partial choice.

function run(input: AlgoInput): AlgoResult {
  const items = input.array ?? [];
  const capacity = input.params?.capacity ?? 0;
  const t = new Tracer();

  // The live DFS decision path. The LAST element is the most recent decision.
  // Each frame records what we did with one item: included it (and how much it
  // added) or skipped it.
  const frames: { label: string; detail: string; status: Frame['status'] }[] = [];

  // Best subset sum found so far that fits under the capacity.
  let best = 0;

  const view = (): { kind: 'stack'; frames: Frame[] } => ({
    kind: 'stack',
    frames: frames.map((f) => ({
      title: f.label,
      detail: f.detail,
      status: f.status,
    })),
  });

  const baseState = (i: number, sum: number) => [
    { label: 'index', value: i },
    { label: 'running sum', value: sum },
    { label: 'capacity', value: capacity },
    { label: 'best so far', value: best },
  ];

  // DFS over the items. At index i we decide: include item[i] (only if it still
  // fits) or exclude it. When i reaches the end, the path of frames describes a
  // complete subset whose total is `sum` — we record it if it beats the best.
  const dfs = (i: number, sum: number): void => {
    if (i === items.length) {
      // Leaf: a full subset has been chosen. `sum` is guaranteed <= capacity
      // because we never include an item that would overflow it.
      if (sum > best) {
        const prevBest = best;
        best = sum;
        t.step({
          view: view(),
          state: baseState(i, sum).map((s) =>
            s.label === 'best so far' ? { ...s, value: best, highlight: true } : s,
          ),
          note: `Reached a complete subset summing to ${sum}. That beats the previous best of ${prevBest}, so the new best is ${best}.`,
        });
      } else {
        t.step({
          view: view(),
          state: baseState(i, sum),
          note: `Reached a complete subset summing to ${sum}. It does not beat the current best of ${best}, so we keep the best and backtrack.`,
        });
      }
      return;
    }

    const v = items[i];

    // Decision 1: include item[i], but only if it still fits under the cap.
    if (sum + v <= capacity) {
      frames.push({
        label: `include ${v}`,
        detail: `sum ${sum} → ${sum + v} (fits under ${capacity})`,
        status: 'active',
      });
      t.step({
        view: view(),
        state: baseState(i, sum + v),
        note: `Try INCLUDING item ${v}. It fits (${sum} + ${v} = ${sum + v} ≤ ${capacity}), so we push this decision and recurse deeper.`,
      });
      dfs(i + 1, sum + v);
      // Backtrack: undo the include decision and try the other branch.
      frames.pop();
    } else {
      // Pruned branch: including the item would exceed the capacity, so this
      // whole subtree is hopeless and we skip it entirely.
      frames.push({
        label: `prune ${v}`,
        detail: `${sum} + ${v} > ${capacity} — cannot include`,
        status: 'returning',
      });
      t.step({
        view: view(),
        state: baseState(i, sum),
        note: `Including item ${v} would overflow (${sum} + ${v} = ${sum + v} > ${capacity}). Prune that branch — only the exclude branch is worth exploring.`,
      });
      frames.pop();
    }

    // Decision 2: exclude item[i] and move on. Always valid.
    frames.push({
      label: `skip ${v}`,
      detail: `leave sum at ${sum}`,
      status: 'active',
    });
    t.step({
      view: view(),
      state: baseState(i, sum),
      note: `Try EXCLUDING item ${v}. The running sum stays ${sum}. Push this decision and recurse deeper.`,
    });
    dfs(i + 1, sum);
    // Backtrack out of the exclude decision.
    frames.pop();
  };

  dfs(0, 0);

  // Final settled view: the search is exhausted, the best subset sum is known.
  t.step({
    view: {
      kind: 'stack',
      frames: [
        {
          title: `best subset sum = ${best}`,
          detail: `largest total ≤ ${capacity}`,
          status: 'done',
        },
      ],
    },
    state: [
      { label: 'capacity', value: capacity },
      { label: 'best', value: best, highlight: true },
    ],
    note: `Every subset has been explored. The largest achievable total that stays within capacity ${capacity} is ${best}.`,
  });

  return { steps: t.steps, answer: best };
}

const descriptor: AlgoDescriptor = {
  id: 'subset-sum-search',
  title: 'Brute-force search: best subset under a cap',
  category: 'Backtracking',
  scenario:
    'You have a set of items, each with a value, and a capacity you cannot exceed. Which subset has the largest total without going over? This is the classic "is this combination the best?" question — knapsack-style optimization in its purest brute-force form. We explore every possible subset by, for each item in turn, branching on a single yes/no decision: include it or leave it out.',
  pattern:
    'Include/exclude depth-first recursion with backtracking. At index i we try two choices — take item[i] (only if it still fits) or skip it — then recurse on i+1. The call stack IS the current partial choice: each frame is one decision already made on the path from the root. We push a frame on a decision and pop it when we backtrack to try the alternative. A branch is pruned the moment including an item would breach the capacity, since that subtree can never produce a valid subset.',
  complexity: 'O(2^n) time · O(n) stack',
  difficulty: 'Hard',
  eli5: `## The everyday picture

You're packing a backpack with a weight limit. Each item has a value, and you want the most valuable haul that still fits. The only sure way to know the best combo is to mentally try every possible set of items — take this one, leave that one — and remember the best total you ever saw.

## What problem it solves

Given \`items\` and a \`capacity\`, find the largest sum of a subset that does NOT exceed the capacity. This is knapsack-style optimization in its purest brute-force form.

## How it works, step by step

We do a depth-first recursion \`dfs(i, sum)\`. At each item index \`i\` we face one yes/no decision: INCLUDE \`items[i]\` (only if \`sum + items[i] <= capacity\`) or SKIP it. We recurse on \`i+1\` for each branch. When \`i\` reaches the end, the path of choices is a complete subset and its \`sum\` is a candidate; if \`sum > best\` we update \`best\`.

The visual twist: the call stack IS the current partial choice. Each \`frames.push\` records one decision ("include 8", "skip 6"); on backtrack we \`frames.pop\` to undo it and try the alternative — exactly mirroring how the real recursion unwinds.

## Why it's correct and why pruning is safe

Trying both include and exclude at every item enumerates ALL \`2^n\` subsets, so the true best is never missed. We only refuse to include an item when \`sum + v > capacity\`; since values are non-negative, adding more later could never bring it back under, so that whole subtree is genuinely hopeless — pruning it loses nothing.

## Complexity in plain terms

With \`n\` items there are \`2^n\` subsets — the runtime doubles with each added item, so it's only practical for small \`n\`. The recursion depth (and stack) is \`O(n)\`.

## Common pitfalls

Forgetting that capacity pruning only works because values are non-negative; and forgetting to pop a frame on backtrack, which would leave stale decisions polluting later paths.`,
  defaultInput: { array: [8, 6, 5, 3], params: { capacity: 14 } },
  expected: 14,
  run,
  code: `function bestSubsetSum(items, capacity) {
  let best = 0;

  function dfs(i, sum) {
    if (i === items.length) {        // leaf: a full subset is chosen
      if (sum > best) best = sum;    // sum is always <= capacity here
      return;
    }
    if (sum + items[i] <= capacity)  // include (only if it still fits)
      dfs(i + 1, sum + items[i]);
    dfs(i + 1, sum);                 // exclude
  }

  dfs(0, 0);
  return best;                       // largest total <= capacity
}`,
};

export default descriptor;
