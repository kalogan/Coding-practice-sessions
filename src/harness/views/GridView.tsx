import type { ViewState } from '../../algorithms/types';

type GridState = Extract<ViewState, { kind: 'grid' }>;

// Draws a 2-D grid (match-3 board, etc.). `role` colours matched/active/cleared
// cells.
export function GridView({ view }: { view: GridState }) {
  return (
    <div className="grid-view" data-testid="grid-view">
      {view.rows.map((row, r) => (
        <div key={r} className="grid-row">
          {row.map((c, col) => (
            <div key={col} className={`grid-cell role-${c.role ?? 'plain'}`}>
              {c.value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
