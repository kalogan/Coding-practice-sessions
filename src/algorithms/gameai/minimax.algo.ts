import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';
import { binaryTreeLayout } from '../graphLayout';

// Minimax with alpha-beta pruning on a small, fixed game tree.
//
// Scenario: a perfect-play 2-player game bot. MAX wants the highest score, MIN
// wants the lowest; they alternate levels. Minimax computes each node's value
// bottom-up — assuming both sides always play their best reply. Alpha-beta
// pruning skips whole branches that provably cannot change the result.
//
// We use a FIXED complete binary tree of depth 3 (15 nodes):
//   depth 0 = MAX (root, id 0)
//   depth 1 = MIN (ids 1, 2)
//   depth 2 = MAX (ids 3..6)
//   depth 3 = leaves (ids 7..14) with given values
// Children of node i are 2i+1 and 2i+2. Positions come from binaryTreeLayout(15).

const N = 15; // 1 + 2 + 4 + 8
const LEAF_START = 7; // ids 7..14 are leaves
const LEAVES = [3, 5, 6, 9, 1, 2, 0, -1]; // left-to-right leaf values

const layout = binaryTreeLayout(N);

const isLeaf = (i: number) => i >= LEAF_START;
const leafValue = (i: number) => LEAVES[i - LEAF_START];
// depth 0 (root) is MAX; even depths are MAX, odd depths are MIN.
const depthOf = (i: number) => Math.floor(Math.log2(i + 1));
const isMax = (i: number) => depthOf(i) % 2 === 0;

