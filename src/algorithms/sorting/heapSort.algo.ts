import type { AlgoDescriptor, AlgoInput, AlgoResult, BarRole } from '../types';
import { Tracer } from '../tracer';

// Heapsort.
// Scenario: arrange the array into an in-place MAX-heap (every parent >= its
// children), then repeatedly swap the root (the maximum) to the end of the
// active heap, shrink the heap by one, and sift the new root back down to a
// valid position. The settled suffix grows from the right until everything is
// sorted ascending.

function run(input: AlgoInput): AlgoResult {
  const values = (input.array ?? []).slice(); // copy: we reorder this in place
  const n = values.length;
  const t = new Tracer();
  let comparisons = 0;
  let swaps = 0;

  // `heapSize` is the count of elements still inside the heap; everything at
  // index >= heapSize has already been placed in its final (sorted) slot.
  let heapSize = n;
  let phase: 'build' | 'extract' = 'build';

  // Build a per-bar colour array. The settled suffix (index >= heapSize) is
  // always 'sorted'; everything else is 'plain' unless highlighted.
  const paint = (highlight: Record<number, BarRole> = {}): BarRole[] =>
    values.map((_, i) => {
      if (highlight[i]) return highlight[i];
      return i >= heapSize ? 'sorted' : 'plain';
    });

  const stateRow = (extra: { label: string; value: string | number; highlight?: boolean }) => [
    { label: 'phase', value: phase },
    { label: 'heapSize', value: heapSize },
    { label: 'comparisons', value: comparisons },
    { label: 'swaps', value: swaps },
    extra,
  ];

  // Sift `root` down through the heap (which spans [0, size)) until both its
  // children are <= it, restoring the max-heap property below `root`.
  function siftDown(root: number, size: number): void {
    while (true) {
      const left = 2 * root + 1; // 0-indexed children of `root`
      const right = 2 * root + 2;
      let largest = root;

      if (left < size) {
        comparisons++;
        t.step({
          view: {
            kind: 'array',
            values: values.slice(),
            markers: [],
            bars: paint({ [largest]: 'compare', [left]: 'compare' }),
          },
          state: stateRow({ label: 'comparisons', value: comparisons, highlight: true }),
          note: `Compare parent ${values[largest]} (index ${largest}) with left child ${values[left]} (index ${left}).`,
        });
        if (values[left] > values[largest]) largest = left;
      }

      if (right < size) {
        comparisons++;
        t.step({
          view: {
            kind: 'array',
            values: values.slice(),
            markers: [],
            bars: paint({ [largest]: 'compare', [right]: 'compare' }),
          },
          state: stateRow({ label: 'comparisons', value: comparisons, highlight: true }),
          note: `Compare current largest ${values[largest]} (index ${largest}) with right child ${values[right]} (index ${right}).`,
        });
        if (values[right] > values[largest]) largest = right;
      }

      if (largest === root) {
        // Parent already dominates both children: heap property holds here.
        t.step({
          view: {
            kind: 'array',
            values: values.slice(),
            markers: [],
            bars: paint({ [root]: 'compare' }),
          },
          state: stateRow({ label: 'heapSize', value: heapSize }),
          note: `Parent ${values[root]} (index ${root}) is >= both children — sift-down stops here.`,
        });
        return;
      }

      // Swap the parent with its larger child, then keep sifting from there.
      const tmp = values[root];
      values[root] = values[largest];
      values[largest] = tmp;
      swaps++;
      t.step({
        view: {
          kind: 'array',
          values: values.slice(),
          markers: [],
          bars: paint({ [root]: 'swap', [largest]: 'swap' }),
        },
        state: stateRow({ label: 'swaps', value: swaps, highlight: true }),
        note: `Child ${values[root]} was larger, so swap it up to index ${root}. Continue sifting from index ${largest}.`,
      });
      root = largest;
    }
  }

  // Phase 1 — build a max-heap in place. Start at the last parent (the parent
  // of the final element) and sift each node down, moving toward the root.
  const lastParent = Math.floor(n / 2) - 1;
  for (let i = lastParent; i >= 0; i--) {
    t.step({
      view: {
        kind: 'array',
        values: values.slice(),
        markers: [],
        bars: paint({ [i]: 'compare' }),
      },
      state: stateRow({ label: 'heapSize', value: heapSize }),
      note: `Build-heap: sift node at index ${i} (value ${values[i]}) down into place.`,
    });
    siftDown(i, n);
  }

  if (n > 0) {
    t.step({
      view: {
        kind: 'array',
        values: values.slice(),
        markers: [],
        bars: paint(),
      },
      state: stateRow({ label: 'heapSize', value: heapSize }),
      note: `Max-heap built: the root ${values[0]} is now the overall maximum.`,
    });
  }

  // Phase 2 — repeatedly extract the maximum. Swap root to the heap's end,
  // shrink the heap, and sift the new root back down.
  phase = 'extract';
  for (let end = n - 1; end > 0; end--) {
    // Swap the maximum (root) with the last element of the active heap.
    const tmp = values[0];
    values[0] = values[end];
    values[end] = tmp;
    swaps++;
    heapSize = end; // the element just moved to `end` is now sorted/settled
    t.step({
      view: {
        kind: 'array',
        values: values.slice(),
        markers: [],
        bars: paint({ 0: 'swap', [end]: 'swap' }),
      },
      state: stateRow({ label: 'swaps', value: swaps, highlight: true }),
      note: `Extract-max: swap root ${values[end]} to index ${end} (its final spot) and shrink the heap to size ${heapSize}.`,
    });

    // Restore the heap property for the reduced heap [0, heapSize).
    siftDown(0, heapSize);
  }

  heapSize = 0;
  t.step({
    view: {
      kind: 'array',
      values: values.slice(),
      markers: [],
      bars: values.map(() => 'sorted' as BarRole),
    },
    state: [
      { label: 'phase', value: phase },
      { label: 'comparisons', value: comparisons },
      { label: 'swaps', value: swaps },
      { label: 'answer', value: values.join(' '), highlight: true },
    ],
    note: `Sorted ascending. ${comparisons} comparisons and ${swaps} swaps total.`,
  });

  return { steps: t.steps, answer: values.join(' ') };
}

