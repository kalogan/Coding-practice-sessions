import type { TraceStep } from '../algorithms/types';

export function StatePanel({ step }: { step: TraceStep }) {
  return (
    <div className="state-panel" data-testid="state-panel">
      <h3>State</h3>
      <div className="state-grid">
        {step.state.map((f, i) => (
          <div key={i} className={`state-field${f.highlight ? ' hot' : ''}`}>
            <span className="state-label">{f.label}</span>
            <span className="state-value">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
