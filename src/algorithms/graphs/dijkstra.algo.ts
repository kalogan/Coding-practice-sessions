import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { circleLayout } from '../graphLayout';

// Dijkstra's shortest paths on a weighted road network.
// Scenario: cheapest travel cost from a source city across a network of roads,
// where each road has a (non-negative) cost. We keep a tentative distance to
// every node, repeatedly finalize the cheapest unvisited one, and relax its
// neighbours — exactly the production algorithm, with a snapshot per operation.
//
// Edges are given as "A-B-4" (from-to-weight) strings in input.words and are
// undirected (adjacency is built both ways). The source is input.text.

function parseGraph(words: string[]) {
  const adj = new Map<string, Array<{ to: string; w: number }>>();
  const edges: Array<[string, string, number]> = [];
  const see = (id: string) => {
    if (!adj.has(id)) adj.set(id, []);
  };
  for (const word of words) {
    const [a, b, ws] = word.split('-').map((s) => s.trim());
    const w = Number(ws);
    if (!a || !b || !Number.isFinite(w)) continue;
    see(a);
    see(b);
    adj.get(a)!.push({ to: b, w });
    adj.get(b)!.push({ to: a, w }); // undirected
    edges.push([a, b, w]);
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
  const neighbors = (id: string) =>
    [...(adj.get(id) ?? [])].sort((p, q) => p.to.localeCompare(q.to));

  const dist = new Map<string, number>();
  const visited = new Set<string>();
  ids.forEach((id) => dist.set(id, Infinity));
  if (source && dist.has(source)) dist.set(source, 0);

  // role per node: 'visited' (finalized), 'active' (being processed),
  // 'frontier' (finite tentative distance), else 'plain' (still Infinity).
  const roleOf = (id: string): GraphNode['role'] => {
    if (visited.has(id)) return 'visited';
    return Number.isFinite(dist.get(id)!) ? 'frontier' : 'plain';
  };
  const fmt = (d: number) => (Number.isFinite(d) ? String(d) : '∞');

  const nodes = (active?: string): GraphNode[] =>
    ids.map((id) => ({
      id,
      label: `${id}=${fmt(dist.get(id)!)}`,
      x: layout[id].x,
      y: layout[id].y,
      role: id === active && !visited.has(id) ? 'active' : roleOf(id),
    }));
  const drawEdges = (active?: [string, string]): GraphEdge[] =>
    edges.map(([a, b, w]) => ({
      from: a,
      to: b,
      weight: w,
      role:
        active && ((active[0] === a && active[1] === b) || (active[0] === b && active[1] === a))
          ? 'active'
          : 'plain',
    }));

  const distState = () => ({
    label: 'dist',
    value: ids.map((id) => `${id}=${fmt(dist.get(id)!)}`).join(' ') || '∅',
  });

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
    state: [
      { label: 'source', value: source || '∅' },
      { label: 'visited', value: '∅' },
      distState(),
    ],
    note: `Start Dijkstra from ${source}. Its distance is 0; every other node is ∞ (unknown).`,
  });

  // Pick the unvisited node with the smallest tentative distance, finalize it,
  // then relax each of its edges. A real heap makes this O(E log V); here we do
  // a clear linear scan so the choice is visible.
  for (let i = 0; i < ids.length; i++) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of ids) {
      if (!visited.has(id) && dist.get(id)! < best) {
        best = dist.get(id)!;
        u = id;
      }
    }
    if (u === null || !Number.isFinite(best)) break; // rest are unreachable

    t.step({
      view: { kind: 'graph', nodes: nodes(u), edges: drawEdges() },
      state: [
        { label: 'picked', value: `${u} (dist ${fmt(best)})`, highlight: true },
        { label: 'visited', value: [...visited].sort().join(' ') || '∅' },
        distState(),
      ],
      note: `Pick the cheapest unvisited node: ${u} at cost ${fmt(best)}. Finalize it — no shorter path to it can exist.`,
    });

    visited.add(u);

    for (const { to: v, w } of neighbors(u)) {
      if (visited.has(v)) continue;
      const through = dist.get(u)! + w;
      const old = dist.get(v)!;
      if (through < old) {
        dist.set(v, through);
        t.step({
          view: { kind: 'graph', nodes: nodes(u), edges: drawEdges([u, v]) },
          state: [
            { label: 'relax', value: `${u}→${v}: ${fmt(old)} → ${through}`, highlight: true },
            { label: 'visited', value: [...visited].sort().join(' ') },
            distState(),
          ],
          note: `Relax edge ${u}–${v} (cost ${w}): ${fmt(dist.get(u)!)}+${w}=${through} < ${fmt(old)}, so ${v}'s best known cost drops to ${through}.`,
        });
      } else {
        t.step({
          view: { kind: 'graph', nodes: nodes(u), edges: drawEdges([u, v]) },
          state: [
            { label: 'relax', value: `${u}→${v}: ${fmt(old)} kept` },
            { label: 'visited', value: [...visited].sort().join(' ') },
            distState(),
          ],
          note: `Relax edge ${u}–${v} (cost ${w}): ${fmt(dist.get(u)!)}+${w}=${through} is not better than ${fmt(old)}, so keep ${v} at ${fmt(old)}.`,
        });
      }
    }
  }

  const answer = ids
    .filter((id) => Number.isFinite(dist.get(id)!))
    .map((id) => `${id}=${dist.get(id)}`)
    .join(' ');

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
    state: [{ label: 'distances', value: answer || '∅', highlight: true }],
    note: `Done. Cheapest cost from ${source} to each reachable node: ${answer}.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'dijkstra',
  title: 'Dijkstra: cheapest path',
  category: 'Graphs',
  scenario:
    'Find the cheapest travel cost from one city to every other across a weighted road network. Dijkstra keeps a tentative cost to each city, always finalizes the cheapest unfinished one, and relaxes its roads to improve its neighbours.',
  pattern:
    'Greedy + priority queue: dist[source]=0, the rest ∞. Repeatedly extract the unvisited node with the smallest tentative distance, finalize it, and relax every outgoing edge (dist[u]+w improves dist[v]). With non-negative weights, the first time a node is finalized its distance is optimal. A binary heap gives O(E log V).',
  complexity: 'O(E log V) with a heap',
  difficulty: 'Hard',
  defaultInput: { words: ['A-B-4', 'A-C-1', 'C-B-2', 'B-D-5', 'C-D-8', 'D-E-3'], text: 'A' },
  expected: 'A=0 B=3 C=1 D=8 E=11',
  run,
  code: `function dijkstra(adj, source) {
  const dist = {};                       // best known cost to each node
  for (const v of nodes) dist[v] = Infinity;
  dist[source] = 0;
  const pq = new MinHeap([[0, source]]); // (cost, node), cheapest first
  const done = new Set();

  while (!pq.isEmpty()) {
    const [d, u] = pq.pop();             // cheapest unfinished node
    if (done.has(u)) continue;           // stale heap entry
    done.add(u);                         // u is now FINAL
    for (const { to, w } of adj[u]) {    // relax each road out of u
      if (d + w < dist[to]) {            // found a cheaper way to 'to'
        dist[to] = d + w;
        pq.push([dist[to], to]);
      }
    }
  }
  return dist;                           // shortest cost to every node
}`,
  eli5: `## Imagine you're spreading cheap-fare news across towns

