import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// A* pathfinding on a tile map.
// Scenario: a game NPC must walk from S to G across a grid dotted with walls,
// taking the SHORTEST route. A* keeps an "open set" of cells it has reached but
// not yet committed to, and always expands the one with the lowest
//   f = g + h
// where g = number of moves already taken from the start and h = the Manhattan
// distance to the goal (an admissible, never-overestimating heuristic). Because
// h never lies upward, the first time the goal is expanded its g is optimal, so
// the reconstructed path is guaranteed shortest. Moves are 4-connected.

// Actions: up, down, left, right. Arrows point in the direction of travel.
const ARROWS = ['↑', '↓', '←', '→'];
const DR = [-1, 1, 0, 0];
const DC = [0, 0, -1, 1];

function run(input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Parse the map: one string per row. 'S' start, 'G' goal, '#' wall, '.' open.
  const map = input.words ?? [];
  const grid: string[][] = map.map((row) => row.split(''));
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  // Locate start and goal.
  let start: [number, number] = [0, 0];
  let goal: [number, number] = [0, 0];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'S') start = [r, c];
      if (grid[r][c] === 'G') goal = [r, c];
    }
  }

  const id = (r: number, c: number) => r * cols + c;
  const inBounds = (r: number, c: number) =>
    r >= 0 && r < rows && c >= 0 && c < cols;
  const isWall = (r: number, c: number) => grid[r][c] === '#';

  // Manhattan distance to goal — admissible for 4-connected unit-cost moves.
  const h = (r: number, c: number) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]);

  const N = rows * cols;
  const INF = Number.POSITIVE_INFINITY;
  const gScore: number[] = new Array(N).fill(INF); // best known steps from start
  const parent: number[] = new Array(N).fill(-1); // predecessor on the best path
  const closed: boolean[] = new Array(N).fill(false);
  const open = new Set<number>(); // ids of cells in the open set

  gScore[id(start[0], start[1])] = 0;
  open.add(id(start[0], start[1]));

  // Pop the open cell with the smallest f = g + h; ties broken by smaller h.
  const popBest = (): number => {
    let best = -1;
    let bestF = INF;
    let bestH = INF;
    for (const node of open) {
      const r = Math.floor(node / cols);
      const c = node % cols;
      const f = gScore[node] + h(r, c);
      const hh = h(r, c);
      if (f < bestF || (f === bestF && hh < bestH)) {
        best = node;
        bestF = f;
        bestH = hh;
      }
    }
    return best;
  };

  // Render the whole map for the current step. `pathSet` highlights the final
  // path; `arrows` maps cell id -> direction glyph along that path; `cur` is the
  // cell being expanded this step (drawn 'active').
  const renderGrid = (
    pathSet: Set<number>,
    arrows: Map<number, string>,
    cur: number,
  ): Cell[][] =>
    grid.map((row, r) =>
      row.map((ch, c): Cell => {
        const node = id(r, c);
        const arrow = arrows.get(node);
        if (isWall(r, c)) return { value: '#', role: 'wall' };
        if (pathSet.has(node)) return { value: ch, role: 'match', arrow };
        if (node === cur) {
          // The cell being expanded right now.
          return { value: gScore[node] + h(r, c), role: 'active' };
        }
        if (ch === 'G') return { value: 'G', role: 'goal' };
        if (closed[node]) {
          // Already expanded — show its f-value.
          return { value: gScore[node] + h(r, c), role: 'done' };
        }
        if (open.has(node)) {
          // Frontier — no 'frontier' role exists, so reuse 'dep'. Show f.
          return { value: gScore[node] + h(r, c), role: 'dep' };
        }
        if (ch === 'S') return { value: 'S', role: 'plain' };
        return { value: '.', role: 'plain' };
      }),
    );

  const empty = new Set<number>();
  const noArrows = new Map<number, string>();

  // Initial snapshot: only the start is on the frontier.
  t.step({
    view: { kind: 'grid', rows: renderGrid(empty, noArrows, -1) },
    state: [
      { label: 'open set', value: open.size },
      { label: 'closed', value: 0 },
      { label: 'start', value: `(${start[0]},${start[1]})` },
      { label: 'goal', value: `(${goal[0]},${goal[1]})` },
    ],
    note: `A* begins. Only the start (${start[0]},${start[1]}) is in the open set, with g=0 and f=h=${h(
      start[0],
      start[1],
    )}. We always expand the open cell with the smallest f = g + h.`,
  });

  let goalNode = -1;
  let expanded = 0;

  // --- Main loop: expand the best open cell until the goal is dequeued. ---
  while (open.size > 0) {
    const cur = popBest();
    const cr = Math.floor(cur / cols);
    const cc = cur % cols;
    open.delete(cur);
    closed[cur] = true;
    expanded++;

    const gCur = gScore[cur];
    const hCur = h(cr, cc);

    // Goal dequeued => its g is optimal (admissible heuristic). Stop.
    if (cur === id(goal[0], goal[1])) {
      goalNode = cur;
      t.step({
        view: { kind: 'grid', rows: renderGrid(empty, noArrows, cur) },
        state: [
          { label: 'open set', value: open.size },
          { label: 'closed', value: expanded },
          { label: 'current', value: `(${cr},${cc})` },
          { label: 'g', value: gCur, highlight: true },
          { label: 'h', value: hCur },
          { label: 'f', value: gCur + hCur },
        ],
        note: `Goal (${cr},${cc}) dequeued with g=${gCur}. Because the heuristic never overestimates, this g is optimal — the shortest path is ${gCur} moves. Reconstructing it via parents.`,
      });
      break;
    }

    // Relax each open (non-wall) neighbour.
    for (let k = 0; k < 4; k++) {
      const nr = cr + DR[k];
      const nc = cc + DC[k];
      if (!inBounds(nr, nc) || isWall(nr, nc)) continue;
      const nb = id(nr, nc);
      if (closed[nb]) continue; // already finalized
      const tentative = gCur + 1; // unit-cost moves
      if (tentative < gScore[nb]) {
        // Found a shorter route to this neighbour — record it.
        gScore[nb] = tentative;
        parent[nb] = cur;
        open.add(nb);
      }
    }

    t.step({
      view: { kind: 'grid', rows: renderGrid(empty, noArrows, cur) },
      state: [
        { label: 'open set', value: open.size },
        { label: 'closed', value: expanded },
        { label: 'current', value: `(${cr},${cc})` },
        { label: 'g', value: gCur, highlight: true },
        { label: 'h', value: hCur },
        { label: 'f', value: gCur + hCur },
      ],
      note: `Expand (${cr},${cc}): g=${gCur}, h=${hCur}, f=${
        gCur + hCur
      }. Relaxed its open neighbours (a tentative g of ${
        gCur + 1
      } updates a neighbour only if it beats its current g). Open set now holds ${open.size} cells.`,
    });
  }

  // --- Reconstruct the path by walking parents back from the goal. ---
  const pathSet = new Set<number>();
  const arrows = new Map<number, string>();
  let pathLen = -1;

  if (goalNode !== -1) {
    const path: number[] = [];
    let n = goalNode;
    while (n !== -1) {
      path.push(n);
      n = parent[n];
    }
    path.reverse(); // start -> goal
    pathLen = path.length - 1; // number of MOVES

    for (const node of path) pathSet.add(node);

    // Arrow on each cell points to the next cell along the path.
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i];
      const b = path[i + 1];
      const ar = Math.floor(a / cols);
      const ac = a % cols;
      const br = Math.floor(b / cols);
      const bc = b % cols;
      let dir = 0;
      for (let k = 0; k < 4; k++) {
        if (ar + DR[k] === br && ac + DC[k] === bc) dir = k;
      }
      arrows.set(a, ARROWS[dir]);
    }

    t.step({
      view: { kind: 'grid', rows: renderGrid(pathSet, arrows, -1) },
      state: [
        { label: 'open set', value: open.size },
        { label: 'closed', value: expanded },
        { label: 'path length', value: pathLen, highlight: true },
      ],
      note: `Shortest path reconstructed: ${pathLen} moves from S to G (highlighted, arrows show the direction of travel).`,
    });
  } else {
    t.step({
      view: { kind: 'grid', rows: renderGrid(empty, noArrows, -1) },
      state: [
        { label: 'open set', value: open.size },
        { label: 'closed', value: expanded },
        { label: 'path length', value: -1 },
      ],
      note: `Open set exhausted without reaching the goal — no path exists.`,
    });
  }

  return { steps: t.steps, answer: pathLen };
}

