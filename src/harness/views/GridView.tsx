import type { ViewState } from '../../algorithms/types';

type GridState = Extract<ViewState, { kind: 'grid' }>;

// Draws a 2-D grid (match-3 board, DP table, …). Optional row/column headers
// label the axes (handy for DP tables). `role` colours cells: match/active/
// cleared (match-3) or dep/done (DP — a filled cell vs the cells it reads).
export function GridView({ view }: { view: GridState }) {
  const { rows, colHeaders, rowHeaders, pixel } = view;
  return (
    <div className={`grid-view${pixel ? ' pixels' : ''}`} data-testid="grid-view">
      {colHeaders && (
        <div className="grid-row">
          {rowHeaders && <div className="grid-head corner" />}
          {colHeaders.map((h, c) => (
            <div key={c} className="grid-head">
              {h}
            </div>
          ))}
        </div>
      )}
      {rows.map((row, r) => (
        <div key={r} className="grid-row">
          {rowHeaders && <div className="grid-head">{rowHeaders[r]}</div>}
          {row.map((c, col) => (
            <div
              key={col}
              className={`grid-cell role-${c.role ?? 'plain'}${c.arrow ? ' has-arrow' : ''}`}
              style={c.fill ? { background: c.fill } : undefined}
            >
              {!pixel && <span className="grid-cell-value">{c.value}</span>}
              {c.arrow && <span className="grid-cell-arrow">{c.arrow}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
