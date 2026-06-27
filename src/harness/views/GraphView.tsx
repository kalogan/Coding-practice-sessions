import type { ViewState } from '../../algorithms/types';

type GraphState = Extract<ViewState, { kind: 'graph' }>;

// Draws a graph as SVG. The algorithm supplies normalized (0..1) node positions,
// so this renderer is dumb + deterministic — it just maps them into the viewBox,
// draws edges (with arrowheads when directed), then nodes on top. Serves general
// graphs (traversal, triangles) and trees/heaps (hierarchical positions) alike.
const W = 1000;
const H = 600;
const M = 70; // margin so edge nodes aren't clipped
const R = 26; // node radius

const sx = (x: number) => M + x * (W - 2 * M);
const sy = (y: number) => M + y * (H - 2 * M);

export function GraphView({ view }: { view: GraphState }) {
  const pos = new Map(view.nodes.map((n) => [n.id, { x: sx(n.x), y: sy(n.y) }]));
  return (
    <div className="graph-view" data-testid="graph-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <marker
            id="graph-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="graph-arrow" />
          </marker>
        </defs>

        {view.edges.map((e, i) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          let x2 = b.x;
          let y2 = b.y;
          if (e.directed) {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            x2 = b.x - (dx / len) * (R + 8);
            y2 = b.y - (dy / len) * (R + 8);
          }
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={x2}
              y2={y2}
              className={`graph-edge role-${e.role ?? 'plain'}`}
              markerEnd={e.directed ? 'url(#graph-arrow)' : undefined}
            />
          );
        })}

        {view.nodes.map((n) => {
          const p = pos.get(n.id);
          if (!p) return null;
          return (
            <g key={n.id} className={`graph-node role-${n.role ?? 'plain'}`} data-testid={`gnode-${n.id}`}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central">
                {n.label ?? n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