const descriptor: AlgoDescriptor = {
  id: 'a-star',
  title: 'A* pathfinding',
  category: 'Pathfinding',
  difficulty: 'Medium',
  complexity: 'O(E log V) with a binary-heap open set',
  scenario:
    'A game NPC has to cross a tile map from its spawn (S) to a destination (G), but walls (#) block the way. It needs the shortest walk, not just any walk. A* explores outward from the start, but instead of fanning out blindly it always pushes on from the reachable cell that looks most promising — the one whose steps-so-far plus a straight-line guess to the goal is smallest. That bias toward the goal lets it find the optimal route while touching far fewer tiles than a blind flood fill.',
  pattern:
    'A* (informed best-first search). Keep g[node] = best known cost from start, an open set of reached-but-unsettled cells, and a closed set of settled ones. Repeatedly pop the open cell with the smallest f = g + h (h = an admissible heuristic, here Manhattan distance), settle it, and relax each neighbour: if g[cur] + edge < g[nbr], update g and the parent pointer and add the neighbour to the open set. When the goal is popped, its g is provably optimal — reconstruct the path through parent pointers. h = 0 degenerates to Dijkstra; g = 0 gives greedy best-first.',
  defaultInput: { words: ['S....', '###..', '.....', '..###', '....G'] },
  expected: 12,
  run,
  code: `function aStar(map) {
  const grid = map.map((row) => row.split(''));
  const rows = grid.length, cols = grid[0].length;
  const DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1];

  let start, goal;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'S') start = [r, c];
      if (grid[r][c] === 'G') goal = [r, c];
    }

  const id = (r, c) => r * cols + c;
  const h = (r, c) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]); // Manhattan

  const g = new Array(rows * cols).fill(Infinity);
  const parent = new Array(rows * cols).fill(-1);
  const closed = new Array(rows * cols).fill(false);
  const open = new Set([id(...start)]);
  g[id(...start)] = 0;

  // Pop the open cell with the smallest f = g + h (ties: smaller h).
  const popBest = () => {
    let best = -1, bf = Infinity, bh = Infinity;
    for (const n of open) {
      const r = (n / cols) | 0, c = n % cols, hh = h(r, c), f = g[n] + hh;
      if (f < bf || (f === bf && hh < bh)) { best = n; bf = f; bh = hh; }
    }
    return best;
  };

  while (open.size) {
    const cur = popBest();
    const r = (cur / cols) | 0, c = cur % cols;
    open.delete(cur); closed[cur] = true;

    if (cur === id(...goal)) break;           // goal settled => g is optimal

    for (let k = 0; k < 4; k++) {
      const nr = r + DR[k], nc = c + DC[k];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === '#') continue;
      const nb = id(nr, nc);
      if (closed[nb]) continue;
      if (g[cur] + 1 < g[nb]) {                // relax: found a shorter route
        g[nb] = g[cur] + 1;
        parent[nb] = cur;
        open.add(nb);
      }
    }
  }

  // Walk parents back from the goal to count the moves.
  let len = 0;
  for (let n = id(...goal); parent[n] !== -1; n = parent[n]) len++;
  return len;                                  // 12 on the default map
}`,
  eli5: `## Crossing a maze, always heading toward the exit

Imagine you are in a maze and you can see roughly where the exit is, even though walls block the direct line. Instead of trying every corridor at random, you keep a list of spots you have reached but not fully explored, and each turn you step out from the one that *looks* closest to finishing. That hunch is what makes A* fast — it leans toward the goal instead of flooding the whole maze.

## g, h, and f

Every reachable cell gets three numbers:

- \`g\` = how many steps it actually took to get here from the start (the past, known for certain).
- \`h\` = a guess of how far the goal still is — here the Manhattan distance, counting grid steps as if no walls existed.
- \`f = g + h\` = total estimated cost of a route through this cell. A* always expands the cell with the smallest \`f\`.

## Why an admissible heuristic guarantees the shortest path

\`h\` must be *admissible*: it can match the true remaining distance but must never overestimate it. Manhattan distance qualifies, because real walls can only make the trip longer, never shorter. When the heuristic never lies upward, the very first time A* pulls the goal off the open set, its \`g\` is already the smallest possible — so the path you trace back is genuinely the shortest.

## Family resemblance

- Set \`h = 0\` and A* stops guessing — it becomes **Dijkstra**, expanding purely by distance traveled.
- Set \`g = 0\` and it ignores the past — it becomes **greedy best-first**, fast but easily fooled into longer paths.

A* is the balanced middle, which is exactly why game NPCs use it to plan movement: it finds optimal routes cheaply enough to run for many units in real time.

## Pitfalls

- An *inadmissible* heuristic (one that overestimates) can make A* return a non-shortest path.
- Ties in \`f\` need a rule (we break by smaller \`h\`) or you waste work exploring sideways.
- Diagonal movement needs a different heuristic (e.g. Chebyshev) — Manhattan is for 4-connected grids only.`,
};

export default descriptor;
