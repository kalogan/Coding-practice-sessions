import type { CCompiler, CompileRunOptions, CompileRunResult } from './types';

// Compile + run C on a hosted sandbox via the public Wandbox API. Real gcc, no
// client-side toolchain, no worker-pool hang, no signup. Trade-off: a network
// round-trip per run, and the code is sent to Wandbox's sandbox (fine for
// practice code). Behind the CCompiler interface, so it's interchangeable.

const WANDBOX = 'https://wandbox.org/api';
const REQUEST_TIMEOUT_MS = 20000;

let compilerPromise: Promise<string> | null = null;

// Resolve a C compiler id Wandbox currently offers (compile.json needs an exact
// name). Prefer a pinned gcc-x.y.z-c over gcc-head-c (which drifts). Cached.
function resolveCompiler(): Promise<string> {
  if (!compilerPromise) {
    compilerPromise = (async () => {
      const res = await fetch(`${WANDBOX}/list.json`);
      if (!res.ok) throw new Error(`Wandbox /list.json returned ${res.status}`);
      const list = (await res.json()) as { name: string; language: string }[];
      const cCompilers = list.filter((c) => c.language === 'C').map((c) => c.name);
      const pick =
        cCompilers.find((n) => /^gcc-\d/.test(n)) ??
        cCompilers.find((n) => n.startsWith('gcc')) ??
        cCompilers[0];
      if (!pick) throw new Error('Wandbox has no C compiler available.');
      return pick;
    })();
    compilerPromise.catch(() => {
      compilerPromise = null; // don't cache a failed lookup
    });
  }
  return compilerPromise;
}

interface WandboxResponse {
  status?: string;
  signal?: string;
  compiler_error?: string;
  program_output?: string;
  program_error?: string;
}

// gcc emits "file:line:col: error:" for real errors; warnings are "warning:".
// A compile FAILED iff an error line is present (empty program_output alone is
// ambiguous — a program can compile and exit non-zero with no output).
const hasCompileError = (compilerError: string) => /: error:/.test(compilerError);

const since = (t0: number) => Math.round(performance.now() - t0);

function engineError(message: string, t0: number): CompileRunResult {
  return { compiled: false, diagnostics: `[engine] ${message}`, stdout: '', stderr: '', exitCode: null, ms: since(t0) };
}

export const wandboxCompiler: CCompiler = {
  async warm() {
    await resolveCompiler();
  },

  async compileAndRun(source: string, opts: CompileRunOptions = {}): Promise<CompileRunResult> {
    const t0 = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const compiler = await resolveCompiler();
      const res = await fetch(`${WANDBOX}/compile.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        // Link the math library so <math.h> (sqrt/sin/cos/…) resolves at link time —
        // needed by the vectors/transforms exercises. Harmless for everything else.
        body: JSON.stringify({
          compiler,
          code: source,
          stdin: opts.stdin ?? '',
          options: '',
          'compiler-option-raw': '-lm',
        }),
      });
      if (!res.ok) return engineError(`Compile service returned HTTP ${res.status}.`, t0);

      const data = (await res.json()) as WandboxResponse;
      const diagnostics = data.compiler_error ?? '';

      if (hasCompileError(diagnostics)) {
        return { compiled: false, diagnostics: diagnostics || 'Compilation failed.', stdout: '', stderr: '', exitCode: null, ms: since(t0) };
      }

      const parsed = data.status !== undefined && data.status !== '' ? parseInt(data.status, 10) : NaN;
      const runtimeErr = data.program_error ?? '';
      const stderr = data.signal
        ? `${runtimeErr}${runtimeErr ? '\n' : ''}[terminated by signal ${data.signal}]`
        : runtimeErr;

      return {
        compiled: true,
        diagnostics, // surviving compiler warnings
        stdout: data.program_output ?? '',
        stderr,
        exitCode: Number.isNaN(parsed) ? null : parsed,
        ms: since(t0),
      };
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      return engineError(
        aborted
          ? 'The compile request timed out.'
          : `Could not reach the compile service (offline?): ${err instanceof Error ? err.message : String(err)}`,
        t0,
      );
    } finally {
      clearTimeout(timer);
    }
  },
};
