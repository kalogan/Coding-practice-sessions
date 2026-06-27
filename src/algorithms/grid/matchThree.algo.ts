import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Grid scan.
// Scenario: a match-3 puzzle board. Each character is a gem symbol. The board
// clears any straight run of 3+ identical gems. This is the detection step:
// scan every row left→right, then every column top→bottom, and mark each cell
// that belongs to a run of length ≥ 3. A cell may sit in both a horizontal and
// a vertical match, so the answer counts DISTINCT matched cells via a Set.

function run(input: AlgoInput): AlgoResult {
  const board = input.words ?? [];
  const t = new Tracer();

  // Parse the rows of characters into a 2-D symbol grid.
  const grid: string[][] = board.map((row) => row.split(''));
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  // "r,c" keys for every cell that is part of any match (deduped).
  const matched = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  // Build the renderable grid for a given scan position. A cell is:
  //  - 'match'  if it is already in the matched set,
  //  - 'active' if it is one of the cells currently being scanned,
  //  - 'plain'  otherwise.
  const renderGrid = (active: Set<string>): Cell[][] =>
    grid.map((row, r) =>
      row.map((value, c): Cell => {
        const k = key(r, c);
        if (matched.has(k)) return { value, role: 'match' };
        if (active.has(k)) return { value, role: 'active' };
        return { value, role: 'plain' };
      }),
    );

  const stateFields = (phase: string) => [
    { label: 'phase', value: phase },
    { label: 'matched cells', value: matched.size },
  ];

  // Record a run [start, end] within a line as a match (horizontal or vertical).
  const recordHorizontal = (r: number, start: number, end: number) => {
    const symbol = grid[r][start];
    for (let c = start; c <= end; c++) matched.add(key(r, c));
    const run = grid[r].slice(start, end + 1).join(' ');
    t.step({
      view: { kind: 'grid', rows: renderGrid(new Set()) },
      state: stateFields('horizontal'),
      note: `row ${r}: ${run} is a horizontal match (${symbol}×${end - start + 1}).`,
    });
  };

  const recordVertical = (c: number, start: number, end: number) => {
    const symbol = grid[start][c];
    for (let r = start; r <= end; r++) matched.add(key(r, c));
    const run = grid
      .slice(start, end + 1)
      .map((row) => row[c])
      .join(' ');
    t.step({
      view: { kind: 'grid', rows: renderGrid(new Set()) },
      state: stateFields('vertical'),
      note: `column ${c}: ${run} is a vertical match (${symbol}×${end - start + 1}).`,
    });
  };

  // Scan horizontally: walk each row, extend a run while the symbol repeats.
  for (let r = 0; r < rows; r++) {
    let start = 0;
    for (let c = 1; c <= cols; c++) {
      t.step({
        view: { kind: 'grid', rows: renderGrid(new Set([key(r, Math.min(c, cols - 1))])) },
        state: stateFields('horizontal'),
        note: `Scanning row ${r}, column ${Math.min(c, cols - 1)}.`,
      });
      if (c === cols || grid[r][c] !== grid[r][start]) {
        if (c - start >= 3) recordHorizontal(r, start, c - 1);
        start = c;
      }
    }
  }

  // Scan vertically: walk each column, extend a run while the symbol repeats.
  for (let c = 0; c < cols; c++) {
    let start = 0;
    for (let r = 1; r <= rows; r++) {
      t.step({
        view: { kind: 'grid', rows: renderGrid(new Set([key(Math.min(r, rows - 1), c)])) },
        state: stateFields('vertical'),
        note: `Scanning column ${c}, row ${Math.min(r, rows - 1)}.`,
      });
      if (r === rows || grid[r][c] !== grid[start][c]) {
        if (r - start >= 3) recordVertical(c, start, r - 1);
        start = r;
      }
    }
  }

  // Final answer: the number of distinct cells in any match.
  t.step({
    view: { kind: 'grid', rows: renderGrid(new Set()) },
    state: [{ label: 'answer', value: matched.size, highlight: true }],
    note: `Done. ${matched.size} distinct cells are part of a match and would clear.`,
  });

  return { steps: t.steps, answer: matched.size };
}

const descriptor: AlgoDescriptor = {
  id: 'match-three',
  title: 'Match-3: find the matches',
  category: 'Grid',
  scenario:
    'A match-3 puzzle board. Each character is a gem. The board clears any straight line of 3+ identical gems. Find every cell that is part of such a run.',
  pattern:
    'Scan each row left→right, then each column top→bottom, tracking the start of the current run of equal symbols. When the run breaks (or the line ends) and its length is ≥ 3, mark every cell in it. Dedupe cells with a Set since one cell can sit in both a horizontal and a vertical match.',
  complexity: 'O(rows·cols) time',
  defaultInput: { words: ['RRRB', 'GBGB', 'GGGB', 'YBYB'] },
  expected: 10,
  run,
  code: `function findMatches(board) {
  const grid = board.map((row) => row.split(''));
  const rows = grid.length, cols = rows ? grid[0].length : 0;
  const matched = new Set();                 // "r,c" keys, deduped

  // horizontal runs
  for (let r = 0; r < rows; r++) {
    let start = 0;
    for (let c = 1; c <= cols; c++) {
      if (c === cols || grid[r][c] !== grid[r][start]) {
        if (c - start >= 3)
          for (let k = start; k < c; k++) matched.add(r + ',' + k);
        start = c;
      }
    }
  }

  // vertical runs
  for (let c = 0; c < cols; c++) {
    let start = 0;
    for (let r = 1; r <= rows; r++) {
      if (r === rows || grid[r][c] !== grid[start][c]) {
        if (r - start >= 3)
          for (let k = start; k < r; k++) matched.add(k + ',' + c);
        start = r;
      }
    }
  }

  return matched.size;                       // distinct cells that clear
}`,
};

export default descriptor;
