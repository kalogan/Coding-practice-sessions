import type { AlgoDescriptor, AlgoInput, AlgoResult, HeapCell } from '../types';
import { Tracer } from '../tracer';

// Max-heap shown as its BACKING ARRAY (the key idea: a heap IS an array).
//
// A binary heap needs no pointers — it lives in a flat, level-order array where
// node i's children sit at 2i+1 and 2i+2 and its parent at floor((i-1)/2). The
// tree shape is implied entirely by index arithmetic.
//
// We insert each value from input.array at the end of the array, then sift it UP
// while it's larger than its parent, swapping. Each step renders all cells (value
// + index); the sifting cell is 'active', a parent/child comparison marks both
// 'compare' (with a link arc), and a swap marks both 'swap'. The root (heap[0]) is
// always the maximum.

function run(input: AlgoInput): AlgoResult {
  const values = input.array ?? [];
  const t = new Tracer();
  const heap: number[] = [];

  // Snapshot the array. `roles` overrides the colour of specific indices; `link`
  // (optional) draws the i -> (parent) arc the current sift is using.
  const draw = (
    roles: Record<number, HeapCell['role']> = {},
    link?: { parent: number; child: number },
  ): { kind: 'heaparray'; cells: HeapCell[]; links?: Array<{ parent: number; child: number }> } => {
    const cells: HeapCell[] = heap.map((value, index) => ({
      index,
      value,
      role: roles[index] ?? 'plain',
    }));
    return link ? { kind: 'heaparray', cells, links: [link] } : { kind: 'heaparray', cells };
  };

  for (const value of values) {
    // Insert at the next free slot — the end of the array (a new leaf).
    heap.push(value);
    let i = heap.length - 1;

    t.step({
      view: draw({ [i]: 'active' }),
      state: [
        { label: 'heap', value: heap.join(' '), highlight: true },
        { label: 'max (heap[0])', value: heap[0] },
      ],
      note: `Insert ${value} at the next free slot, index ${i} (the end of the array). Now sift it up to restore the heap property.`,
    });

    while (i > 0) {
      const parent = (i - 1) >> 1; // floor((i - 1) / 2)

      // Compare the sifting cell with its parent — light both up and draw the arc.
      t.step({
        view: draw({ [i]: 'compare', [parent]: 'compare' }, { parent, child: i }),
        state: [
          { label: 'heap', value: heap.join(' ') },
          { label: 'comparing', value: `heap[${i}]=${heap[i]} vs heap[${parent}]=${heap[parent]}` },
          { label: 'max (heap[0])', value: heap[0] },
        ],
        note: `Index ${i}'s parent is floor((${i}-1)/2) = ${parent}. Compare heap[${i}]=${heap[i]} with parent heap[${parent}]=${heap[parent]}.`,
      });

      if (heap[i] > heap[parent]) {
        const child = heap[i];
        const parentVal = heap[parent];
        [heap[i], heap[parent]] = [heap[parent], heap[i]];

        // Show the swap on both cells before climbing.
        t.step({
          view: draw({ [i]: 'swap', [parent]: 'swap' }, { parent, child: i }),
          state: [
            { label: 'heap', value: heap.join(' '), highlight: true },
            { label: 'max (heap[0])', value: heap[0] },
          ],
          note: `${child} > parent ${parentVal}: swap. ${child} climbs from index ${i} to index ${parent}; ${parentVal} drops to ${i}.`,
        });

        i = parent; // keep climbing from the parent's slot
      } else {
        t.step({
          view: draw({ [i]: 'active' }),
          state: [
            { label: 'heap', value: heap.join(' ') },
            { label: 'max (heap[0])', value: heap[0] },
          ],
          note: `heap[${i}]=${heap[i]} ≤ parent heap[${parent}]=${heap[parent]}: heap property holds, stop sifting.`,
        });
        break;
      }
    }
  }

  const answer = heap.length ? heap[0] : 0;

  t.step({
    view: draw({ 0: 'active' }),
    state: [
      { label: 'heap', value: heap.join(' ') },
      { label: 'max (heap[0])', value: answer, highlight: true },
    ],
    note: `All values inserted. The root, heap[0], holds the maximum: ${answer}.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'heap-array',
  title: 'Heap as an array',
  category: 'Heap',
  difficulty: 'Medium',
  scenario:
    'A binary heap needs no pointers — it lives in a flat array. Node i’s children are at 2i+1 and 2i+2 and its parent at floor((i-1)/2), so the whole tree shape is reconstructed from arithmetic alone. That makes a heap cache-friendly and tiny: no node objects, no left/right links, just one contiguous array. Here we insert values and sift up, watching the changes happen on the array itself.',
  pattern:
    'Store a complete binary tree level-by-level in an array: index i has children 2i+1 and 2i+2 and parent floor((i-1)/2). On insert, append at the end (the next free leaf) and sift UP — while the new value exceeds its parent, swap and move to the parent’s index. Because a complete tree of n nodes has height ~log2(n), sift-up touches at most one node per level: O(log n) insert. The root is always the max, so peek is O(1).',
  complexity: 'O(log n) insert · O(1) max',
  defaultInput: { array: [3, 1, 6, 5, 2, 4] },
  expected: 6,
  run,
  code: `function buildMaxHeap(values) {
  const heap = [];
  for (const value of values) {
    heap.push(value);              // append at the next free slot (a leaf)
    let i = heap.length - 1;
    while (i > 0) {                // sift up
      const parent = (i - 1) >> 1; // floor((i - 1) / 2)
      if (heap[i] > heap[parent]) {
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        i = parent;               // keep climbing
      } else break;               // heap property restored
    }
  }
  return heap[0];                  // the root is always the max
}`,
  eli5: `## A theatre with cleverly numbered seats

Imagine a theatre where the seats are numbered 0, 1, 2, 3, ... in reading order: row by row, left to right. Because of how you numbered them, you never need a seating map. The two seats "below" seat \`i\` (its children) are always \`2i+1\` and \`2i+2\`, and the seat "above" it (its parent) is always \`floor((i-1)/2)\`. Want seat 4's parent? \`floor((4-1)/2) = 1\`. Done — no map, just arithmetic.

That is exactly what a heap array is. The array IS the tree.

## Why a plain array can be a tree

A heap is a *complete* binary tree — every level is full except maybe the last, which fills left to right. That "no gaps" rule is what lets the numbering work: there are never holes, so index \`i\` always lands on a real node and the child/parent formulas never point at empty space.

## Inserting and sifting up

To add a value, drop it in the next empty slot (the end of the array). It might be bigger than its parent, which breaks the rule "parents are larger than children." So we *sift up*: compare with the parent at \`floor((i-1)/2)\`; if we're bigger, swap and move up to the parent's index; repeat. Each swap pushes the newcomer one level closer to the root until it finds a parent that's already bigger — then the rule holds again everywhere.

Example: into \`[6,5,3,1,2]\` we insert 4 at index 5. Parent is \`floor((5-1)/2)=2\`, holding 3. Since 4 > 3, swap: 4 moves to index 2, and we stop because its new parent (6) is bigger.

## Why it's fast

A complete tree of \`n\` nodes is only about \`log2(n)\` levels tall, and sift-up climbs at most one node per level — so insert is O(log n). The biggest value always bubbles to index 0, so reading the max is O(1): just peek \`heap[0]\`.

## Pitfalls

- Off-by-one in the formulas: it's \`2i+1\`/\`2i+2\` for children and \`floor((i-1)/2)\` for the parent. Using \`2i\`/\`2i+1\` is the 1-indexed version — mixing them corrupts the tree.
- Forgetting to stop sifting once \`heap[i] <= heap[parent]\`; the heap property already holds, so climbing further wastes work.`,
};

export default descriptor;
