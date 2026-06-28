import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { circleLayout } from '../graphLayout';

// Union-Find (Disjoint Set Union) with union-by-rank + path compression.
//
// Scenario: track connected groups as connections arrive — friends merging into
// clubs, cables wiring machines into one network, or Kruskal's MST stitching
// components together. Each element points at a `parent`; following parents to
// the top reaches the group's representative (its "root"). Two elements are in
// the same group iff they share a root.
//
// Unions come from input.words as "a-b" strings. n = number of elements (0..n-1).

function run(input: AlgoInput): AlgoResult {
  const n = Math.max(0, Math.floor(input.params?.n ?? 0));
  const unions = input.array ? input.array.map(String) : (input.words ?? []);

  const ids = Array.from({ length: n }, (_, i) => String(i));
  const layout = circleLayout(ids);

  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array<number>(n).fill(0);
  let components = n;

  const t = new Tracer();

  // Transient highlight roles applied on top of the structural picture.
  const active = new Set<number>(); // the two roots being merged
  const visited = new Set<number>(); // nodes just path-compressed

  const componentCount = () => {
    let c = 0;
    for (let i = 0; i < n; i++) if (parent[i] === i) c++;
    return c;
  };

  const nodes = (): GraphNode[] =>
    ids.map((id, i) => {
      let role: GraphNode['role'] = 'plain';
      if (parent[i] === i) role = 'match'; // roots
      if (visited.has(i)) role = 'visited'; // freshly compressed
      if (active.has(i)) role = 'active'; // root being merged
      return { id, label: id, x: layout[id].x, y: layout[id].y, role };
    });

  // Directed edge from each non-root node to its current parent (skip roots).
  const edges = (): GraphEdge[] => {
    const out: GraphEdge[] = [];
    for (let i = 0; i < n; i++) {
      if (parent[i] !== i) out.push({ from: String(i), to: String(parent[i]), directed: true });
    }
    return out;
  };

  const stateFields = (extra?: { label: string; value: string | number; highlight?: boolean }[]) => [
    { label: 'components', value: components },
    ...(extra ?? []),
  ];

  // find with path compression: walk to the root, then re-point every node on
  // the path directly at the root.
  const find = (x: number): number => {
    let root = x;
    const path: number[] = [];
    while (parent[root] !== root) {
      path.push(root);
      root = parent[root];
    }
    // Path-compress: point each visited node straight at the root.
    for (const node of path) {
      if (parent[node] !== root) {
        parent[node] = root;
        visited.add(node);
      }
    }
    return root;
  };

  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: edges() },
    state: stateFields(),
    note: `Start with ${n} elements, each in its own set (every node is its own root). components = ${components}.`,
  });

  for (const w of unions) {
    const [as, bs] = w.split('-').map((s) => s.trim());
    const a = Number(as);
    const b = Number(bs);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n) continue;

    visited.clear();
    const ra = find(a);
    const rb = find(b);

    // Show the find result: roots highlighted, any compression visible.
    active.clear();
    active.add(ra);
    active.add(rb);
    t.step({
      view: { kind: 'graph', nodes: nodes(), edges: edges() },
      state: stateFields([
        { label: 'union', value: `${a}-${b}` },
        { label: 'roots', value: ra === rb ? `${ra} (same)` : `${ra}, ${rb}` },
      ]),
      note:
        ra === rb
          ? `union(${a}, ${b}): find(${a}) and find(${b}) both reach root ${ra}. Already in the same set — nothing to merge.`
          : `union(${a}, ${b}): find(${a}) reaches root ${ra}, find(${b}) reaches root ${rb}. Different sets — merge them. (Compressed nodes shown in 'visited'.)`,
    });

    if (ra !== rb) {
      // Union by rank: hang the shorter tree under the taller one.
      let lo = ra;
      let hi = rb;
      if (rank[lo] > rank[hi]) {
        const tmp = lo;
        lo = hi;
        hi = tmp;
      }
      // lo has rank <= hi: attach lo under hi.
      parent[lo] = hi;
      if (rank[lo] === rank[hi]) rank[hi]++;
      components--;

      visited.clear();
      active.clear();
      t.step({
        view: { kind: 'graph', nodes: nodes(), edges: edges() },
        state: stateFields([
          { label: 'union', value: `${a}-${b}` },
          { label: 'merged', value: `${lo} → ${hi}`, highlight: true },
        ]),
        note: `Link root ${lo} (rank ${rank[lo]}) under root ${hi} (rank ${rank[hi]}). components → ${components}.`,
      });
    } else {
      visited.clear();
      active.clear();
    }
  }

  components = componentCount();
  t.step({
    view: { kind: 'graph', nodes: nodes(), edges: edges() },
    state: stateFields([{ label: 'answer', value: components, highlight: true }]),
    note: `All unions processed. ${components} distinct ${components === 1 ? 'group remains' : 'groups remain'}.`,
  });

  return { steps: t.steps, answer: components };
}

const descriptor: AlgoDescriptor = {
  id: 'union-find',
  title: 'Union-Find (disjoint sets)',
  category: 'Union-Find',
  scenario:
    'Track connected groups as connections arrive — friends merging into clubs, cables wiring machines into one network, or Kruskal building a minimum spanning tree. Union-Find answers "are these two in the same group?" and "merge these two groups" in near-constant time.',
  pattern:
    'Disjoint Set Union: each element points at a parent; find(x) follows parents to the root (the set representative) while path-compressing. union(a,b) hangs the smaller-rank root under the larger. Two elements share a set iff find() returns the same root. With union-by-rank + path compression each op is ~O(α(n)).',
  complexity: '~O(α(n)) per op (near-constant)',
  difficulty: 'Medium',
  eli5: `## Everyday analogy

Picture a bunch of people, each starting in their own one-person club. Every club has a *president*. To find which club you're in, you ask "who do you report to?", then ask *that* person, and so on, until you reach someone who reports to themselves — that's the president, the unique stand-in for the whole club.

To **merge** two clubs, you make one president report to the other. Now everyone underneath quietly belongs to the bigger club.

## find and union

\`find(x)\` walks the chain of "reports-to" pointers up to the president (the root). \`union(a, b)\` finds both presidents and, if they differ, points one at the other — joining the two clubs into one.

## Why it's so fast

Two tricks keep the chains short:

- **Path compression**: while walking up in \`find\`, re-point every person you pass *directly* at the president. Next time the lookup is instant.
- **Union by rank**: always hang the shorter tree under the taller one, so the trees never grow tall and stringy.

Together these flatten the structure so much that each operation costs *inverse-Ackermann* time α(n) — under 5 for any number you'll ever meet, effectively constant.

## Common pitfalls

- Skipping compression or rank: chains degrade into long lists and you're back to O(n) per lookup.
- Linking by raw element instead of by *root* — you must \`find\` both ends first.
- Always attaching the same side regardless of rank/size, which builds tall trees.`,
  defaultInput: { words: ['0-1', '2-3', '0-2', '4-5'], params: { n: 6 } },
  expected: 2,
  run,
  code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;                       // number of disjoint sets
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // path compression
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return;                // already together
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;                 // union by rank
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.count--;
  }
}`,
};

export default descriptor;
