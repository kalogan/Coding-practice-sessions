// Independent, server-side verifier for the C exercises. There is no browser in
// the scheduled run, so we can't lean on the in-app compiler — this reproduces
// the exact assemble + normalize + compare that src/c/exercises/runner.ts does,
// but drives real gcc via the public Wandbox API. EVERY reference solution must
// produce the exact expected output before a batch may ship.
//
//   node scripts/verify-c-exercises.mjs            # verify all
//   node scripts/verify-c-exercises.mjs array-sum  # verify ids matching a filter
//
// No new dependencies: TypeScript (already a dep) strips the `import type` and
// gives us each exercise's default export; node's built-in fetch talks to Wandbox.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EX_DIR = join(ROOT, 'src', 'c', 'exercises');
const TMP = join(ROOT, 'node_modules', '.cache', 'verify-c');

const WANDBOX = 'https://wandbox.org/api';
const SPACING_MS = 300; // polite spacing between requests
const filter = process.argv[2] ?? '';

// ── the SAME normalization as runner.ts normalizeOutput ──────────────────────
function normalizeOutput(s) {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}
const outputsMatch = (a, b) => normalizeOutput(a) === normalizeOutput(b);

// function mode: user code (reference) first, then the hidden harness (owns main).
function assembleFunctionSource(ex, userCode) {
  return `${userCode}\n\n/* ---- verification harness (hidden) ---- */\n${ex.harness ?? ''}\n`;
}

// gcc emits "file:line:col: error:" only for real errors (warnings say "warning:").
const hasCompileError = (compilerError) => /: error:/.test(compilerError);

// ── discovery: every *.cx.ts under src/c/exercises ───────────────────────────
function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith('.cx.ts')) out.push(p);
  }
  return out;
}

// Load an exercise's default export by transpiling the TS to ESM (the only import
// is `import type`, elided by transpile) and importing the emitted module.
async function loadExercise(file) {
  const source = readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const outPath = join(TMP, relative(EX_DIR, file).replace(/[\\/]/g, '__') + '.mjs');
  writeFileSync(outPath, js);
  const mod = await import(pathToFileURL(outPath).href + `?t=${source.length}`);
  return mod.default;
}

let COMPILER = null;
async function resolveCompiler() {
  if (COMPILER) return COMPILER;
  const res = await fetch(`${WANDBOX}/list.json`);
  if (!res.ok) throw new Error(`Wandbox /list.json returned ${res.status}`);
  const list = await res.json();
  const c = list.filter((x) => x.language === 'C').map((x) => x.name);
  COMPILER = c.find((n) => /^gcc-\d/.test(n)) ?? c.find((n) => n.startsWith('gcc')) ?? c[0];
  if (!COMPILER) throw new Error('Wandbox has no C compiler.');
  return COMPILER;
}

async function compileAndRun(source, stdin = '') {
  const compiler = await resolveCompiler();
  const res = await fetch(`${WANDBOX}/compile.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Mirror the app engine (wandboxCompiler.ts): link libm so <math.h> resolves.
    body: JSON.stringify({ compiler, code: source, stdin, options: '', 'compiler-option-raw': '-lm' }),
  });
  if (!res.ok) throw new Error(`compile.json HTTP ${res.status}`);
  const data = await res.json();
  const diagnostics = data.compiler_error ?? '';
  if (hasCompileError(diagnostics)) return { compiled: false, diagnostics, stdout: '' };
  return { compiled: true, diagnostics, stdout: data.program_output ?? '' };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function verifyOne(ex) {
  if (ex.mode === 'function') {
    const src = assembleFunctionSource(ex, ex.reference);
    const r = await compileAndRun(src);
    if (!r.compiled) return { ok: false, reason: 'compile error', detail: r.diagnostics.trim() };
    const ok = outputsMatch(r.stdout, ex.expectedStdout ?? '');
    return ok
      ? { ok: true }
      : { ok: false, reason: 'output mismatch', expected: ex.expectedStdout, got: r.stdout };
  }
  // program mode: reference owns main(); run every case against its stdin.
  const cases = ex.cases ?? [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const r = await compileAndRun(ex.reference, c.stdin);
    if (!r.compiled)
      return { ok: false, reason: `compile error (case ${i + 1})`, detail: r.diagnostics.trim() };
    if (!outputsMatch(r.stdout, c.expectedStdout))
      return {
        ok: false,
        reason: `case ${i + 1} (${c.name ?? ''}) mismatch`,
        expected: c.expectedStdout,
        got: r.stdout,
      };
    if (i < cases.length - 1) await sleep(SPACING_MS);
  }
  return { ok: true };
}

async function main() {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  const files = walk(EX_DIR).sort();
  const exercises = [];
  for (const f of files) {
    const ex = await loadExercise(f);
    if (!filter || ex.id.includes(filter)) exercises.push(ex);
  }
  exercises.sort((a, b) => a.order - b.order);

  console.log(`Verifying ${exercises.length} exercise(s) against real gcc (Wandbox)…\n`);
  const compiler = await resolveCompiler();
  console.log(`compiler: ${compiler}\n`);

  const failures = [];
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    process.stdout.write(`[${String(i + 1).padStart(2)}/${exercises.length}] ${ex.id} (${ex.mode}) … `);
    let res;
    try {
      res = await verifyOne(ex);
    } catch (err) {
      res = { ok: false, reason: `engine error: ${err.message}` };
    }
    if (res.ok) {
      console.log('PASS');
    } else {
      console.log(`FAIL — ${res.reason}`);
      if (res.detail) console.log('   ' + res.detail.split('\n').slice(0, 6).join('\n   '));
      if (res.expected !== undefined) {
        console.log('   expected: ' + JSON.stringify(normalizeOutput(res.expected)));
        console.log('   got:      ' + JSON.stringify(normalizeOutput(res.got)));
      }
      failures.push(ex.id);
    }
    if (i < exercises.length - 1) await sleep(SPACING_MS);
  }

  console.log(`\n${exercises.length - failures.length}/${exercises.length} passed.`);
  if (failures.length) {
    console.log('FAILURES: ' + failures.join(', '));
    process.exit(1);
  }
  console.log('All references verified. ✓');
}

main().catch((err) => {
  console.error('verify-c-exercises crashed:', err);
  process.exit(1);
});
