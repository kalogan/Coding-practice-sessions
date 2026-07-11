// The exercise data model. An exercise is DATA — drop a `*.cx.ts` under
// src/c/exercises/** and it appears in the ladder (zero-wiring, like *.algo.ts).

export type CMode = 'function' | 'program';
export type CDifficulty = 'intro' | 'easy' | 'medium' | 'hard';

/** A deeper walkthrough block inside a lesson. */
export interface LessonSection {
  heading: string;
  /** paragraphs separated by blank lines; inline `code` in backticks is rendered. */
  body: string;
}

/** The teacher content shown in the right-hand panel — this is what turns an
 *  exercise into a taught SESSION. Rich by design (concept → example → pitfalls). */
export interface Lesson {
  /** the hook: the core idea in plain language (may be several paragraphs). */
  intro: string;
  /** deeper parts of the explanation. */
  sections?: LessonSection[];
  /** a worked example — code + commentary. Rendered monospace. */
  workedExample?: string;
  /** why this matters / where it shows up in real code. */
  whyItMatters?: string;
  /** the mistakes learners actually make here. */
  commonMistakes?: string[];
  /** a nudge toward the exercise, revealed on demand. */
  hint?: string;
}

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
  /** the teacher panel for this session (the right-hand explanation). */
  lesson?: Lesson;

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
