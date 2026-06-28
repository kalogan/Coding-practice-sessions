import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { circleLayout } from '../graphLayout';

// Topological sort (Kahn's algorithm) — dependency resolution.
// Scenario: figure out the order to install/build a set of packages given
// "X must come before Y" constraints (X is a dependency of Y).
//
// Edges are given as "X->Y" strings in input.words, meaning X must precede Y.
// Edges are DIRECTED. Kahn's algorithm:
//   1. compute in-degree of every node,
//   2. take any node with in-degree 0 (we use SORTED order for determinism),
//      append it to the output,
//   3. decrement the in-degree of each of its successors; any that hit 0 are
//      now ready,
//   4. repeat until no ready node remains.

function parseGraph(words: string[]) {
  const adj = new Map<string, string[]>();
  const edges: Array<[string, string]> = [];
  const see = (id: string) => {
    if (!adj.has(id)) adj.set(id, []);
  };
  for (const w of words) {
    const [a, b] = w.split('->').map((s) => s.trim());
    if (!a || !b) continue;
    see(a);
    see(b);
    adj.get(a)!.push(b);
    edges.push([a, b]);
  }
  return { adj, edges };
}

function run(input: AlgoInput): AlgoResult {
  const words = input.array ? input.array.map(String) : (input.words ?? []);
  const t = new Tracer();
  const { adj, edges } = parseGraph(words);

  const ids = [...adj.keys()].sort();
  const layout = circleLayout(ids);
  const successors = (id: string) => [...(adj.get(id) ?? [])].sort();

  // in-degree of each node = number of unresolved dependencies
  const indeg = new Map<string, number>();
  ids.forEach((id) => indeg.set(id, 0));
  for (const [, b] of edges) indeg.set(b, (indeg.get(b) ?? 0) + 1);

  // role per node: 'done' (output), 'active' (being removed), 'frontier' (ready, in-degree 0)
  const status = new Map<string, GraphNode['role']>();
  ids.forEach((id) => status.set(id, indeg.get(id) === 0 ? 'frontier' : 'plain'));

  const order: string[] = [];
  // ready set: nodes with in-degree 0, kept sorted for deterministic output
  const ready: string[] = ids.filter((id) => indeg.get(id) === 0).sort();

  const nodes = (): GraphNode[] =>
    ids.map((id) => ({ id, label: id, x: layout[id].x, y: layout[id].y, role: status.get(id) }));
  const drawEdges = (active?: [string, string]): GraphEdge[] =>
    edges.map(([a, b]) => ({
      from: a,
      to: b,
      directed: true,
      role: active && active[0] === a && active[1] === b ? 'active' : 'plain',
    }));

  const readyVal = () => (ready.length ? [...ready].join(' ') : '∅');
  const orderVal = () => (order.length ? order.join(' ') : '∅');

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
    state: [
      { label: 'ready (in-deg 0)', value: readyVal() },
      { label: 'order', value: orderVal() },
    ],
    note: `Compute in-degrees. Nodes with no incoming edges are ready: ${readyVal()}.`,
  });

  while (ready.length) {
    // take the smallest ready node for a deterministic order
    const node = ready.shift()!;
    status.set(node, 'active');
    order.push(node);
    t.step({
      view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
      state: [
        { label: 'ready (in-deg 0)', value: readyVal() },
        { label: 'order', value: orderVal(), highlight: true },
      ],
      note: `Remove ${node} (in-degree 0) and append it to the order. Now relax its outgoing edges.`,
    });

    for (const nb of successors(node)) {
      indeg.set(nb, indeg.get(nb)! - 1);
      const becameReady = indeg.get(nb) === 0;
      if (becameReady) {
        // insert keeping `ready` sorted so output stays deterministic
        let i = 0;
        while (i < ready.length && ready[i] < nb) i++;
        ready.splice(i, 0, nb);
        status.set(nb, 'frontier');
      }
      t.step({
        view: { kind: 'graph', nodes: nodes(), edges: drawEdges([node, nb]) },
        state: [
          { label: 'ready (in-deg 0)', value: readyVal() },
          { label: 'order', value: orderVal() },
        ],
        note: becameReady
          ? `Relax ${node}→${nb}: ${nb}'s in-degree drops to 0 — it's now ready.`
          : `Relax ${node}→${nb}: ${nb}'s in-degree drops to ${indeg.get(nb)} (still has dependencies).`,
      });
    }
    status.set(node, 'done');
  }

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
    state: [{ label: 'order', value: order.join(' '), highlight: true }],
    note:
      order.length === ids.length
        ? `Done. A valid install order: ${order.join(' ')}.`
        : `Stuck — a cycle remains, so no full ordering exists. Resolved so far: ${order.join(' ')}.`,
  });

  return { steps: t.steps, answer: order.join(' ') };
}

