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

/** per-bar colour in an array view (sorting: comparing / swapping / settled) */
export type BarRole = 'plain' | 'compare' | 'swap' | 'sorted' | 'min' | 'pivot';

/** a node in a linked-list view; `next` is the id it points at (or null) */
export interface ListNode {
  id: string;
  value: string | number;
  next: string | null;
  /** previous-pointer id for doubly linked lists (drawn as a back-arrow) */
  prev?: string | null;
  role?: 'plain' | 'active' | 'visited' | 'match';
}

/** one entry in a hash bucket */
export interface HashEntry {
  key: string;
  value?: string | number;
  role?: 'plain' | 'active' | 'match' | 'probe';
}

/** one bucket (slot) of a hash table */
export interface HashBucket {
  index: number;
  entries: HashEntry[];
  role?: 'plain' | 'active' | 'match';
}

/** a node of a segment tree; covers the range [lo, hi] and holds an aggregate */
export interface SegNode {
  id: string;
  lo: number;
  hi: number;
  value: string | number;
  x: number;
  y: number;
  role?: 'plain' | 'active' | 'match' | 'partial';
}

export interface SegEdge {
  from: string;
  to: string;
}

/** one cell of a heap rendered as its backing array */
export interface HeapCell {
  index: number;
  value: number;
  role?: 'plain' | 'active' | 'compare' | 'swap';
}

/** a labelled cursor drawn above a list node (head / prev / cur / slow / fast) */
export interface ListPointer {
  label: string;
  target: string | null;
  role?: 'slow' | 'fast' | 'head' | 'prev' | 'cur' | 'plain';
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
  role?: 'plain' | 'match' | 'active' | 'cleared' | 'dep' | 'done' | 'goal' | 'hazard' | 'wall';
  /** optional glyph drawn under the value (e.g. a policy arrow ↑ ↓ ← →) */
  arrow?: string;
}

/** a neuron in a neural-network view; x/y are normalized 0..1 positions */
export interface NetNeuron {
  id: string;
  x: number;
  y: number;
  /** activation value shown inside the node */
  value?: number;
  label?: string;
  role?: 'plain' | 'active' | 'grad';
}

/** a weighted connection in a neural-network view */
export interface NetEdge {
  from: string;
  to: string;
  weight?: number;
  role?: 'plain' | 'active' | 'grad';
}

/** a polyline series in a chart view, as [x, y] data points */
export interface ChartLine {
  points: Array<[number, number]>;
  role?: 'plain' | 'active';
}

/** a highlighted point in a chart view (e.g. the current position of descent) */
export interface ChartPoint {
  x: number;
  y: number;
  role?: 'plain' | 'active' | 'match';
  label?: string;
}

/** a node in a graph view; x/y are normalized 0..1 positions the algorithm picks */
export interface GraphNode {
  id: string;
  label?: string;
  x: number;
  y: number;
  role?: 'plain' | 'active' | 'frontier' | 'visited' | 'match' | 'done';
}

/** an edge in a graph view */
export interface GraphEdge {
  from: string;
  to: string;
  directed?: boolean;
  role?: 'plain' | 'active' | 'match';
  /** edge weight, drawn as a label at the midpoint (weighted graphs) */
  weight?: number;
}

// Each step renders exactly one of these. Add a new kind here + a renderer in
// src/harness/views, and every algorithm targeting it lights up for free.
export type ViewState =
  | {
      kind: 'array';
      values: number[];
      markers: Marker[];
      window?: { start: number; end: number };
      /** optional per-bar colour, parallel to values (sorting) */
      bars?: BarRole[];
    }
  | { kind: 'tokens'; tokens: Token[]; window?: { start: number; end: number } }
  | { kind: 'stack'; frames: Frame[] }
  | { kind: 'grid'; rows: Cell[][]; colHeaders?: string[]; rowHeaders?: string[] }
  | { kind: 'graph'; nodes: GraphNode[]; edges: GraphEdge[] }
  | { kind: 'list'; nodes: ListNode[]; pointers?: ListPointer[] }
  | { kind: 'hashtable'; buckets: HashBucket[] }
  | { kind: 'segtree'; nodes: SegNode[]; edges: SegEdge[] }
  | { kind: 'heaparray'; cells: HeapCell[]; links?: Array<{ parent: number; child: number }> }
  | {
      kind: 'chart';
      lines: ChartLine[];
      points: ChartPoint[];
      xRange: [number, number];
      yRange: [number, number];
      xLabel?: string;
      yLabel?: string;
    }
  | { kind: 'network'; neurons: NetNeuron[]; edges: NetEdge[] }
  | {
      kind: 'conv';
      /** the input "image" (game board) */
      input: number[][];
      /** the convolution kernel (filter) */
      kernel: number[][];
      /** the output feature map; null = not computed yet */
      output: Array<Array<number | null>>;
      /** top-left of the kernel window currently sitting on the input */
      window?: { row: number; col: number };
      /** the output cell currently being computed */
      active?: { row: number; col: number };
    };

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
  /** rough interview difficulty; defaults to Medium in the UI when omitted */
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  defaultInput: AlgoInput;
  /** THE REAL CODE: pure function of input; computes answer + emits the trace */
  run: (input: AlgoInput) => AlgoResult;
  /** known-correct answer for defaultInput — the honesty gate asserts run().answer === expected */
  expected: string | number;
  /** source shown to the learner (mirrors `run`'s logic, minus the trace calls) */
  code: string;
  /**
   * Plain-language "explain like I'm 5" breakdown shown in an expandable section
   * at the bottom of the page. Markdown-ish: blank lines separate paragraphs,
   * lines starting with "## " are sub-headings, "- " are bullets.
   */
  eli5?: string;
}
