import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { bstLayout } from '../graphLayout';

// Binary search tree: build, then SEARCH.
//
// Scenario: a binary search tree keeps values ordered so a lookup prunes half
// the tree at each step — go left when the target is smaller than the current
// node, right when it is larger. That is O(height): on a balanced tree, each
// comparison throws away half the remaining nodes.
//
// We insert input.array values in order to build the tree (ids = String(value),
// unique). We keep left/right child maps. THEN we search for input.params.target,
// emitting a step at each node on the path: the current node is 'active', nodes
// already passed are 'visited', and the found node is 'match'.

function run(input: AlgoInput): AlgoResult {
  const values = input.array ?? [];
  const target = input.params?.target ?? 0;
  const t = new Tracer();

  // BST stored as child maps keyed by node id (= String(value)).
  const left = new Map<string, string | null>();
  const right = new Map<string, string | null>();
  const valueOf = new Map<string, number>();
  let root: string | null = null;

  const childrenOf = (id: string) => ({ left: left.get(id) ?? null, right: right.get(id) ?? null });

  // Roles drive the colours; rebuilt from `status` on every step.
  const status = new Map<string, GraphNode['role']>();

  const build = (): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    const layout = bstLayout(root, childrenOf);
    const nodes: GraphNode[] = [...valueOf.keys()].map((id) => ({
      id,
      label: String(valueOf.get(id)),
      x: layout[id].x,
      y: layout[id].y,
      role: status.get(id) ?? 'plain',
    }));
    const edges: GraphEdge[] = [];
    for (const id of valueOf.keys()) {
      const l = left.get(id);
      const r = right.get(id);
      if (l) edges.push({ from: id, to: l, directed: true });
      if (r) edges.push({ from: id, to: r, directed: true });
    }
    return { nodes, edges };
  };

  // --- Build phase: insert each value in order ---
  for (const value of values) {
    const id = String(value);
    valueOf.set(id, value);
    status.set(id, 'plain');
    left.set(id, left.get(id) ?? null);
    right.set(id, right.get(id) ?? null);

    if (root === null) {
      root = id;
      continue;
    }
    let cur: string = root;
    while (true) {
      if (value < valueOf.get(cur)!) {
        const l = left.get(cur) ?? null;
        if (l === null) {
          left.set(cur, id);
          break;
        }
        cur = l;
      } else {
        const r = right.get(cur) ?? null;
        if (r === null) {
          right.set(cur, id);
          break;
        }
        cur = r;
      }
    }
  }

  t.step({
    view: { kind: 'graph', ...build() },
    state: [
      { label: 'tree', value: values.join(' ') },
      { label: 'target', value: target },
    ],
    note: `Built the BST by inserting ${values.join(', ')} in order. Now search for ${target}, pruning half the tree at each node.`,
  });

  // --- Search phase ---
  const path: number[] = [];
  let cur: string | null = root;
  let found = false;

  while (cur !== null) {
    const nodeVal = valueOf.get(cur)!;
    path.push(nodeVal);
    status.set(cur, 'active');

    if (target === nodeVal) {
      status.set(cur, 'match');
      found = true;
      t.step({
        view: { kind: 'graph', ...build() },
        state: [
          { label: 'target', value: target },
          { label: 'path', value: path.join(' '), highlight: true },
        ],
        note: `${nodeVal} === ${target}. Found it — the search path is ${path.join(' ')}.`,
      });
      break;
    }

    const goLeft = target < nodeVal;
    const next: string | null = goLeft ? left.get(cur) ?? null : right.get(cur) ?? null;
    t.step({
      view: { kind: 'graph', ...build() },
      state: [
        { label: 'target', value: target },
        { label: 'path', value: path.join(' '), highlight: true },
      ],
      note:
        next === null
          ? `${target} ${goLeft ? '<' : '>'} ${nodeVal}, go ${goLeft ? 'left' : 'right'} — but there is no child. ${target} is not in the tree.`
          : `${target} ${goLeft ? '<' : '>'} ${nodeVal}, so go ${goLeft ? 'left' : 'right'} and prune the other subtree.`,
    });

    // The node we just left is now part of the visited path.
    status.set(cur, 'visited');
    cur = next;
  }

  const answer = path.join(' ');

  if (!found) {
    t.step({
      view: { kind: 'graph', ...build() },
      state: [
        { label: 'target', value: target },
        { label: 'path', value: answer, highlight: true },
      ],
      note: `${target} is not in the tree. Path walked: ${answer}.`,
    });
  }

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'bst-search',
  title: 'Binary search tree: search',
  category: 'Trees',
  scenario:
    'A binary search tree keeps values ordered: everything in a node’s left subtree is smaller, everything on the right is larger. Searching prunes half the tree at each step — go left when the target is smaller, right when it is larger — so a lookup costs O(height) comparisons instead of scanning every value.',
  pattern:
    'BST invariant: left subtree < node < right subtree. To search, start at the root and compare: equal → found; target smaller → recurse left; target larger → recurse right. Each comparison discards one whole subtree, so a balanced tree gives O(log n). The same walk drives insert (descend until you hit an empty slot).',
  complexity: 'O(h) search',
  defaultInput: { array: [8, 3, 10, 1, 6, 14, 4, 7, 13], params: { target: 7 } },
  expected: '8 3 6 7',
  run,
  code: `function bstSearch(values, target) {
  // Build the BST by inserting each value in order.
  let root = null;
  for (const v of values) {
    const node = { value: v, left: null, right: null };
    if (!root) { root = node; continue; }
    let cur = root;
    while (true) {
      if (v < cur.value) {
        if (!cur.left) { cur.left = node; break; }
        cur = cur.left;
      } else {
        if (!cur.right) { cur.right = node; break; }
        cur = cur.right;
      }
    }
  }

  // Search: prune half the tree at each node.
  const path = [];
  let cur = root;
  while (cur) {
    path.push(cur.value);
    if (target === cur.value) break;        // found
    cur = target < cur.value ? cur.left     // go left
                             : cur.right;    // go right
  }
  return path.join(' ');                      // root → target path
}`,
};

export default descriptor;
