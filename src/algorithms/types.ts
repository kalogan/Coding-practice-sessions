// The seam between "real algorithm" and "visualization".
//
// An algorithm is REAL CODE that, while it runs, emits a snapshot (TraceStep)
// at every meaningful operation. The renderer only ever draws these snapshots.
// It never re-implements the logic — so the animation cannot drift from what
// the code actually does. (Preview-harness rule #2: production-truthful.)

export type MarkerRole = 'left' | 'right' | 'window' | 'eval' | 'best';

export interface Marker {
  /** index into the array this marker points at */
  index: number;
  role: MarkerRole;
  /** short label drawn above the cell, e.g. "L" / "R" */
  label?: string;
}

export interface StateField {
  label: string;
  value: string | number;
  /** highlight this field on the step that changes it */
  highlight?: boolean;
}

export interface TraceStep {
  /** pointers / cursors to draw above cells */
  markers: Marker[];
  /** inclusive range to shade as "the current window" */
  window?: { start: number; end: number };
  /** named scalar state shown in the side panel */
  state: StateField[];
  /** plain-language explanation of THIS step (the "why") */
  note: string;
}

export interface AlgoInput {
  array: number[];
  params?: Record<string, number>;
}

export interface AlgoResult {
  steps: TraceStep[];
  /** the REAL computed answer — asserted by the gate test against a known value */
  answer: string | number;
}

export interface AlgoDescriptor {
  id: string;
  title: string;
  category: string;
  /** real-world framing so the pattern sticks */
  scenario: string;
  /** the transferable interview pattern */
  pattern: string;
  /** e.g. "O(n) time · O(1) space" */
  complexity: string;
  defaultInput: AlgoInput;
  /** THE REAL CODE: pure function of input; computes answer + emits the trace */
  run: (input: AlgoInput) => AlgoResult;
  /** source shown to the learner (mirrors `run`'s logic, minus the trace calls) */
  code: string;
}
