// The single place the app picks a compile engine. Swapping engines is a
// one-line change here — everything else depends only on the CCompiler interface.
//   - wandboxCompiler: hosted gcc via the Wandbox API (current; reliable, needs network)
//   - wasmerCompiler:  client-side clang via WASM (offline, but has a worker-pool hang)
import { wandboxCompiler } from './wandboxCompiler';
import type { CCompiler } from './types';

export const compiler: CCompiler = wandboxCompiler;
export type { CCompiler, CompileRunResult, CompileRunOptions } from './types';
