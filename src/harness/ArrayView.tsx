import type { TraceStep } from '../algorithms/types';

interface Props {
  array: number[];
  step: TraceStep;
}

// Draws the array as bars, shades the current window, and floats pointer
// labels above the cells they point at. Purely a function of the step — it
// has no idea which algorithm produced it.
export function ArrayView({ array, step }: Props) {
  const max = Math.max(...array, 1);
  return (
    <div className="array-view" data-testid="array-view">
      {array.map((value, i) => {
        const inWindow = step.window ? i >= step.window.start && i <= step.window.end : false;
        const markers = step.markers.filter((m) => m.index === i);
        const left = markers.find((m) => m.role === 'left');
        const right = markers.find((m) => m.role === 'right');
        return (
          <div key={i} className={`cell${inWindow ? ' in-window' : ''}`} data-testid={`cell-${i}`}>
            <div className="pointers">
              {left && <span className="ptr ptr-left">{left.label ?? 'L'}▾</span>}
              {right && <span className="ptr ptr-right">{right.label ?? 'R'}▾</span>}
            </div>
            <div className="bar" style={{ height: `${(value / max) * 150 + 22}px` }}>
              <span className="bar-value">{value}</span>
            </div>
            <div className="index">{i}</div>
          </div>
        );
      })}
    </div>
  );
}