type Role = NonNullable<GraphNode['role']>;

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Per-node display state.
  const value = new Map<number, number>(); // resolved minimax value (or leaf value)
  const role = new Map<number, Role>();
  for (let i = 0; i < N; i++) role.set(i, 'plain');
  for (let i = LEAF_START; i < N; i++) value.set(i, leafValue(i));

  const edges: GraphEdge[] = [];
  for (let i = 0; i < N; i++) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < N) edges.push({ from: String(i), to: String(l), directed: true });
    if (r < N) edges.push({ from: String(i), to: String(r), directed: true });
  }

  const label = (i: number): string => {
    if (value.has(i)) {
      const v = value.get(i)!;
      return isLeaf(i) ? String(v) : `${isMax(i) ? 'MAX' : 'MIN'}=${v}`;
    }
    return isMax(i) ? 'MAX' : 'MIN';
  };

  const nodes = (): GraphNode[] =>
    Array.from({ length: N }, (_, i) => ({
      id: String(i),
      label: label(i),
      x: layout[i].x,
      y: layout[i].y,
      role: role.get(i),
    }));

  const drawEdges = (): GraphEdge[] => edges.map((e) => ({ ...e }));

  const fmt = (n: number) => (n === Infinity ? '+∞' : n === -Infinity ? '−∞' : String(n));

  const emit = (active: number, alpha: number, beta: number, running: string, note: string) => {
    t.step({
      view: { kind: 'graph', nodes: nodes(), edges: drawEdges() },
      state: [
        { label: 'node', value: active >= 0 ? `#${active} (${isLeaf(active) ? 'leaf' : isMax(active) ? 'MAX' : 'MIN'})` : '—' },
        { label: 'α (MAX floor)', value: fmt(alpha) },
        { label: 'β (MIN ceiling)', value: fmt(beta) },
        { label: 'running value', value: running },
      ],
      note,
    });
  };

  // Real alpha-beta minimax. Emits a trace step at each evaluation/resolution.
  function minimax(i: number, alpha: number, beta: number): number {
    if (isLeaf(i)) {
      role.set(i, 'active');
      emit(i, alpha, beta, fmt(leafValue(i)), `Leaf #${i}: the game ends here with value ${leafValue(i)}.`);
      role.set(i, 'visited');
      return leafValue(i);
    }

    role.set(i, 'active');
    const max = isMax(i);
    emit(
      i,
      alpha,
      beta,
      max ? '−∞' : '+∞',
      `Evaluate ${max ? 'MAX' : 'MIN'} node #${i}. It will pick the ${max ? 'highest' : 'lowest'} of its children. Window α=${fmt(alpha)}, β=${fmt(beta)}.`,
    );

    let best = max ? -Infinity : Infinity;
    const children = [2 * i + 1, 2 * i + 2];

    for (let c = 0; c < children.length; c++) {
      const child = children[c];
      const childVal = minimax(child, alpha, beta);
      role.set(i, 'active'); // re-focus the parent after the child resolved

      if (max) {
        best = Math.max(best, childVal);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, childVal);
        beta = Math.min(beta, best);
      }

      emit(
        i,
        alpha,
        beta,
        fmt(best),
        `Child #${child} returned ${fmt(childVal)}. ${max ? 'MAX' : 'MIN'} running ${max ? 'best (highest)' : 'best (lowest)'} = ${fmt(best)}.`,
      );

      // Alpha-beta cutoff: if the window closed (α ≥ β), the remaining sibling
      // cannot change this node's value — the other player would never let us
      // reach it — so prune it.
      if (alpha >= beta && c + 1 < children.length) {
        const pruned = children[c + 1];
        markSubtree(pruned, 'frontier');
        emit(
          i,
          alpha,
          beta,
          fmt(best),
          `α (${fmt(alpha)}) ≥ β (${fmt(beta)}): prune sibling subtree #${pruned} — can't change the result.`,
        );
        break;
      }
    }

    value.set(i, best);
    role.set(i, 'visited');
    emit(i, alpha, beta, fmt(best), `${max ? 'MAX' : 'MIN'} node #${i} resolves to ${fmt(best)}.`);
    return best;
  }

  function markSubtree(i: number, r: Role) {
    if (i >= N) return;
    role.set(i, r);
    markSubtree(2 * i + 1, r);
    markSubtree(2 * i + 2, r);
  }

  const answer = minimax(0, -Infinity, Infinity);

  // Highlight the optimal root→leaf path: at each node, follow the child whose
  // resolved value equals the node's value (skip pruned children that have no value).
  const path: number[] = [];
  let cur = 0;
  while (true) {
    path.push(cur);
    if (isLeaf(cur)) break;
    const target = value.get(cur)!;
    const children = [2 * cur + 1, 2 * cur + 2].filter((c) => value.has(c));
    const next = children.find((c) => value.get(c) === target);
    if (next === undefined) break;
    cur = next;
  }
  for (const i of path) role.set(i, 'match');

  emit(
    -1,
    -Infinity,
    Infinity,
    String(answer),
    `Done. The bot's value at the root is ${answer}. The highlighted path is the line of perfect play: each side picks its best reply.`,
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'minimax-alphabeta',
  title: 'Minimax & alpha-beta pruning',
  category: 'Game AI',
  scenario:
    'A perfect-play 2-player game bot looks ahead on a game tree. MAX (the bot) wants the highest score; MIN (the opponent) wants the lowest. Levels alternate. Minimax computes each position\'s value bottom-up — assuming both sides always play their best reply — and alpha-beta pruning skips whole branches that provably cannot change the answer.',
  pattern:
    'Recurse down a game tree carrying a window (α, β). At MAX nodes take the max of children and raise α; at MIN nodes take the min and lower β. When α ≥ β the window has closed: the remaining siblings cannot affect this node, so prune them. Same answer as plain minimax, far fewer nodes — and move ordering decides how much you save.',
  complexity: 'O(b^d) minimax · ~O(b^(d/2)) with alpha-beta',
  difficulty: 'Hard',
  eli5: `## The everyday idea

Imagine planning your next move in a board game, but you assume your opponent is just as smart as you. You think: "If I play here, they'll reply with *their* best move, and then I'll reply with mine..." You look ahead, and at every turn you assume the other side does the worst thing to you. The move that turns out best *even against perfect defense* is the one you pick. That's a minimax game bot.

## Max and min, taking turns

The game is drawn as a tree. Each level is one player's turn:

- On **your** levels (MAX), you pick the child with the **highest** value — you want to win.
- On the **opponent's** levels (MIN), they pick the child with the **lowest** value — they want you to lose.

Leaf nodes are finished positions with a known score. Values bubble up from the leaves: a MAX node becomes the max of its children, a MIN node the min. The number that reaches the root is the value of the game under perfect play.

## What alpha-beta prunes

Searching the whole tree is wasteful. Alpha-beta carries two numbers: \`α\`, the best score MAX is already guaranteed somewhere, and \`β\`, the best MIN is already guaranteed. The moment \`α ≥ β\`, the branch you're in can't beat what each side already has in hand — the other player would simply never let you reach it. So you skip the rest of that branch. The final answer is **identical** to full minimax; you just touched fewer nodes. That safety is the whole point.

## Why it matters

Good pruning roughly *square-roots* the work, which lets the bot search about **twice as deep** in the same time — and depth is strength in chess-like games.

## Pitfalls

- **Move ordering matters:** try the strongest move first and you prune far more; worst-case ordering prunes nothing.
- For big games you can't reach real leaves, so you need a good **evaluation function** to score cut-off positions.`,
  defaultInput: {},
  expected: 5,
  run,
  code: `// MAX wants high, MIN wants low; they alternate levels.
// (α, β) is the window of scores still "in play".
function minimax(node, alpha, beta, isMax) {
  if (node.isLeaf) return node.value;

  if (isMax) {                       // our turn: maximize
    let best = -Infinity;
    for (const child of node.children) {
      best = Math.max(best, minimax(child, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;      // β-cutoff: prune the rest
    }
    return best;
  } else {                           // opponent's turn: minimize
    let best = Infinity;
    for (const child of node.children) {
      best = Math.min(best, minimax(child, alpha, beta, true));
      beta = Math.min(beta, best);
      if (alpha >= beta) break;      // α-cutoff: prune the rest
    }
    return best;
  }
}

// minimax(root, -Infinity, Infinity, true) -> value under perfect play`,
};

export default descriptor;
