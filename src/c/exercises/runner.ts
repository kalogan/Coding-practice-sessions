import type { CCompiler } from '../engine';
import type { CExercise } from './types';

// Verifier: assemble the user's code with the exercise harness (function mode) or
// run it against I/O cases (program mode), compile, and check each case. The pure
// pieces (assembly, normalization, comparison) are unit-tested; the real compile
// is exercised in the browser (SEEN), since clang runs in WASM, not under vitest.

export interface CaseResult {
  name: string;
  passed: boolean;
  expected: string;
  got: string;
}

export interface ExerciseRunResult {
  compiled: boolean;
  /** clang diagnostics when compilation failed. */
  diagnostics: string;
  cases: CaseResult[];
  /** true iff it compiled AND every case passed. */
  passed: boolean;
  ms: number;
}

/** Trim trailing whitespace per line + trailing blank lines, and normalize CRLF,
 *  so a correct answer isn't failed by cosmetic whitespace. */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

export function outputsMatch(a: string, b: string): boolean {
  return normalizeOutput(a) === normalizeOutput(b);
}

/** function mode: user code first, then the hidden harness (which owns main()). */
export function assembleFunctionSource(ex: CExercise, userCode: string): string {
  return `${userCode}\n\n/* ---- verification harness (hidden) ---- */\n${ex.harness ?? ''}\n`;
}

export async function runExercise(
  ex: CExercise,
  userCode: string,
  compiler: CCompiler,
): Promise<ExerciseRunResult> {
  const t0 = performance.now();

  if (ex.mode === 'function') {
    const source = assembleFunctionSource(ex, userCode);
    const r = await compiler.compileAndRun(source);
    if (!r.compiled) {
      return { compiled: false, diagnostics: r.diagnostics, cases: [], passed: false, ms: r.ms };
    }
    const expected = ex.expectedStdout ?? '';
    const passed = outputsMatch(r.stdout, expected);
    return {
      compiled: true,
      diagnostics: r.diagnostics,
      cases: [{ name: 'output', passed, expected, got: r.stdout }],
      passed,
      ms: r.ms,
    };
  }

  // program mode: the user owns main(); run each case with its stdin.
  const cases = ex.cases ?? [];
  const results: CaseResult[] = [];
  let compiled = true;
  let diagnostics = '';
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const r = await compiler.compileAndRun(userCode, { stdin: c.stdin });
    if (!r.compiled) {
      compiled = false;
      diagnostics = r.diagnostics;
      break;
    }
    results.push({
      name: c.name ?? `case ${i + 1}`,
      passed: outputsMatch(r.stdout, c.expectedStdout),
      expected: c.expectedStdout,
      got: r.stdout,
    });
  }

  return {
    compiled,
    diagnostics,
    cases: results,
    passed: compiled && results.length > 0 && results.every((x) => x.passed),
    ms: Math.round(performance.now() - t0),
  };
}
