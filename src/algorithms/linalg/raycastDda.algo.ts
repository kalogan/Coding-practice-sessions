import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Raycasting a tile grid with DDA (Digital Differential Analyzer).
// This is the beating heart of Wolfenstein/DOOM-style raycasters and of any
// line-of-sight / AI-vision check on a tile map: march a ray one grid cell at a
// time until it strikes a wall. We keep the ray axis-aligned (pure EAST) so the
// cell walk is exact integer stepping. The 8×8 map has a wall border plus one
// interior wall at (row 3, col 5). The ray starts at (row 3, col 1) heading east
// and stops when it first lands on a wall cell.

const SIZE = 8;

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Build the map: 1 = wall, 0 = empty. Border on all four edges.
  const map: number[][] = Array.from({ length: SIZE }, (_row, r) =>
    Array.from({ length: SIZE }, (_col, c) =>
      r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1 ? 1 : 0,
    ),
  );
  map[3][5] = 1; // one interior wall directly in the ray's path

  const startRow = 3;
  const startCol = 1;
  const dx = 1; // heading EAST (+x). dy = 0 keeps it axis-aligned.
  const dy = 0;

  const visited = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  // Render the whole 8×8 map for one step. Priority: the wall we hit (match) >
  // the ray's current cell (active) > already-visited cells (done) > walls > plain.
  const render = (curR: number, curC: number, hit: boolean): Cell[][] =>
    map.map((row, r) =>
      row.map((cellVal, c): Cell => {
        if (r === curR && c === curC) {
          return { value: cellVal, role: hit ? 'match' : 'active' };
        }
        if (visited.has(key(r, c))) return { value: cellVal, role: 'done' };
        if (cellVal === 1) return { value: cellVal, role: 'wall' };
        return { value: cellVal, role: 'plain' };
      }),
    );

  const stateFields = (r: number, c: number, steps: number) => [
    { label: 'current (row,col)', value: `(${r}, ${c})` },
    { label: 'direction', value: `dx=${dx}, dy=${dy} (east)` },
    { label: 'steps taken', value: steps },
  ];

  // Step 0: the ray's origin.
  let row = startRow;
  let col = startCol;
  let steps = 0;
  t.step({
    view: { kind: 'grid', rows: render(row, col, false) },
    state: stateFields(row, col, steps),
    note: `The ray starts at cell (${row}, ${col}) and will march EAST one tile at a time until it hits a wall.`,
  });

  // DDA march: advance one cell per step. The loop bound is the wall itself —
  // we break when we land on a wall cell, we do not hardcode how many empties.
  let empties = 0;
  let hitRow = row;
  let hitCol = col;
  for (;;) {
    // The current cell is now "behind" the ray — mark it visited.
    visited.add(key(row, col));
    row += dy;
    col += dx;
    steps += 1;

    if (map[row][col] === 1) {
      hitRow = row;
      hitCol = col;
      t.step({
        view: { kind: 'grid', rows: render(row, col, true) },
        state: stateFields(row, col, steps),
        note: `Cell (${row}, ${col}) is a WALL — the ray stops here. It crossed ${empties} empty cell(s) before the hit.`,
      });
      break;
    }

    // Empty cell: the ray passes through, count it, keep marching.
    empties += 1;
    t.step({
      view: { kind: 'grid', rows: render(row, col, false) },
      state: stateFields(row, col, steps),
      note: `Cell (${row}, ${col}) is empty (${empties} so far) — the ray keeps going east.`,
    });
  }

  const answer = empties; // 3 empty cells (cols 2,3,4) before the wall at col 5

  t.step({
    view: { kind: 'grid', rows: render(hitRow, hitCol, true) },
    state: [
      { label: 'empty cells crossed', value: answer, highlight: true },
      { label: 'hit wall at', value: `(${hitRow}, ${hitCol})` },
    ],
    note: `Done. The ray traversed ${answer} empty cells before striking the wall at (${hitRow}, ${hitCol}). That distance is what a raycaster turns into a wall-slice height, and what an AI uses to know a target is (or isn't) visible.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'raycast-dda',
  title: 'Raycasting a tile grid (DDA)',
  category: 'Linear Algebra',
  difficulty: 'Medium',
  scenario:
    'The core trick behind Wolfenstein/DOOM-style raycasters and behind AI line-of-sight: given a tile map, march a ray cell by cell until it hits a wall. The distance to that wall becomes the on-screen wall height (or answers "can the guard see the player?"). Here an 8×8 map has a wall border plus an interior wall at (3,5); a ray fired EAST from (3,1) crosses 3 empty cells before the hit.',
  pattern:
    'DDA (Digital Differential Analyzer) grid traversal: step the ray one grid cell at a time along its direction, testing the map at each new cell, until you hit a wall. Kept axis-aligned here so each step is an exact integer move (col += 1). The answer is the count of empty cells crossed before the wall — proportional to the wall distance.',
  complexity: 'O(cells to the wall) — one map lookup per cell stepped',
  defaultInput: {},
  expected: 3,
  run,
  code: `function castEast(map, startRow, startCol) {
  let row = startRow, col = startCol;
  let empties = 0;

  for (;;) {
    col += 1;                       // DDA step: advance one cell east
    if (map[row][col] === 1) break; // hit a wall -> stop
    empties += 1;                   // crossed one more empty cell
  }

  return empties;                   // distance in cells to the wall
}`,
  eli5: `## The everyday picture

Shine a laser pointer down a hallway made of floor tiles. Walk your eye along the beam one tile at a time — floor, floor, floor — until you reach a tile that's a wall. Count the floor tiles you passed: that count tells you how far away the wall is.

## What problem it solves

Old-school 3-D games like Wolfenstein didn't have real 3-D geometry — they had a flat tile map. To draw the walls, they shot one ray per screen column across the map and measured how far each ray traveled before hitting a wall. Nearer wall = taller slice on screen. The same "march until you hit something" trick answers "can this enemy see the player?".

## How it works step by step

- Start at the ray's cell, here (row 3, col 1), pointed east (dx = +1, dy = 0).
- Take a DDA step: move exactly one cell in the ray's direction (col + 1).
- Look up the new cell in the map. If it's a wall (1), stop. If it's empty (0), count it and step again.
- The ray crosses cols 2, 3, 4 — three empty cells — then col 5 is the wall, so it stops.

## Why we keep it axis-aligned

A ray going straight east moves one whole tile per step with no rounding, so the walk is exact integer math. Real raycasters handle diagonal rays too — DDA then tracks the next horizontal and vertical grid line and jumps to whichever is closer — but the idea is identical: hop grid line to grid line until you hit a wall.

## Where games use it

- Rendering: one ray per screen column, wall distance sets the slice height (Wolfenstein/DOOM).
- AI vision / line-of-sight: cast a ray from guard to player; if it reaches without hitting a wall, the guard can see you.
- Tile-based collision and shooting: does this shot reach its target, or is something in the way?

## Common pitfalls

- Off-by-one on counting: the wall cell itself is NOT an empty cell crossed — stop before counting it.
- Forgetting the border: without a guaranteed wall around the map, an axis-aligned ray could march off the edge of the array.
- Hardcoding the loop length instead of stopping at the first wall — real maps change, so let the wall end the loop.`,
};

export default descriptor;
