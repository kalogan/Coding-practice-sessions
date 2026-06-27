import type { TraceStep } from './types';

/**
 * A tiny recorder the algorithms push snapshots into as they run.
 * It does not change control flow — it only observes — so the trace is a
 * faithful record of the real execution.
 */
export class Tracer {
  readonly steps: TraceStep[] = [];

  step(s: TraceStep): void {
    this.steps.push(s);
  }
}