const descriptor: AlgoDescriptor = {
  id: 'heap-sort',
  title: 'Heapsort',
  category: 'Sorting',
  scenario:
    'Reshape the array into an in-place max-heap so the biggest value sits at the root, then repeatedly swap that root to the end, shrink the heap by one, and sift the new root down. Each extraction grows a sorted suffix on the right until the whole array is ordered.',
  pattern:
    'Selection-by-heap: a binary max-heap lets you pull the current maximum in O(log n) instead of O(n). Build the heap bottom-up (sift each parent down), then extract-max n times, sifting the replacement root down each time to keep the heap valid.',
  complexity: 'O(n log n) time · O(1) space',
  difficulty: 'Medium',
  eli5: `## The everyday picture

Imagine a self-organizing pile of stones where the heaviest stone always floats to the very top. You grab the top stone (guaranteed heaviest), set it aside in the "done" area, and the pile instantly reshuffles so the next-heaviest rises to the top. Grab again, set aside, repeat. The done pile grows in order from heaviest to lightest, and reading it back gives you everything sorted.

## What problem it solves

It sorts numbers ascending using a clever structure — a binary "max-heap" — that makes finding the largest remaining value cheap.

## How it works, step by step

- First we BUILD the heap in place: starting from the last parent and walking up to the root, we "sift down" each node so every parent ends up at least as big as both of its children.
- Then we EXTRACT-MAX repeatedly: the root holds the maximum, so we swap it with the last heap element, shrink the heap by one (that slot is now final), and sift the new root down to restore order.
- Sift-down keeps the heap valid: it compares a parent with its larger child and swaps downward until the parent dominates both children, so the max-heap property is never broken below it.

## Why it's correct and efficient

Each extract pulls the true maximum to the front of the sorted suffix, so the suffix is always sorted. Building the heap is O(n); each of the n sift-downs costs O(log n), giving O(n log n). All swaps happen inside the array, so it uses O(1) extra space.

## Common pitfalls

- Mixing up 0-indexed children (\`2i+1\`, \`2i+2\`) with 1-indexed ones (\`2i\`, \`2i+1\`).
- Sifting against the wrong boundary — you must sift within the SHRUNK heap size, not the full array, or you'll disturb already-sorted elements.`,
  defaultInput: { array: [5, 2, 8, 1, 9, 3] },
  expected: '1 2 3 5 8 9',
  run,
  code: `function heapSort(values) {
  const a = values.slice();
  const n = a.length;

  function siftDown(root, size) {
    while (true) {
      const left = 2 * root + 1;   // 0-indexed children
      const right = 2 * root + 2;
      let largest = root;
      if (left < size && a[left] > a[largest]) largest = left;
      if (right < size && a[right] > a[largest]) largest = right;
      if (largest === root) return;          // heap property holds
      [a[root], a[largest]] = [a[largest], a[root]];
      root = largest;                        // keep sifting down
    }
  }

  // Build a max-heap bottom-up.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);

  // Repeatedly move the max to the end, then re-heapify the rest.
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];         // extract max
    siftDown(0, end);                        // sift within shrunk heap
  }

  return a.join(' ');
}`,
};

export default descriptor;
