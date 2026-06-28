import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Edit distance (Levenshtein) as a 2-D DP table.
// Scenario: the minimum number of single-character inserts, deletes, or
// substitutions needed to turn string A into string B.
//
// dp[i][j] = edits to convert the first i chars of A (A[0..i)) into the first
// j chars of B (B[0..j)).
//   - Base column dp[i][0] = i : delete every char of A to reach "".
//   - Base row    dp[0][j] = j : insert every char of B starting from "".
//   - Inner cell, when A[i-1] === B[j-1]: dp[i][j] = dp[i-1][j-1] (free match).
//   - Otherwise: dp[i][j] = 1 + min(
//        dp[i-1][j],     // delete A[i-1]      (cell above)
//        dp[i][j-1],     // insert B[j-1]      (cell to the left)
//        dp[i-1][j-1]);  // substitute        (cell on the diagonal)
// The answer is dp[|A|][|B|] — the bottom-right cell.

function run(input: AlgoInput): AlgoResult {
  const [A, B] = input.words ?? ['', ''];
  const t = new Tracer();

  const m = A.length;
  const n = B.length;

  // Axis labels: ∅ stands for the empty prefix.
  const rowHeaders = ['∅', ...A.split('')];
  const colHeaders = ['∅', ...B.split('')];

  // dp table, (m+1) x (n+1). filled[i][j] tracks which cells already hold a
  // value so the render can colour them 'done'.
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  const filled: boolean[][] = Array.from({ length: m + 1 }, () =>
    new Array<boolean>(n + 1).fill(false),
  );

  // Build the renderable grid. `active` is the cell being filled; `deps` are the
  // (up to 3) source cells it reads from. Filled cells are 'done', the rest
  // 'plain'.
  const renderGrid = (
    active: [number, number] | null,
    deps: Array<[number, number]>,
  ): Cell[][] => {
    const isActive = (i: number, j: number) => active !== null && active[0] === i && active[1] === j;
    const isDep = (i: number, j: number) => deps.some(([di, dj]) => di === i && dj === j);
    return dp.map((row, i) =>
      row.map((value, j): Cell => {
        const shown = filled[i][j] || isActive(i, j) ? value : '';
        if (isActive(i, j)) return { value: shown, role: 'active' };
        if (isDep(i, j)) return { value: shown, role: 'dep' };
        if (filled[i][j]) return { value: shown, role: 'done' };
        return { value: shown, role: 'plain' };
      }),
    );
  };

  const stateFields = (extra: Array<{ label: string; value: string | number; highlight?: boolean }>) => [
    { label: 'A', value: A || '∅' },
    { label: 'B', value: B || '∅' },
    ...extra,
  ];

  // Base column: dp[i][0] = i (delete i chars of A).
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    filled[i][0] = true;
    t.step({
      view: { kind: 'grid', rows: renderGrid([i, 0], []), colHeaders, rowHeaders },
      state: stateFields([{ label: 'cell', value: `dp[${i}][0]` }, { label: 'value', value: i, highlight: true }]),
      note:
        i === 0
          ? 'Base case dp[0][0] = 0: converting "" to "" needs no edits.'
          : `Base column dp[${i}][0] = ${i}: delete all ${i} char(s) of A's prefix "${A.slice(0, i)}" to reach "".`,
    });
  }

  // Base row: dp[0][j] = j (insert j chars of B).
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j;
    filled[0][j] = true;
    t.step({
      view: { kind: 'grid', rows: renderGrid([0, j], []), colHeaders, rowHeaders },
      state: stateFields([{ label: 'cell', value: `dp[0][${j}]` }, { label: 'value', value: j, highlight: true }]),
      note: `Base row dp[0][${j}] = ${j}: insert all ${j} char(s) of B's prefix "${B.slice(0, j)}" starting from "".`,
    });
  }

  // Fill the interior, row by row, left to right.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const a = A[i - 1];
      const b = B[j - 1];
      const deps: Array<[number, number]> = [
        [i - 1, j], // delete (above)
        [i, j - 1], // insert (left)
        [i - 1, j - 1], // substitute (diagonal)
      ];

      const match = a === b;
      const diag = dp[i - 1][j - 1];
      const up = dp[i - 1][j];
      const left = dp[i][j - 1];

      const value = match ? diag : 1 + Math.min(up, left, diag);
      dp[i][j] = value;
      filled[i][j] = true;

      const note = match
        ? `A[${i - 1}]='${a}' === B[${j - 1}]='${b}' — chars match, so dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${diag} (no edit needed).`
        : `A[${i - 1}]='${a}' ≠ B[${j - 1}]='${b}' — dp[${i}][${j}] = 1 + min(delete ${up}, insert ${left}, substitute ${diag}) = ${value}.`;

      t.step({
        view: { kind: 'grid', rows: renderGrid([i, j], deps), colHeaders, rowHeaders },
        state: stateFields([
          { label: 'cell', value: `dp[${i}][${j}]` },
          { label: 'compare', value: `'${a}' vs '${b}'` },
          { label: 'value', value, highlight: true },
        ]),
        note,
      });
    }
  }

  const answer = dp[m][n];

  // Final step: highlight the answer in the bottom-right cell.
  t.step({
    view: { kind: 'grid', rows: renderGrid(null, [[m, n]]), colHeaders, rowHeaders },
    state: stateFields([{ label: 'edit distance', value: answer, highlight: true }]),
    note: `Done. dp[${m}][${n}] = ${answer}: the minimum number of edits to turn "${A}" into "${B}".`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'edit-distance',
  title: 'Edit distance (DP table)',
  category: 'Dynamic Programming',
  scenario:
    'The minimum number of single-character insert, delete, or substitute edits to turn one string into another (Levenshtein distance). Powers spell-checkers, diff tools, and fuzzy search.',
  pattern:
    'Build a (|A|+1) × (|B|+1) table where dp[i][j] is the edit distance between the first i chars of A and the first j chars of B. Base column dp[i][0] = i, base row dp[0][j] = j. For each inner cell, if the current chars match it copies the diagonal (free); otherwise it is 1 + the min of its top (delete), left (insert), and diagonal (substitute) neighbours. The answer sits in the bottom-right corner.',
  complexity: 'O(m·n) time · O(m·n) space',
  difficulty: 'Medium',
  eli5: `## The everyday picture

You typed "horse" but meant "ros". How many single-keystroke fixes — insert a letter, delete a letter, or retype one — get you there with the fewest moves? Edit distance counts exactly that minimum. It's what spell-checkers use to guess what you meant.

## What problem it solves

It measures how different two strings are, as the smallest number of single-character edits to turn string \`A\` into string \`B\`.

## How it works, step by step

- We build a table \`dp\` with \`m + 1\` rows and \`n + 1\` columns. \`dp[i][j]\` = edits to convert A's first \`i\` letters into B's first \`j\` letters.
- Base column \`dp[i][0] = i\`: turning a prefix into "" means deleting every letter. Base row \`dp[0][j] = j\`: building B from "" means inserting every letter.
- For each inner cell we look at the current pair \`A[i-1]\` and \`B[j-1]\`:
  - if they MATCH, the letters cost nothing, so we copy the diagonal: \`dp[i][j] = dp[i-1][j-1]\`.
  - otherwise \`dp[i][j] = 1 + min(up, left, diag)\` — one edit plus the cheapest of delete (\`up\`), insert (\`left\`), or substitute (\`diag\`).
- The answer is the bottom-right cell \`dp[m][n]\`.

## Why it's correct and efficient

Every cell depends only on three already-computed neighbours, so by filling row by row, left to right, each subproblem is solved exactly once and reused — that's dynamic programming. No edit sequence can do better than the minimum we carry forward.

## Complexity in plain terms

We fill an \`m × n\` grid once, so both time and memory are \`O(m·n)\`. (Memory can be reduced to one row, but this table version keeps the whole grid to visualise it.)

## Common pitfalls

- Off-by-one: \`A[i-1]\` not \`A[i]\`, because row/column 0 represents the empty prefix.
- Mixing up which neighbour means insert vs delete flips nothing in the count but confuses the reconstruction of the actual edits.`,
  defaultInput: { words: ['horse', 'ros'] },
  expected: 3,
  run,
  code: `function editDistance(A, B) {
  const m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;   // delete all of A's prefix
  for (let j = 0; j <= n; j++) dp[0][j] = j;   // insert all of B's prefix

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];           // chars match: free
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],                        // delete
          dp[i][j - 1],                        // insert
          dp[i - 1][j - 1],                    // substitute
        );
      }
    }
  }

  return dp[m][n];                             // bottom-right = edit distance
}`,
};

export default descriptor;
