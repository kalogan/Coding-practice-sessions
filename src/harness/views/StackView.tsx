import type { ViewState } from '../../algorithms/types';

type StackState = Extract<ViewState, { kind: 'stack' }>;

// Draws the call stack with the most-recent frame on top (the way a debugger
// shows it). `status` colours active vs returning vs settled frames.
export function StackView({ view }: { view: StackState }) {
  const frames = [...view.frames].reverse();
  return (
    <div className="stack-view" data-testid="stack-view">
      {frames.length === 0 && <div className="stack-empty">— call stack empty —</div>}
      {frames.map((f, i) => (
        <div key={i} className={`frame status-${f.status ?? 'active'}`}>
          <span className="frame-title">{f.title}</span>
          {f.detail && <span className="frame-detail">{f.detail}</span>}
        </div>
      ))}
    </div>
  );
}
