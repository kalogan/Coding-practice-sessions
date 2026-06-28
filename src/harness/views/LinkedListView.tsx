import type { ViewState } from '../../algorithms/types';

type ListState = Extract<ViewState, { kind: 'list' }>;

// Draws a linked list as boxes in a row with arrows following each node's `next`
// pointer. Adjacent links are straight; a link that jumps elsewhere (a reversed
// pointer or a cycle back-edge) curves below. Labelled cursors (head/prev/cur/
// slow/fast) float above their target node.
const NW = 92; // node width
const NH = 52; // node height
const GAP = 56;
const PAD = 30;
const ROW_Y = 96;

export function LinkedListView({ view }: { view: ListState }) {
  const n = view.nodes.length;
  const indexOf = new Map(view.nodes.map((nd, i) => [nd.id, i]));
  const cx = (i: number) => PAD + NW / 2 + i * (NW + GAP);
  const W = Math.max(300, PAD * 2 + n * NW + Math.max(0, n - 1) * GAP);
  const H = 200;

  return (
    <div className="list-view" data-testid="list-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <marker
            id="list-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="list-arrowhead" />
          </marker>
        </defs>

        {view.nodes.map((nd, i) => {
          if (nd.next === null) {
            const x = cx(i) + NW / 2;
            return (
              <g key={`e${i}`}>
                <line x1={x} y1={ROW_Y} x2={x + GAP * 0.55} y2={ROW_Y} className="list-edge" />
                <text x={x + GAP * 0.55 + 8} y={ROW_Y} className="list-null" dominantBaseline="central">
                  ∅
                </text>
              </g>
            );
          }
          const j = indexOf.get(nd.next);
          if (j === undefined) return null;
          const a = cx(i);
          const b = cx(j);
          if (j === i + 1) {
            return (
              <line key={`e${i}`} x1={a + NW / 2} y1={ROW_Y} x2={b - NW / 2} y2={ROW_Y} className="list-edge" markerEnd="url(#list-arrow)" />
            );
          }
          if (j === i - 1) {
            return (
              <line key={`e${i}`} x1={a - NW / 2} y1={ROW_Y} x2={b + NW / 2} y2={ROW_Y} className="list-edge" markerEnd="url(#list-arrow)" />
            );
          }
          // non-adjacent (cycle / long jump): arc below
          const y0 = ROW_Y + NH / 2;
          const dip = 56 + Math.abs(j - i) * 10;
          return (
            <path
              key={`e${i}`}
              d={`M ${a} ${y0} Q ${(a + b) / 2} ${y0 + dip} ${b} ${y0}`}
              className="list-edge"
              fill="none"
              markerEnd="url(#list-arrow)"
            />
          );
        })}

        {view.nodes.map((nd, i) => (
          <g key={nd.id} className={`list-node role-${nd.role ?? 'plain'}`} data-testid={`lnode-${nd.id}`}>
            <rect x={cx(i) - NW / 2} y={ROW_Y - NH / 2} width={NW} height={NH} rx={8} />
            <text x={cx(i)} y={ROW_Y} textAnchor="middle" dominantBaseline="central">
              {nd.value}
            </text>
          </g>
        ))}

        {view.pointers?.map((p, k) => {
          if (p.target === null) return null;
          const j = indexOf.get(p.target);
          if (j === undefined) return null;
          const x = cx(j);
          const y = ROW_Y - NH / 2 - 12 - (k % 2) * 22; // stagger overlapping cursors
          return (
            <g key={`p${k}`} className={`list-pointer role-${p.role ?? 'plain'}`}>
              <text x={x} y={y} textAnchor="middle">
                {p.label}
              </text>
              <line x1={x} y1={y + 5} x2={x} y2={ROW_Y - NH / 2 - 2} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
