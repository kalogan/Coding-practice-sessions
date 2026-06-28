import type { ViewState } from '../../algorithms/types';

type ListState = Extract<ViewState, { kind: 'list' }>;

// Draws a linked list as boxes in a row with arrows following each node's `next`.
// For a DOUBLY linked list (any node sets `prev`), next arrows ride an upper lane
// and prev arrows a lower lane so both directions are visible. Adjacent links are
// straight; a link that jumps elsewhere (reversal / cycle back-edge) curves below.
// Labelled cursors (head/prev/cur/slow/fast) float above their target node.
const NW = 92;
const NH = 52;
const GAP = 56;
const PAD = 30;
const ROW_Y = 96;

export function LinkedListView({ view }: { view: ListState }) {
  const n = view.nodes.length;
  const indexOf = new Map(view.nodes.map((nd, i) => [nd.id, i]));
  const cx = (i: number) => PAD + NW / 2 + i * (NW + GAP);
  const W = Math.max(300, PAD * 2 + n * NW + Math.max(0, n - 1) * GAP);
  const H = 200;
  const doubly = view.nodes.some((nd) => nd.prev !== undefined);
  const nextY = doubly ? ROW_Y - 12 : ROW_Y;
  const prevY = ROW_Y + 14;

  const link = (i: number, targetId: string | null | undefined, laneY: number, key: string, cls: string) => {
    if (targetId === null || targetId === undefined) {
      if (laneY !== nextY) return null; // only draw the null terminator on the next lane
      const x = cx(i) + NW / 2;
      return (
        <g key={key}>
          <line x1={x} y1={laneY} x2={x + GAP * 0.55} y2={laneY} className={cls} />
          <text x={x + GAP * 0.55 + 8} y={laneY} className="list-null" dominantBaseline="central">
            ∅
          </text>
        </g>
      );
    }
    const j = indexOf.get(targetId);
    if (j === undefined) return null;
    const a = cx(i);
    const b = cx(j);
    if (j === i + 1) {
      return <line key={key} x1={a + NW / 2} y1={laneY} x2={b - NW / 2} y2={laneY} className={cls} markerEnd="url(#list-arrow)" />;
    }
    if (j === i - 1) {
      return <line key={key} x1={a - NW / 2} y1={laneY} x2={b + NW / 2} y2={laneY} className={cls} markerEnd="url(#list-arrow)" />;
    }
    const y0 = ROW_Y + NH / 2;
    const dip = 56 + Math.abs(j - i) * 10;
    return (
      <path key={key} d={`M ${a} ${y0} Q ${(a + b) / 2} ${y0 + dip} ${b} ${y0}`} className={cls} fill="none" markerEnd="url(#list-arrow)" />
    );
  };

  return (
    <div className="list-view" data-testid="list-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <marker id="list-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="list-arrowhead" />
          </marker>
        </defs>

        {view.nodes.map((nd, i) => link(i, nd.next, nextY, `n${i}`, 'list-edge'))}
        {doubly && view.nodes.map((nd, i) => link(i, nd.prev, prevY, `p${i}`, 'list-edge list-prev'))}

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
          const y = ROW_Y - NH / 2 - 12 - (k % 2) * 22;
          return (
            <g key={`ptr${k}`} className={`list-pointer role-${p.role ?? 'plain'}`}>
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
