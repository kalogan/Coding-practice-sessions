import type { AlgoDescriptor, AlgoInput, AlgoResult, SegNode, SegEdge } from '../types';
import { Tracer } from '../tracer';
import { bstLayout } from '../graphLayout';

// Segment tree for range-sum queries.
// Scenario: you keep getting asked "what's the sum of array[ql..qr]?". Re-adding
// every element each time is O(n) per query. A segment tree precomputes partial
// sums over ranges in a balanced binary tree, so any range can be answered by
// stitching together O(log n) precomputed nodes.
//
// Input: array in input.array; query range in input.params {ql, qr} (inclusive).

interface BuildNode {
  id: string;
  lo: number;
  hi: number;
  value: number;
  left?: string;
  right?: string;
}

function run(input: AlgoInput): AlgoResult {
  const array = input.array ?? [];
  const n = array.length;
  const ql = input.params?.ql ?? 0;
  const qr = input.params?.qr ?? Math.max(0, n - 1);

  const t = new Tracer();

  // ---- PHASE 1: build ----
  // Map of id -> node; children map drives bstLayout.
  const tree = new Map<string, BuildNode>();
  const id = (lo: number, hi: number) => `${lo}-${hi}`;

  // role per node id, recomputed into the view each step
  const role = new Map<string, SegNode['role']>();

  // We need positions before we can emit views, but positions depend on the full
  // tree shape — so build the whole tree structure first (recording build steps as
  // "to draw later"), then lay out, then emit. To keep the trace faithful and
  // simple we instead build first to learn structure, compute layout, then re-walk
  // emitting a step per node value in post-order (the order values are computed).

  const buildOrder: string[] = []; // post-order: order in which values are finalized

  const build = (lo: number, hi: number): BuildNode => {
    const nodeId = id(lo, hi);
    if (lo === hi) {
      const node: BuildNode = { id: nodeId, lo, hi, value: array[lo] };
      tree.set(nodeId, node);
      buildOrder.push(nodeId);
      return node;
    }
    const mid = (lo + hi) >> 1;
    const leftChild = build(lo, mid);
    const rightChild = build(mid + 1, hi);
    const node: BuildNode = {
      id: nodeId,
      lo,
      hi,
      value: leftChild.value + rightChild.value,
      left: leftChild.id,
      right: rightChild.id,
    };
    tree.set(nodeId, node);
    buildOrder.push(nodeId);
    return node;
  };

  let rootId: string | null = null;
  if (n > 0) {
    rootId = build(0, n - 1).id;
  }

  // Layout from the children map.
  const childrenOf = (nodeId: string) => {
    const node = tree.get(nodeId);
    return { left: node?.left ?? null, right: node?.right ?? null };
  };
  const layout = bstLayout(rootId, childrenOf);

  const segEdges: SegEdge[] = [];
  for (const node of tree.values()) {
    if (node.left) segEdges.push({ from: node.id, to: node.left });
    if (node.right) segEdges.push({ from: node.id, to: node.right });
  }

  // Render helper: snapshot all nodes with current roles.
  const drawNodes = (): SegNode[] =>
    [...tree.values()].map((node) => ({
      id: node.id,
      lo: node.lo,
      hi: node.hi,
      value: node.value,
      x: layout[node.id]?.x ?? 0.5,
      y: layout[node.id]?.y ?? 0.5,
      role: role.get(node.id) ?? 'plain',
    }));

  if (n === 0) {
    t.step({
      view: { kind: 'segtree', nodes: [], edges: [] },
      state: [{ label: 'sum', value: 0 }],
      note: 'Empty array — nothing to build, the range sum is 0.',
    });
    return { steps: t.steps, answer: 0 };
  }

  // Emit a build step per node, in the order values are finalized (post-order).
  for (const nodeId of buildOrder) {
    const node = tree.get(nodeId)!;
    role.forEach((_, k) => role.set(k, 'plain'));
    role.set(nodeId, 'active');
    const isLeaf = node.lo === node.hi;
    t.step({
      view: { kind: 'segtree', nodes: drawNodes(), edges: segEdges },
      state: [
        { label: 'building', value: `[${node.lo}, ${node.hi}]` },
        { label: 'value', value: node.value, highlight: true },
      ],
      note: isLeaf
        ? `Leaf [${node.lo}, ${node.hi}] = array[${node.lo}] = ${node.value}.`
        : `Internal [${node.lo}, ${node.hi}] = left + right = ${node.value} (sum of its two children).`,
    });
  }

  // Reset roles after build.
  role.forEach((_, k) => role.set(k, 'plain'));
  t.step({
    view: { kind: 'segtree', nodes: drawNodes(), edges: segEdges },
    state: [
      { label: 'root sum', value: tree.get(rootId!)!.value },
      { label: 'query', value: `[${ql}, ${qr}]` },
    ],
    note: `Tree built. The root holds the total of the whole array (${tree.get(rootId!)!.value}). Now query the range [${ql}, ${qr}].`,
  });

  // ---- PHASE 2: query [ql, qr] ----
  let answer = 0;

  const query = (nodeId: string) => {
    const node = tree.get(nodeId)!;
    const { lo, hi } = node;

    // Fully outside the query range: skip (do not recurse, do not mark).
    if (hi < ql || lo > qr) {
      role.set(nodeId, 'plain');
      t.step({
        view: { kind: 'segtree', nodes: drawNodes(), edges: segEdges },
        state: [
          { label: 'visiting', value: `[${lo}, ${hi}]` },
          { label: 'running sum', value: answer },
        ],
        note: `[${lo}, ${hi}] is fully outside [${ql}, ${qr}] — skip it, contributes nothing.`,
      });
      return;
    }

    // Fully inside: take the whole precomputed value, don't recurse.
    if (lo >= ql && hi <= qr) {
      role.set(nodeId, 'match');
      answer += node.value;
      t.step({
        view: { kind: 'segtree', nodes: drawNodes(), edges: segEdges },
        state: [
          { label: 'visiting', value: `[${lo}, ${hi}]` },
          { label: 'add', value: node.value },
          { label: 'running sum', value: answer, highlight: true },
        ],
        note: `[${lo}, ${hi}] is fully inside [${ql}, ${qr}] — take its precomputed sum ${node.value} and stop here.`,
      });
      return;
    }

    // Partial overlap: recurse into both children.
    role.set(nodeId, 'partial');
    t.step({
      view: { kind: 'segtree', nodes: drawNodes(), edges: segEdges },
      state: [
        { label: 'visiting', value: `[${lo}, ${hi}]` },
        { label: 'running sum', value: answer },
      ],
      note: `[${lo}, ${hi}] partially overlaps [${ql}, ${qr}] — recurse into both children to find the parts that fit.`,
    });
    if (node.left) query(node.left);
    if (node.right) query(node.right);
  };

  query(rootId!);

  t.step({
    view: { kind: 'segtree', nodes: drawNodes(), edges: segEdges },
    state: [{ label: 'answer', value: answer, highlight: true }],
    note: `Range sum of [${ql}, ${qr}] = ${answer}, stitched from the matched (green) nodes.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'segment-tree',
  title: 'Segment tree: range sum',
  category: 'Trees',
  difficulty: 'Hard',
  scenario:
    'You repeatedly need "the sum of array[ql..qr]". Re-adding every element costs O(n) per query. A segment tree precomputes partial sums over ranges in a balanced binary tree, so any range is answered by combining O(log n) precomputed nodes.',
  pattern:
    'Divide-and-conquer over index ranges: each node owns [lo, hi] and stores the aggregate of that slice (leaf = one element, internal = left + right). A query descends from the root; a node fully inside the query contributes its whole value (stop), a node partially overlapping recurses, a node fully outside is skipped. Build is O(n); each query touches O(log n) nodes.',
  complexity: 'O(n) build · O(log n) query',
  defaultInput: { array: [2, 1, 5, 3, 4], params: { ql: 1, qr: 3 } },
  expected: 9,
  run,
  code: `// Build: each node owns a range and stores its sum.
function build(arr, lo, hi) {
  if (lo === hi) return { lo, hi, value: arr[lo] };      // leaf
  const mid = (lo + hi) >> 1;
  const left = build(arr, lo, mid);
  const right = build(arr, mid + 1, hi);
  return { lo, hi, left, right, value: left.value + right.value };
}

// Query: combine O(log n) covering nodes.
function query(node, ql, qr) {
  if (node.hi < ql || node.lo > qr) return 0;            // fully outside
  if (node.lo >= ql && node.hi <= qr) return node.value; // fully inside
  return query(node.left, ql, qr) + query(node.right, ql, qr); // partial
}

function rangeSum(arr, ql, qr) {
  const root = build(arr, 0, arr.length - 1);
  return query(root, ql, qr);
}`,
  eli5: `Imagine a tournament bracket, but instead of winners moving up, each box holds the **total** of everything below it. The bottom boxes are the single array values. Each box above adds up its two children. The very top box holds the grand total of the whole array.

## Why precompute?

If someone asks "what's the sum from index 1 to 3?" you *could* walk the array and add 1 + 5 + 3 every single time. That's fine once, but if they ask a thousand times over a long array, you're re-adding the same numbers again and again. The segment tree does the adding **once, up front**, and stores partial totals so later questions are cheap.

## How a query stitches an answer

To answer a range, you start at the top box and ask three questions about each box you reach:

- **Fully inside the range?** Grab its stored total and stop — no need to look deeper.
- **Partially overlapping?** Split: go into both children and let them sort out which parts fit.
- **Fully outside?** Ignore it entirely.

A range gets covered by a handful of these "fully inside" boxes — never more than about \`2 * log n\` of them — so you stitch the answer from just a few precomputed totals.

## Why the height is log n

Every level cuts each range in half. Halving repeatedly from \`n\` down to \`1\` takes about \`log2(n)\` steps, so the tree is only that tall — and a query walks at most a couple of paths down it.

## Pitfalls

- **Off-by-one ranges:** \`[lo, hi]\` is inclusive on both ends. Mixing inclusive and exclusive bounds is the classic bug.
- **Forgetting the partial case:** if you only handle "fully inside" and "fully outside," partially overlapping nodes never split and you lose part of the sum. Always recurse on partial overlap.`,
};

export default descriptor;
