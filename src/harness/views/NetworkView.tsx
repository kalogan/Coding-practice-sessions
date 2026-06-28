import type { ViewState } from '../../algorithms/types';

type NetState = Extract<ViewState, { kind: 'network' }>;

// Draws a small neural network: neurons in layers (algorithm supplies normalized
// x/y), weighted edges between them. `role` colours the forward pass ('active')
// vs backprop ('grad'). Node fill shows the activation; edge labels the weight.
const W = 1000;
const H = 520;
const M = 80;
const R = 30;

const sx = (x: number) => M + x * (W - 2 * M);
const sy = (y: number) => M + y * (H - 2 * M);

export function NetworkView({ view }: { view: NetState }) {
  const pos = new Map(view.neurons.map((n) => [n.id, { x: sx(n.x), y: sy(n.y) }]));
  return (
    <div className="network-view" data-testid="network-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        {view.edges.map((e, i) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          const mx = a.x + (b.x - a.x) * 0.5;
          const my = a.y + (b.y - a.y) * 0.5;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`net-edge role-${e.role ?? 'plain'}`} />
              {e.weight !== undefined && (
                <text x={mx} y={my} className="net-weight" textAnchor="middle" dominantBaseline="central">
                  {e.weight.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        {view.neurons.map((n) => {
          const p = pos.get(n.id);
          if (!p) return null;
          return (
            <g key={n.id} className={`net-neuron role-${n.role ?? 'plain'}`} data-testid={`neuron-${n.id}`}>
              <circle cx={p.x} cy={p.y} r={R} />
              {n.value !== undefined && (
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="net-value">
                  {n.value.toFixed(2)}
                </text>
              )}
              {n.label && (
                <text x={p.x} y={p.y - R - 10} textAnchor="middle" className="net-label">
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
