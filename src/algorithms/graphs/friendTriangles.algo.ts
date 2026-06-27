import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { circleLayout } from '../graphLayout';

// Count "friend triangles" in a social network.
// Scenario: find every set of 3 people who are all mutual friends (a triangle).
// Each triangle is counted ONCE — we only test triples i<j<k over sorted ids, so
// {A,B,C} is examined a single time and never as {B,A,C} etc.
//
// Friendships are given as "A-B" strings in input.words and are bidirectional,
// so the adjacency set records both directions. A triple is a triangle iff all
// three of its edges (i-j, i-k, j-k) exist.

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
  const t = new Tracer();
  const { adj, edges } = parseGraph(words);

  const ids = [...adj.keys()].sort();
  const layout = circleLayout(ids);
  const friends = (a: string, b: string) => adj.get(a)?.has(b) ?? false;

  // role per node, rebuilt into a fresh nodes() each step
  const status = new Map<string, GraphNode['role']>();
  const resetStatus = () => ids.forEach((id) => status.set(id, 'plain'));
  resetStatus();

  const nodes = (): GraphNode[] =>
    ids.map((id) => ({ id, label: id, x: layout[id].x, y: layout[id].y, role: status.get(id) }));

  // edgeRoles keyed by an unordered "min|max" pair; default 'plain'
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const drawEdges = (roles: Map<string, GraphEdge['role']>): GraphEdge[] =>
    edges.map(([a, b]) => ({ from: a, to: b, role: roles.get(key(a, b)) ?? 'plain' }));

  let count = 0;
  const triangles: string[] = [];

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges(new Map()) },
    state: [
      { label: 'triangles', value: 0 },
      { label: 'nodes', value: ids.join(' ') || '∅' },
    ],
    note: `Built bidirectional adjacency from ${edges.length} friendship(s). We will scan every triple i<j<k of the ${ids.length} people exactly once.`,
  });

  // enumerate triples i<j<k over sorted ids → each triangle considered once
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      for (let k = j + 1; k < ids.length; k++) {
        const a = ids[i];
        const b = ids[j];
        const c = ids[k];

        // mark the three candidate people active
        resetStatus();
        status.set(a, 'active');
        status.set(b, 'active');
        status.set(c, 'active');

        const ab = friends(a, b);
        const ac = friends(a, c);
        const bc = friends(b, c);

        // light up whichever of the three edges actually exist
        const roles = new Map<string, GraphEdge['role']>();
        if (ab) roles.set(key(a, b), 'active');
        if (ac) roles.set(key(a, c), 'active');
        if (bc) roles.set(key(b, c), 'active');

        const present = [ab && `${a}-${b}`, ac && `${a}-${c}`, bc && `${b}-${c}`].filter(Boolean) as string[];

        t.step({
          view: { kind: 'graph', nodes: nodes(), edges: drawEdges(roles) },
          state: [
            { label: 'triangles', value: count },
            { label: 'testing', value: `${a} ${b} ${c}` },
            { label: 'edges present', value: present.join(' ') || 'none' },
          ],
          note: `Test triple {${a}, ${b}, ${c}}. Need all three friendships: ${a}-${b} ${ab ? '✓' : '✗'}, ${a}-${c} ${ac ? '✓' : '✗'}, ${b}-${c} ${bc ? '✓' : '✗'}.`,
        });

        if (ab && ac && bc) {
          count++;
          triangles.push(`${a}${b}${c}`);

          // all three edges present → mark nodes and edges as a match
          const matchRoles = new Map<string, GraphEdge['role']>();
          matchRoles.set(key(a, b), 'match');
          matchRoles.set(key(a, c), 'match');
          matchRoles.set(key(b, c), 'match');
          status.set(a, 'match');
          status.set(b, 'match');
          status.set(c, 'match');

          t.step({
            view: { kind: 'graph', nodes: nodes(), edges: drawEdges(matchRoles) },
            state: [
              { label: 'triangles', value: count, highlight: true },
              { label: 'found', value: triangles.join(' ') },
            ],
            note: `All three friendships exist — {${a}, ${b}, ${c}} is a triangle. Count is now ${count}.`,
          });
        }
      }
    }
  }

  resetStatus();
  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: drawEdges(new Map()) },
    state: [
      { label: 'triangles', value: count, highlight: true },
      { label: 'found', value: triangles.join(' ') || 'none' },
    ],
    note: `Done. Found ${count} distinct friend triangle(s)${triangles.length ? `: ${triangles.join(' ')}` : ''}.`,
  });

  return { steps: t.steps, answer: count };
}

const descriptor: AlgoDescriptor = {
  id: 'friend-triangles',
  title: 'Friend triangles: count without duplicates',
  category: 'Graphs',
  scenario:
    'In a social network, a "friend triangle" is a set of three people who are all mutual friends. We count every such triangle exactly once, treating friendships as bidirectional.',
  pattern:
    'Build a bidirectional adjacency set, then enumerate triples with strict ordering i<j<k over the sorted node ids. The ordering guarantees each unordered set of three is examined exactly once, so triangles are never double-counted. A triple is a triangle iff all three of its edges exist. O(V^3).',
  complexity: 'O(V^3) time (triple scan)',
  defaultInput: { words: ['A-B', 'A-C', 'B-C', 'B-D', 'C-D'] },
  expected: 2,
  run,
  code: `function countTriangles(edges) {
  // bidirectional adjacency
  const adj = new Map();
  const see = (x) => { if (!adj.has(x)) adj.set(x, new Set()); };
  for (const [a, b] of edges) {
    see(a); see(b);
    adj.get(a).add(b);
    adj.get(b).add(a);
  }
  const friends = (a, b) => adj.get(a).has(b);

  const ids = [...adj.keys()].sort();
  let count = 0;
  // i<j<k → each unordered triple visited once (no duplicates)
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      for (let k = j + 1; k < ids.length; k++) {
        const a = ids[i], b = ids[j], c = ids[k];
        // a triangle needs all three friendships
        if (friends(a, b) && friends(a, c) && friends(b, c)) count++;
      }
  return count;
}`,
};

export default descriptor;
