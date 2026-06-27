import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { binaryTreeLayout } from '../graphLayout';

// Max-heap / priority queue (insert + sift-up).
//
// Scenario: a live, CHANGING set of experiences where you must repeatedly grab
// the highest-profit one. A max-heap balances fast updates (O(log n) insert)
// with fast max-queries (O(1) peek the root). Stored as a level-order array:
// node i has children 2i+1 and 2i+2, and parent floor((i-1)/2).
//
// We insert each value from input.array one at a time. After each insert, we
// sift the new value UP while it's larger than its parent, swapping. The root
// (heap[0]) is always the maximum.

function run(input: AlgoInput): AlgoResult {
  const values = input.array ?? [];
  const t = new Tracer();
  const heap: number[] = [];

  // Render the heap array as a binary TREE via the graph view.
  // `active` = index currently sifting; `matchRoot` = highlight the root (final step).
  const draw = (active: number | null, matchRoot: boolean): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    const layout = binaryTreeLayout(heap.length);
    const nodes: GraphNode[] = heap.map((v, i) => ({
      id: String(i),
      label: String(v),
      x: layout[i].x,
      y: layout[i].y,
      role: matchRoot && i === 0 ? 'match' : i === active ? 'active' : 'plain',
    }));
    const edges: GraphEdge[] = [];
    for (let i = 0; i < heap.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < heap.length) edges.push({ from: String(i), to: String(left), directed: false });
      if (right < heap.length) edges.push({ from: String(i), to: String(right), directed: false });
    }
    return { nodes, edges };
  };

  for (const value of values) {
    // Insert at the end (next free leaf), then sift up.
    heap.push(value);
    let i = heap.length - 1;

    t.step({
      view: { kind: 'graph', ...draw(i, false) },
      state: [
        { label: 'heap', value: heap.join(' '), highlight: true },
        { label: 'max (root)', value: heap[0] },
      ],
      note: `Insert ${value} as a new leaf at index ${i}. Now sift it up to restore the heap property.`,
    });

    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[i] > heap[parent]) {
        const swapped = heap[i];
        const parentVal = heap[parent];
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        i = parent;
        t.step({
          view: { kind: 'graph', ...draw(i, false) },
          state: [
            { label: 'heap', value: heap.join(' '), highlight: true },
            { label: 'max (root)', value: heap[0] },
          ],
          note: `${swapped} > parent ${parentVal}; swap up. ${swapped} moves to index ${i}.`,
        });
      } else {
        t.step({
          view: { kind: 'graph', ...draw(i, false) },
          state: [
            { label: 'heap', value: heap.join(' ') },
            { label: 'max (root)', value: heap[0] },
          ],
          note: `${heap[i]} ≤ parent ${heap[Math.floor((i - 1) / 2)]}; heap property holds, stop sifting.`,
        });
        break;
      }
    }
  }

  const answer = heap.length ? heap[0] : 0;

  t.step({
    view: { kind: 'graph', ...draw(null, true) },
    state: [
      { label: 'heap', value: heap.join(' ') },
      { label: 'max (root)', value: answer, highlight: true },
    ],
    note: `All values inserted. The root holds the maximum: ${answer}.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'max-heap',
  title: 'Max-heap: the changing top',
  category: 'Heap',
  scenario:
    'A live, changing set of experiences where you must repeatedly grab the highest-profit one. A max-heap balances fast updates (O(log n) insert) with fast max-queries (O(1) peek at the root) — far better than re-sorting after every change.',
  pattern:
    'A binary heap stored as a level-order array: node i has children 2i+1 and 2i+2, parent floor((i-1)/2). On insert, place the value at the next free leaf and sift it UP — swap with the parent while it is larger — to restore the heap property. The root is always the max. O(log n) per insert, O(1) peek.',
  complexity: 'O(log n) insert · O(1) max',
  defaultInput: { array: [5, 3, 8, 1, 9, 2, 7] },
  expected: 9,
  run,
  code: `function buildMaxHeap(values) {
  const heap = [];
  for (const value of values) {
    heap.push(value);              // insert at the next free leaf
    let i = heap.length - 1;
    while (i > 0) {                // sift up
      const parent = (i - 1) >> 1;
      if (heap[i] > heap[parent]) {
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        i = parent;               // keep climbing
      } else break;               // heap property restored
    }
  }
  return heap[0];                  // the root is always the max
}`,
};

export default descriptor;
