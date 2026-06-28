import type { ViewState } from '../../algorithms/types';

type ChartState = Extract<ViewState, { kind: 'chart' }>;

// Draws a 2-D line chart with point markers — for loss curves, learning curves,
// gradient descent, etc. The algorithm gives data-space coordinates and the axis
// ranges; this maps them into an SVG plot area with simple axes.
const W = 900;
const H = 480;
const ML = 70; // left margin (y axis)
const MB = 56; // bottom margin (x axis)
const MT = 24;
const MR = 28;

export function ChartView({ view }: { view: ChartState }) {
  const [x0, x1] = view.xRange;
  const [y0, y1] = view.yRange;
  const px = (x: number) => ML + ((x - x0) / (x1 - x0 || 1)) * (W - ML - MR);
  const py = (y: number) => H - MB - ((y - y0) / (y1 - y0 || 1)) * (H - MT - MB);

  const ticks = (a: number, b: number, n = 4) =>
    Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

  return (
    <div className="chart-view" data-testid="chart-view">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        {/* axes */}
        <line x1={ML} y1={MT} x2={ML} y2={H - MB} className="chart-axis" />
        <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} className="chart-axis" />
        {ticks(x0, x1).map((t, i) => (
          <text key={`xt${i}`} x={px(t)} y={H - MB + 24} className="chart-tick" textAnchor="middle">
            {Math.round(t * 100) / 100}
          </text>
        ))}
        {ticks(y0, y1).map((t, i) => (
          <text key={`yt${i}`} x={ML - 12} y={py(t)} className="chart-tick" textAnchor="end" dominantBaseline="central">
            {Math.round(t * 100) / 100}
          </text>
        ))}
        {view.xLabel && (
          <text x={(ML + W - MR) / 2} y={H - 8} className="chart-label" textAnchor="middle">
            {view.xLabel}
          </text>
        )}
        {view.yLabel && (
          <text x={18} y={(MT + H - MB) / 2} className="chart-label" textAnchor="middle" transform={`rotate(-90 18 ${(MT + H - MB) / 2})`}>
            {view.yLabel}
          </text>
        )}

        {/* line series */}
        {view.lines.map((ln, i) => (
          <polyline
            key={`ln${i}`}
            className={`chart-line role-${ln.role ?? 'plain'}`}
            fill="none"
            points={ln.points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}
          />
        ))}

        {/* point markers */}
        {view.points.map((p, i) => (
          <g key={`pt${i}`} className={`chart-point role-${p.role ?? 'plain'}`}>
            <circle cx={px(p.x)} cy={py(p.y)} r={8} />
            {p.label && (
              <text x={px(p.x) + 12} y={py(p.y) - 12} className="chart-point-label">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
