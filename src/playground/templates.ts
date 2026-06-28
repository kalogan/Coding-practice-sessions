// Starter code for the playground. Each is a WORKING sliding-window solution
// the learner edits — the fastest way to understand the trace API is to tweak
// a running example.

export const DEFAULT_INPUT = `{
  "array": [3, 1, 4, 1, 5, 9, 2, 6],
  "params": { "budget": 10 }
}`;

export const JS_TEMPLATE = `// Write a run(input, trace) function.
//  • input  — the data from the JSON box (right).
//  • trace  — call trace.step({ view, state, note }) at each meaningful step.
//  • return your answer.
//
// View kinds you can render:
//   { kind: 'array',  values: [n], markers: [{index, role:'left'|'right'|'window', label}], window: {start,end}, bars: ['compare'|'swap'|'sorted'|...] }
//   { kind: 'tokens', tokens: [{text, role, label}], window: {start,end} }
//   { kind: 'stack',  frames: [{title, detail, status:'active'|'returning'|'done'}] }
//   { kind: 'grid',   rows: [[{value, role}]], colHeaders: [...], rowHeaders: [...] }
//   { kind: 'graph',  nodes: [{id, label, x, y, role}], edges: [{from, to, directed, role, weight}] }
//   { kind: 'list',   nodes: [{id, value, next, prev, role}], pointers: [{label, target, role}] }
//   { kind: 'hashtable', buckets: [{index, entries: [{key, value, role}], role}] }
//   { kind: 'segtree',   nodes: [{id, lo, hi, value, x, y, role}], edges: [{from, to}] }
//   { kind: 'heaparray', cells: [{index, value, role}], links: [{parent, child}] }
//   { kind: 'chart',  lines: [{points: [[x,y]...], role}], points: [{x, y, role, label}], xRange:[a,b], yRange:[a,b], xLabel, yLabel }
//   { kind: 'network', neurons: [{id, x, y, value, label, role}], edges: [{from, to, weight, role}] }
//   { kind: 'conv',    input: [[n]], kernel: [[n]], output: [[n|null]], window: {row,col}, active: {row,col} }
//   { kind: 'table',   tables: [{name, columns:[..], rows:[[..]], heat, heatMin, heatMax, highlightRow, highlightCol, flags:[{row,col}], caption}] }

function run(input, trace) {
  const a = input.array;
  const budget = input.params.budget;
  let left = 0, sum = 0, best = 0;

  for (let right = 0; right < a.length; right++) {
    sum += a[right];                       // grow the window
    while (sum > budget) {                  // shrink while over budget
      sum -= a[left];
      left++;
    }
    best = Math.max(best, right - left + 1);

    trace.step({
      view: {
        kind: 'array',
        values: a,
        markers: [
          { index: left,  role: 'left',  label: 'L' },
          { index: right, role: 'right', label: 'R' },
        ],
        window: { start: left, end: right },
      },
      state: [
        { label: 'sum',  value: sum },
        { label: 'best', value: best, highlight: true },
      ],
      note: \`right=\${right}: window sum \${sum}, best length \${best}.\`,
    });
  }

  return best;
}`;

export const PY_TEMPLATE = `# Write a run(input, trace) function.
#  • input  — the data from the JSON box (right), as a dict.
#  • trace  — call trace.step({ ... }) at each meaningful step.
#  • return your answer.
#
# Same view kinds as JS: 'array' | 'tokens' | 'stack' | 'grid'.

def run(input, trace):
    a = input["array"]
    budget = input["params"]["budget"]
    left, total, best = 0, 0, 0

    for right in range(len(a)):
        total += a[right]                    # grow the window
        while total > budget:                # shrink while over budget
            total -= a[left]
            left += 1
        best = max(best, right - left + 1)

        trace.step({
            "view": {
                "kind": "array",
                "values": a,
                "markers": [
                    {"index": left,  "role": "left",  "label": "L"},
                    {"index": right, "role": "right", "label": "R"},
                ],
                "window": {"start": left, "end": right},
            },
            "state": [
                {"label": "sum",  "value": total},
                {"label": "best", "value": best, "highlight": True},
            ],
            "note": f"right={right}: window sum {total}, best length {best}.",
        })

    return best`;
