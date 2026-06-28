import type { ViewState } from '../../algorithms/types';

type HeapState = Extract<ViewState, { kind: 'heaparray' }>;

// Draws a heap as its backing ARRAY: a row of value cells with their indices
// beneath, plus optional arcs from a parent index to its children (i -> 2i+1,
// 2i+2) so the array<->tree mapping is visible. Roles colour compare/swap cells.
const CW = 64;
const GAP = 12;
const PAD = 24;
const ARC_TOP = 30;
const ROW_Y = 96;

export function HeapArrayView({ view }: { view: HeapState }) {
  const n = view.cells.length;
  const cx = (i: number) => PAD + CW / 2 + i * (CW + GAP);
  const W = Math.max(300, PAD * 2 + n * CW + Math.max(0, n - 1) * GAP);
  const H = 170;

  return (
    <div className="heaparray-view" data-testid="heaparray-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        {(view.links ?? []).map((lk, i) => {
          if (lk.parent >= n || lk.child >= n) return null;
          const a = cx(lk.parent);
          const b = cx(lk.child);
          const top = ROW_Y - CW / 2 - 6;
          const dip = ARC_TOP + Math.abs(lk.child - lk.parent) * 2;
          return (
            <path
              key={i}
              d={`M ${a} ${top} Q ${(a + b) / 2} ${top - dip} ${b} ${top}`}
              className="heap-link"
              fill="none"
            />
          );
        })}
        {view.cells.map((c) => (
          <g key={c.index} className={`heap-cell role-${c.role ?? 'plain'}`} data-testid={`hcell-${c.index}`}>
            <rect x={cx(c.index) - CW / 2} y={ROW_Y - CW / 2} width={CW} height={CW} rx={8} />
            <text x={cx(c.index)} y={ROW_Y} textAnchor="middle" dominantBaseline="central" className="heap-val">
              {c.value}
            </text>
            <text x={cx(c.index)} y={ROW_Y + CW / 2 + 18} textAnchor="middle" className="heap-idx">
              {c.index}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
