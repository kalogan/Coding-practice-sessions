import type { CCompiler, CompileRunOptions, CompileRunResult } from './types';

// Real Clang in the browser via the Wasmer SDK — loaded from a CDN with NO npm
// dependency (the same pattern the Python playground uses for Pyodide). Proven
// in the Slice-0 spike: clean compile → real wasm → correct output, ~1s warm.
//
// NOTE: the page must be cross-origin isolated (COOP/COEP) for the SDK's
// SharedArrayBuffer runtime — see vite.config (dev) and vercel.json (prod).

// Pinned — the SDK is pre-1.0, so we never float to @latest.
const SDK_URL = 'https://unpkg.com/@wasmer/sdk@0.10.0/dist/index.mjs';
const CLANG_PKG = 'clang/clang';

interface WasmerSdk {
  init: () => Promise<void>;
  Wasmer: {
    fromRegistry: (pkg: string) => Promise<any>;
    fromFile: (bytes: Uint8Array) => Promise<any>;
  };
  Directory: new () => any;
}

let toolchainPromise: Promise<{ sdk: WasmerSdk; clang: any }> | null = null;

function loadToolchain(): Promise<{ sdk: WasmerSdk; clang: any }> {
  if (!toolchainPromise) {
    toolchainPromise = (async () => {
      // Dynamic, non-literal URL + @vite-ignore so neither tsc nor Vite tries to
      // resolve/bundle it — it's fetched natively at runtime, like Pyodide.
      const sdk = (await import(/* @vite-ignore */ SDK_URL)) as unknown as WasmerSdk;
      await sdk.init();
      const clang = await sdk.Wasmer.fromRegistry(CLANG_PKG);
      return { sdk, clang };
    })();
  }
  return toolchainPromise;
}

function free(x: any): void {
  try {
    x?.free?.();
  } catch {
    /* already freed / not freeable */
  }
}

// Run an Instance to completion, then ALWAYS free it. Each run holds a worker
// from the SDK's thread pool; without free() the pool exhausts after a handful
// of compiles and the next run blocks forever (found the hard way in the smoke).
async function readOut(handle: any): Promise<{ ok: boolean; code: number; stdout: string; stderr: string }> {
  try {
    const out = await handle.wait();
    return {
      ok: !!out.ok,
      code: typeof out.code === 'number' ? out.code : out.ok ? 0 : 1,
      stdout: out.stdout ?? '',
      stderr: out.stderr ?? '',
    };
  } finally {
    free(handle);
  }
}

export const wasmerCompiler: CCompiler = {
  async warm() {
    await loadToolchain();
  },

  async compileAndRun(source: string, opts: CompileRunOptions = {}): Promise<CompileRunResult> {
    const t0 = performance.now();
    let dir: any;
    let prog: any;
    try {
      const { sdk, clang } = await loadToolchain();
      dir = new sdk.Directory();
      await dir.writeFile('main.c', source);

      const build = await readOut(
        await clang.entrypoint.run({
          args: ['/project/main.c', '-o', '/project/main.wasm'],
          mount: { '/project': dir },
        }),
      );
      if (!build.ok) {
        return {
          compiled: false,
          diagnostics: build.stderr || 'Compilation failed.',
          stdout: '',
          stderr: '',
          exitCode: null,
          ms: Math.round(performance.now() - t0),
        };
      }

      const bytes: Uint8Array = await dir.readFile('main.wasm');
      prog = await sdk.Wasmer.fromFile(bytes);
      const run = await readOut(
        await prog.entrypoint.run(opts.stdin !== undefined ? { stdin: opts.stdin } : {}),
      );

      return {
        compiled: true,
        diagnostics: build.stderr || '',
        stdout: run.stdout,
        stderr: run.stderr,
        exitCode: run.code,
        ms: Math.round(performance.now() - t0),
      };
    } catch (err) {
      // Infrastructure failure (SDK/registry/network) — distinct from a user
      // compile error; surface it in diagnostics rather than throwing.
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      return {
        compiled: false,
        diagnostics: `[engine error] ${msg}\n\nThe compiler toolchain could not be loaded (offline, or the Wasmer registry is unreachable).`,
        stdout: '',
        stderr: '',
        exitCode: null,
        ms: Math.round(performance.now() - t0),
      };
    } finally {
      // Release the per-compile Directory + program package (the toolchain
      // itself stays cached). Instances are freed in readOut.
      free(prog);
      free(dir);
    }
  },
};
