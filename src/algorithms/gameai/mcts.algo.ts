import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';

// Monte Carlo Tree Search — the AlphaGo-style decide-your-next-move loop,
// simplified to a single decision with a one-level tree.
//
// Scenario: a game bot sits at a position (the ROOT) and must pick one of 3
// candidate moves (the children). It doesn't know which is best, so it spends a
// budget of iterations sampling. Each iteration does four phases:
//   SELECT   — pick a child to try, balancing exploit (high win-rate so far)
//              against explore (rarely-tried) via the UCB1 score.
//   EXPAND   — if a child has never been tried, try it first (N == 0).
//   SIMULATE — play a fast random rollout from that move; win (1) or loss (0).
//   BACKPROP — fold the result back: bump the child's visits N and wins W, and
//              the root's total visit count.
// Over many iterations the visit counts concentrate on the strongest move, and
// the bot recommends the MOST-VISITED child (argmax N). Real MCTS recurses many
// levels deep; here one level is enough to show the loop.

const WIN_P = [0.35, 0.8, 0.55]; // hidden true win-probabilities; move 1 is best
const C = 1.4; // UCB1 exploration constant
const ITERATIONS = 40;

function run(input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Deterministic, seeded LCG — no Math.random / Date so the trace is stable.
  let seed = (input.params?.seed ?? 99) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const M = WIN_P.length;
  const N = new Array(M).fill(0); // visits per child
  const W = new Array(M).fill(0); // wins per child
  let rootN = 0; // total visits at the root

  // Fixed layout: root near top-center, the 3 children spread below.
  const childPos = [
    { x: 0.2, y: 0.7 },
    { x: 0.5, y: 0.7 },
    { x: 0.8, y: 0.7 },
  ];

  const bestChild = () => {
    // most-visited child (ties broken by lower index)
    let best = 0;
    for (let m = 1; m < M; m++) if (N[m] > N[best]) best = m;
    return best;
  };

  const ucb1 = (m: number) => {
    if (N[m] === 0) return Infinity;
    return W[m] / N[m] + C * Math.sqrt(Math.log(rootN) / N[m]);
  };

  const childLabel = (m: number) => {
    const rate = N[m] > 0 ? (W[m] / N[m]).toFixed(2) : '—';
    return `move ${m}\n${W[m]}/${N[m]} (wr ${rate})`;
  };

  const nodes = (selected: number): GraphNode[] => {
    const best = rootN > 0 ? bestChild() : -1;
    const out: GraphNode[] = [
      { id: 'root', label: `position\nN=${rootN}`, x: 0.5, y: 0.1, role: 'plain' },
    ];
    for (let m = 0; m < M; m++) {
      let role: GraphNode['role'] = 'plain';
      if (m === best) role = 'match'; // current recommendation (most visits)
      if (m === selected) role = 'active'; // chosen this iteration
      out.push({ id: `c${m}`, label: childLabel(m), x: childPos[m].x, y: childPos[m].y, role });
    }
    return out;
  };

  const edges = (selected: number): GraphEdge[] =>
    Array.from({ length: M }, (_, m) => ({
      from: 'root',
      to: `c${m}`,
      directed: true,
      role: m === selected ? ('active' as const) : ('plain' as const),
    }));

  const visitCounts = () => N.map((n, m) => `m${m}:${n}`).join(' ');

  // Intro frame.
  t.step({
    view: { kind: 'graph', nodes: nodes(-1), edges: edges(-1) },
    state: [
      { label: 'iteration', value: 0 },
      { label: 'budget', value: ITERATIONS },
      { label: 'visits', value: visitCounts() },
    ],
    note: `The bot must pick 1 of 3 moves. It will run ${ITERATIONS} MCTS iterations — select a child (UCB1), simulate a random rollout, backprop the result — then recommend the most-visited move.`,
  });

  for (let iter = 1; iter <= ITERATIONS; iter++) {
    // SELECT / EXPAND: prefer any never-tried child; else argmax UCB1.
    let selected = -1;
    for (let m = 0; m < M; m++) {
      if (N[m] === 0) {
        selected = m;
        break;
      }
    }
    const expanding = selected !== -1;
    if (!expanding) {
      let best = 0;
      for (let m = 1; m < M; m++) if (ucb1(m) > ucb1(best)) best = m;
      selected = best;
    }

    // SIMULATE: a random rollout from the selected move.
    const result = rand() < WIN_P[selected] ? 1 : 0;

    // BACKPROP: fold the result back into the child and the root.
    N[selected] += 1;
    W[selected] += result;
    rootN += 1;

    const phase = expanding ? 'EXPAND (first try)' : 'SELECT (UCB1)';
    t.step({
      view: { kind: 'graph', nodes: nodes(selected), edges: edges(selected) },
      state: [
        { label: 'iteration', value: iter },
        { label: 'phase', value: phase },
        { label: 'selected move', value: selected, highlight: true },
        { label: 'rollout', value: result === 1 ? 'WIN' : 'loss' },
        { label: 'visits', value: visitCounts() },
        { label: 'best so far', value: bestChild() },
      ],
      note:
        `${phase}: try move ${selected}. Random rollout → ${result === 1 ? 'WIN' : 'loss'}. ` +
        `Backprop: N[${selected}]=${N[selected]}, W[${selected}]=${W[selected]}, rootN=${rootN}. ` +
        `Most-visited move so far: ${bestChild()}.`,
    });
  }

  const answer = bestChild();

  t.step({
    view: { kind: 'graph', nodes: nodes(-1), edges: edges(-1) },
    state: [
      { label: 'iteration', value: ITERATIONS },
      { label: 'visits', value: visitCounts(), highlight: true },
      { label: 'recommended move', value: answer, highlight: true },
    ],
    note: `Done. Visit counts: ${visitCounts()}. MCTS recommends move ${answer} — the most-visited child, which concentrated where the win-rate held up under repeated sampling.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'mcts',
  title: 'Monte Carlo Tree Search',
  category: 'Game AI',
  scenario:
    'A game bot at one position must choose among 3 candidate moves. With a fixed budget of iterations it samples each move via random rollouts, spending more samples on promising ones (UCB1), then recommends the most-visited move — the same loop that powers AlphaGo-style play.',
  pattern:
    'Iterate SELECT → EXPAND → SIMULATE → BACKPROP. Selection uses UCB1 = (W/N) + C·sqrt(ln(totalN)/N), which trades off exploiting a high observed win-rate against exploring rarely-tried children. Any unvisited child is tried first. After the budget, pick the child with the MOST visits (not the highest raw win-rate — visit count is the noise-robust signal).',
  complexity: 'O(iterations × rollout)',
  difficulty: 'Hard',
  eli5: `## Everyday analogy

You move to a new town with 3 restaurants and a month of dinners. You want to find the best one. You could eat at each once and decide — but one great meal might have been luck, one bad meal a fluke. Instead you keep going back, leaning toward the ones that have been good so far, but every so often re-checking a so-so one in case you misjudged it. By month's end, the place you visited most is almost certainly the best. MCTS does exactly this for game moves.

## The four phases each iteration

- **Select**: choose which move to try this round.
- **Expand**: if a move has never been tried, try it first.
- **Simulate**: play a fast *random* game (a "rollout") from that move — it ends in a win or a loss.
- **Backpropagate**: record the result on that move (bump its visits and wins).

## What UCB1 balances

The score is \`(W/N) + C·sqrt(ln(totalN)/N)\`. The first term is **exploit** — the observed win-rate. The second is **explore** — it grows when a move has few visits \`N\` relative to the total, nudging you to re-check neglected moves. The constant \`C\` (≈1.4) sets how adventurous you are. A move tried zero times scores infinity, so it always gets a first look.

## Why visit counts pick the move

Each rollout is noisy, so the *raw* win-rate of a move tried 3 times is unreliable. UCB1 funnels samples toward genuinely strong moves, so they accumulate the most visits. The most-visited move is the one the search trusted enough to keep returning to — a far steadier signal than a high win-rate over a handful of tries.

## Why random rollouts work

One random playout tells you almost nothing. But averaged over many, the noise cancels and a real edge in win-probability shows through. Aggregation, not any single rollout, is what makes MCTS strong.

## How it powers bots

AlphaGo-style engines run this loop millions of times, recursing many levels deep (here we keep one level to show the loop) and replacing random rollouts with a neural-net value estimate — but the select/expand/simulate/backprop skeleton is exactly this.

## Pitfalls

- **Too few iterations**: visits never concentrate, so the pick is basically random.
- **Bad rollouts**: if simulations don't resemble real play, the estimates are biased.
- **Wrong C**: too high wastes budget exploring; too low locks onto an early lucky move.`,
  defaultInput: { params: { seed: 99 } },
  expected: 1,
  run,
  code: `const WIN_P = [0.35, 0.8, 0.55];   // hidden true win-rates; move 1 is best
const C = 1.4;                      // UCB1 exploration constant

function mcts(iterations, rand) {
  const M = WIN_P.length;
  const N = Array(M).fill(0);       // visits per child
  const W = Array(M).fill(0);       // wins per child
  let rootN = 0;

  const ucb1 = (m) =>
    N[m] === 0
      ? Infinity                    // always try an unvisited child first
      : W[m] / N[m] + C * Math.sqrt(Math.log(rootN) / N[m]);

  for (let i = 0; i < iterations; i++) {
    // SELECT / EXPAND: argmax UCB1 (unvisited children score Infinity)
    let m = 0;
    for (let k = 1; k < M; k++) if (ucb1(k) > ucb1(m)) m = k;

    // SIMULATE: a random rollout from move m
    const result = rand() < WIN_P[m] ? 1 : 0;

    // BACKPROP: fold the result back up
    N[m]++; W[m] += result; rootN++;
  }

  // ANSWER: recommend the MOST-VISITED move (not the highest win-rate)
  let best = 0;
  for (let m = 1; m < M; m++) if (N[m] > N[best]) best = m;
  return best;
}`,
};

export default descriptor;
