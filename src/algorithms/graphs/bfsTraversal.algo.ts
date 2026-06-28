import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { circleLayout } from '../graphLayout';

// Breadth-first traversal of a social graph.
// Scenario: spread of an invite/message from one person across their network —
// explore everyone one "hop" away before going deeper. The queue holds the
// frontier; we visit in waves.
//
// Edges are given as "A-B" strings in input.words; the source is input.text.
// Friendships are bidirectional, so each edge goes both ways.

function parseGraph(words: string[]) {
  const adj = new Map<string, Set<string>>();
  const edges: Array<[string, string]> = [];
  const see = (id: string) => {
    if (!adj.has(id)) adj.set(id, new Set());
  };
  for (const w of words) {
    const [a, b] = w.split('-').map((s) => s.trim());
    if (!a || !b) continue;
    see(a);
    see(b);
    adj.get(a)!.add(b);
    adj.get(b)!.add(a); // bidirectional
    edges.push([a, b]);
  }
  return { adj, edges };
}

function run(input: AlgoInput): AlgoResult {
  const words = input.array ? input.array.map(String) : (input.words ?? []);
  const source = input.text ?? '';
  const t = new Tracer();
  const { adj, edges } = parseGraph(words);

  const ids = [...adj.keys()].sort();
  const layout = circleLayout(ids);
  const neighbors = (id: string) => [...(adj.get(id) ?? [])].sort();

  // role per node: 'visited' (done), 'active' (being processed), 'frontier' (queued)
  const status = new Map<string, GraphNode['role']>();
  ids.forEach((id) => status.set(id, 'plain'));

  const nodes = (): GraphNode[] =>
    ids.map((id) => ({ id, label: id, x: layout[id].x, y: layout[id].y, role: status.get(id) }));
  const drawEdges = (active?: [string, string]): GraphEdge[] =>
    edges.map(([a, b]) => ({
      from: a,
      to: b,
      role: active && ((active[0] === a && active[1] === b) || (active[0] === b && active[1] === a)) ? 'active' : 'plain',
    }));

  const order: string[] = [];
  const queue: string[] = [];
  const enqueued = new Set<string>();

  if (source && adj.has(source)) {
    queue.push(source);
    enqueued.add(source);
    status.set(source, 'frontier');
  }

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
    state: [
      { label: 'queue', value: queue.join(' ') || '∅' },
      { label: 'visited', value: order.join(' ') || '∅' },
    ],
    note: `Start BFS from ${source}. Put it in the queue (the frontier).`,
  });

  while (queue.length) {
    const node = queue.shift()!;
    status.set(node, 'active');
    order.push(node);
    t.step({
      view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
      state: [
        { label: 'queue', value: queue.join(' ') || '∅' },
        { label: 'visited', value: order.join(' '), highlight: true },
      ],
      note: `Dequeue ${node} and visit it. Now look at its friends.`,
    });

    for (const nb of neighbors(node)) {
      if (!enqueued.has(nb)) {
        enqueued.add(nb);
        queue.push(nb);
        status.set(nb, 'frontier');
        t.step({
          view: { kind: 'graph', nodes: nodes(), edges: drawEdges([node, nb]) },
          state: [
            { label: 'queue', value: queue.join(' ') },
            { label: 'visited', value: order.join(' ') },
          ],
          note: `${nb} is new — add it to the back of the queue.`,
        });
      }
    }
    status.set(node, 'visited');
  }

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
    state: [{ label: 'visit order', value: order.join(' '), highlight: true }],
    note: `Done. BFS visit order: ${order.join(' ')}.`,
  });

  return { steps: t.steps, answer: order.join(' ') };
}

const descriptor: AlgoDescriptor = {
  id: 'bfs-traversal',
  title: 'BFS: spread across a network',
  category: 'Graphs',
  scenario:
    'An invite spreads through a friend network. Breadth-first search explores everyone one hop away before going deeper, using a queue to hold the frontier.',
  pattern:
    'Queue-based frontier: enqueue the source; repeatedly dequeue a node, visit it, and enqueue its not-yet-seen neighbours. Mark nodes seen on enqueue (not on visit) so each is queued once. O(V + E).',
  complexity: 'O(V + E) time · O(V) space',
  difficulty: 'Medium',
  eli5: `## Everyday analogy

Imagine telling a secret to one friend, who tells all *their* friends, who then tell all of *theirs*. The news spreads in rings: everyone one hop away hears it first, then everyone two hops away, and so on. BFS explores a graph in exactly these waves.

## What problem it solves

Given a friend network (edges like \`"A-B"\`, friendships bidirectional) and a starting person \`source\`, BFS visits everyone reachable, nearest-first. That ordering is what makes it the go-to for shortest-path-in-hops and "spread" problems.

## How it works step by step

- Build an adjacency map, then seed a \`queue\` with the \`source\` and mark it \`enqueued\`.
- Loop while the queue isn't empty: \`shift()\` the front node (FIFO), record it in \`order\`, and look at its neighbours.
- For each neighbour not yet \`enqueued\`, mark it seen and \`push\` it to the back of the queue.

## Why marking on enqueue matters

The key subtlety: nodes are marked seen *when added to the queue*, not when visited. If you waited until visiting, the same node could be queued several times by different neighbours, inflating work and possibly revisiting. Marking on enqueue guarantees each node is queued exactly once.

## Complexity in plain terms

Every vertex is processed once and every edge is looked at once (twice, since edges are bidirectional, but still constant per edge): O(V + E) time, O(V) space for the queue and seen-set.

## Common pitfalls

Using a stack instead of a queue (that's DFS, depth-first, wrong order); marking seen on dequeue (duplicates); or forgetting edges are bidirectional so half the network never gets reached.`,
  defaultInput: { words: ['A-B', 'A-C', 'B-D', 'C-D', 'D-E', 'C-F'], text: 'A' },
  expected: 'A B C D F E',
  run,
  code: `function bfs(adj, source) {
  const order = [], queue = [source];
  const seen = new Set([source]);
  while (queue.length) {
    const node = queue.shift();        // take from the FRONT (FIFO)
    order.push(node);
    for (const nb of adj[node]) {
      if (!seen.has(nb)) {             // mark seen on enqueue
        seen.add(nb);
        queue.push(nb);                // add to the BACK
      }
    }
  }
  return order;                        // breadth-first visit order
}`,
};

export default descriptor;
