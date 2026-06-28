import type { ViewState } from '../../algorithms/types';

type ArrayState = Extract<ViewState, { kind: 'array' }>;

// Draws a numeric array as bars, shades the current window, and floats pointer
// labels above the cells they point at. Pure function of the view.
export function ArrayView({ view }: { view: ArrayState }) {
  const max = Math.max(...view.values, 1);
  return (
    <div className="array-view" data-testid="array-view">
      {view.values.map((value, i) => {
        const inWindow = view.window ? i >= view.window.start && i <= view.window.end : false;
        const markers = view.markers.filter((m) => m.index === i);
        const left = markers.find((m) => m.role === 'left');
        const right = markers.find((m) => m.role === 'right');
        const barRole = view.bars?.[i] ?? 'plain';
        return (
          <div key={i} className={`cell${inWindow ? ' in-window' : ''}`} data-testid={`cell-${i}`}>
            <div className="pointers">
              {left && <span className="ptr ptr-left">{left.label ?? 'L'}▾</span>}
              {right && <span className="ptr ptr-right">{right.label ?? 'R'}▾</span>}
            </div>
            <div className={`bar bar-${barRole}`} style={{ height: `${(value / max) * 150 + 22}px` }}>
              <span className="bar-value">{value}</span>
            </div>
            <div className="index">{i}</div>
          </div>
        );
      })}
    </div>
  );
}
