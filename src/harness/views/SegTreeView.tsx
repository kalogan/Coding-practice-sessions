import type { ViewState } from '../../algorithms/types';

type SegState = Extract<ViewState, { kind: 'segtree' }>;

// Draws a segment tree as SVG: each node is a box showing the range it covers
// [lo..hi] and its aggregate value. The algorithm supplies normalized x/y
// positions (use bstLayout). Roles colour the path / nodes fully or partially
// inside a query range.
const W = 1000;
const H = 560;
const M = 80;
const BW = 78;
const BH = 46;

const sx = (x: number) => M + x * (W - 2 * M);
const sy = (y: number) => M + y * (H - 2 * M);

export function SegTreeView({ view }: { view: SegState }) {
  const pos = new Map(view.nodes.map((nd) => [nd.id, { x: sx(nd.x), y: sy(nd.y) }]));
  return (
    <div className="segtree-view" data-testid="segtree-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        {view.edges.map((e, i) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="seg-edge" />;
        })}
        {view.nodes.map((nd) => {
          const p = pos.get(nd.id);
          if (!p) return null;
          return (
            <g key={nd.id} className={`seg-node role-${nd.role ?? 'plain'}`} data-testid={`seg-${nd.id}`}>
              <rect x={p.x - BW / 2} y={p.y - BH / 2} width={BW} height={BH} rx={7} />
              <text x={p.x} y={p.y - 8} textAnchor="middle" className="seg-range">
                [{nd.lo}..{nd.hi}]
              </text>
              <text x={p.x} y={p.y + 11} textAnchor="middle" className="seg-value">
                {nd.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
