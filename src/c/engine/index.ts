// The single place the app picks a compile engine. To swap to a self-hosted
// binji/wasm-clang later, change ONLY this line to point at that implementation.
import { wasmerCompiler } from './wasmerCompiler';
import type { CCompiler } from './types';

export const compiler: CCompiler = wasmerCompiler;
export type { CCompiler, CompileRunResult, CompileRunOptions } from './types';
