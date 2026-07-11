// The exercise data model. An exercise is DATA — drop a `*.cx.ts` under
// src/c/exercises/** and it appears in the ladder (zero-wiring, like *.algo.ts).

export type CMode = 'function' | 'program';
export type CDifficulty = 'intro' | 'easy' | 'medium' | 'hard';

/** program-mode: the user writes their own main(); we feed stdin, diff stdout. */
export interface CProgramCase {
  name?: string;
  stdin: string;
  expectedStdout: string;
}

export interface CExercise {
  id: string;
  title: string;
  /** curriculum grouping shown in the ladder, e.g. "C Fundamentals". */
  module: string;
  /** global ladder position (ascending). */
  order: number;
  difficulty: CDifficulty;
  mode: CMode;
  /** task description (plain text; newlines preserved). */
  prompt: string;
  /** starter code shown in the editor. */
  starter: string;

  // ── function mode ──
  /** a C harness containing main() that calls the user's function and prints a
   *  canonical result. Concatenated AFTER the user's code. */
  harness?: string;
  /** exact stdout a correct solution + harness must produce. */
  expectedStdout?: string;

  // ── program mode ──
  /** I/O cases; the user writes their own main(). */
  cases?: CProgramCase[];

  /** a known-good reference solution — used to author/verify the exercise and to
   *  power an optional "show solution". Never shown unless the user asks. */
  reference: string;
}