You start in your home town (the source) and want the cheapest possible travel cost to every other town. Roads between towns have prices, and you can never get a discount for taking a road (no negative prices).

## The problem

Every town has a "best price I know so far" tag. Your home town's tag is 0. Every other town starts at ∞ because you haven't found any route yet.

## How it works, step by step

- Look at all the towns you haven't *locked in* yet and pick the one with the smallest price tag.
- Lock it in (mark it visited) — that price is now its final, true cheapest cost.
- "Relax" each road out of it: for a neighbour, check if going *through* this town is cheaper than the neighbour's current tag. If \`thisTown + roadPrice < neighbourTag\`, lower the neighbour's tag.
- Repeat until every reachable town is locked in.

## Why greedily picking the closest town is safe

When you pick the unvisited town with the smallest tag, no other route can ever beat it. Any other path would have to leave through some town that *already* costs at least as much, and roads only *add* cost (they're never negative). So there's no sneaky cheaper detour — its tag is already final. That's the whole trick.

## Speed

Scanning for the smallest tag every round is slow. A min-heap (priority queue) hands you the cheapest town instantly, giving \`O(E log V)\` — roughly "number of roads times the log of the number of towns."

## Pitfall

This safety guarantee *only* holds with non-negative weights. A negative road could make a longer-looking path secretly cheaper, so a town you "locked in" might later get beaten. For negative edges, use Bellman–Ford instead.`,
};

export default descriptor;