const descriptor: AlgoDescriptor = {
  id: 'topo-sort',
  title: 'Topological sort: resolve dependencies',
  category: 'Graphs',
  scenario:
    'Packages depend on one another ("X must be built before Y"). Topological sort produces an install/build order that respects every dependency, using Kahn\'s algorithm: repeatedly take a package with nothing left to wait on.',
  pattern:
    "Kahn's algorithm: compute each node's in-degree (number of unmet dependencies). Repeatedly remove a node with in-degree 0, append it to the order, and decrement its successors' in-degrees — any that reach 0 become ready. If every node is output, the order is valid; if some remain, there's a cycle. O(V + E).",
  complexity: 'O(V + E) time · O(V) space',
  difficulty: 'Medium',
  eli5: `## The everyday picture

Imagine you're getting dressed. You can't put on shoes before socks, and you can't put on a jacket before a shirt. Topological sort is the algorithm that figures out a full get-dressed order that never violates any "X before Y" rule.

## What problem it solves

Given tasks with dependencies (here packages where \`C->A\` means "build C before A"), produce one linear order in which every task comes after everything it depends on. If the rules form a cycle (A waits on B which waits on A), no valid order exists.

## How it works, step by step

We use Kahn's algorithm. First we count each node's \`indeg\` — how many arrows point INTO it, i.e. how many unmet dependencies it has. Anything with \`indeg === 0\` needs nothing, so it goes into the \`ready\` set. We repeatedly pull a node out of \`ready\`, append it to \`order\`, and "relax" its outgoing edges: for each successor we do \`--indeg\`. The moment a successor's count hits 0, all its dependencies are satisfied, so it joins \`ready\`. (We keep \`ready\` sorted only so the output is deterministic.)

## Why it's correct and efficient

A node is only emitted once its dependency count reaches zero, so it always appears after every prerequisite — correctness by construction. Each node enters \`ready\` once and each edge is relaxed once, giving \`O(V + E)\`: linear in the graph size.

## Common pitfalls

If \`order.length !== nodes.length\` at the end, leftover nodes are trapped in a cycle and there is NO valid ordering — don't return a partial order as if it were complete.`,
  defaultInput: { words: ['C->A', 'C->B', 'A->D', 'B->D'] },
  expected: 'C A B D',
  run,
  code: `function topoSort(adj, nodes) {
  const indeg = {};
  for (const n of nodes) indeg[n] = 0;
  for (const u of nodes)
    for (const v of adj[u]) indeg[v]++;      // count dependencies

  const ready = nodes.filter(n => indeg[n] === 0).sort();
  const order = [];
  while (ready.length) {
    const u = ready.shift();                 // take a node with no deps left
    order.push(u);
    for (const v of adj[u]) {
      if (--indeg[v] === 0)                   // relax edge u->v
        insertSorted(ready, v);              // v is now ready
    }
  }
  return order.length === nodes.length
    ? order                                  // valid ordering
    : null;                                  // cycle: impossible
}`,
};

export default descriptor;
