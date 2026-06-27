// The seam between "real algorithm" and "visualization".
//
// An algorithm is REAL CODE that, while it runs, emits a snapshot (TraceStep)
// at every meaningful operation. Each step carries a fully-described `view`, so
// the renderer is a pure function of the trace and never re-implements logic —
// the animation cannot drift from what the code actually does.
// (Preview-harness rule #2: production-truthful.)

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

/** one token in a tokens view; `role` maps to a colour in the renderer */
export interface Token {
  text: string;
  role?: 'plain' | 'match' | 'active' | 'cleared' | 'invalid' | 'kept' | 'dropped';
  /** small caption above the token */
  label?: string;
}

/** one frame in a call-stack view */
export interface Frame {
  title: string;
  detail?: string;
  status?: 'active' | 'returning' | 'done';
}

/** one cell in a grid view */
export interface Cell {
  value: string | number;
  role?: 'plain' | 'match' | 'active' | 'cleared';
}

// Each step renders exactly one of these. Add a new kind here + a renderer in
// src/harness/views, and every algorithm targeting it lights up for free.
export type ViewState =
  | { kind: 'array'; values: number[]; markers: Marker[]; window?: { start: number; end: number } }
  | { kind: 'tokens'; tokens: Token[]; window?: { start: number; end: number } }
  | { kind: 'stack'; frames: Frame[] }
  | { kind: 'grid'; rows: Cell[][] };

export interface TraceStep {
  /** what to draw for this step (self-contained) */
  view: ViewState;
  /** named scalar state shown in the side panel */
  state: StateField[];
  /** plain-language explanation of THIS step (the "why") */
  note: string;
}

// A loose input bag: algorithms read whichever fields they need. The preview
// workbench exposes editors for whatever is present.
export interface AlgoInput {
  array?: number[];
  text?: string;
  words?: string[];
  params?: Record<string, number>;
}

export interface AlgoResult {
  steps: TraceStep[];
  /** the REAL computed answer */
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
  /** known-correct answer for defaultInput — the honesty gate asserts run().answer === expected */
  expected: string | number;
  /** source shown to the learner (mirrors `run`'s logic, minus the trace calls) */
  code: string;
}
