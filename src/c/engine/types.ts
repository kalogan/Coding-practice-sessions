// The compile-engine contract. Everything above this line (UI, exercise runner)
// depends ONLY on this interface — never on Wasmer directly — so swapping the
// engine (e.g. to a self-hosted binji/wasm-clang) is a one-file change.

export interface CompileRunResult {
  /** did clang produce a runnable wasm? false → see `diagnostics`. */
  compiled: boolean;
  /** clang's stderr — real compiler diagnostics (empty on a clean compile). */
  diagnostics: string;
  /** the program's stdout (only meaningful when `compiled` and it actually ran). */
  stdout: string;
  /** the program's stderr at runtime. */
  stderr: string;
  /** process exit code, or null if it never ran (compile failed). */
  exitCode: number | null;
  /** wall-clock milliseconds for the whole compile+run. */
  ms: number;
}

export interface CompileRunOptions {
  /** fed to the program's stdin (for full-program exercises that read input). */
  stdin?: string;
}

export interface CCompiler {
  /** Pre-fetch + instantiate the toolchain so the first real compile is fast. */
  warm(): Promise<void>;
  /** Compile a single C translation unit and run it. Never throws for user
   *  errors — a compile failure comes back as `{ compiled: false, diagnostics }`. */
  compileAndRun(source: string, opts?: CompileRunOptions): Promise<CompileRunResult>;
}
