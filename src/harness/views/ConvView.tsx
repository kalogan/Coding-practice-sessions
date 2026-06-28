import type { ViewState } from '../../algorithms/types';

type ConvState = Extract<ViewState, { kind: 'conv' }>;

// Shows a convolution "seeing the board": the input image with the kernel window
// highlighted, the kernel weights, and the output feature map filling in. This is
// how a convnet's first layer turns raw pixels into edge/feature responses.
export function ConvView({ view }: { view: ConvState }) {
  const kh = view.kernel.length;
  const kw = view.kernel[0]?.length ?? 0;
  const inWindow = (r: number, c: number) =>
    view.window ? r >= view.window.row && r < view.window.row + kh && c >= view.window.col && c < view.window.col + kw : false;

  return (
    <div className="conv-view" data-testid="conv-view">
      <div className="conv-panel">
        <div className="conv-label">input (board)</div>
        <div className="conv-grid">
          {view.input.map((row, r) => (
            <div key={r} className="conv-row">
              {row.map((v, c) => (
                <div key={c} className={`conv-cell${inWindow(r, c) ? ' in-window' : ''}`}>
                  {v}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="conv-op">✲</div>

      <div className="conv-panel">
        <div className="conv-label">kernel</div>
        <div className="conv-grid">
          {view.kernel.map((row, r) => (
            <div key={r} className="conv-row">
              {row.map((v, c) => (
                <div key={c} className="conv-cell kernel">
                  {v}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="conv-op">=</div>

      <div className="conv-panel">
        <div className="conv-label">feature map</div>
        <div className="conv-grid">
          {view.output.map((row, r) => (
            <div key={r} className="conv-row">
              {row.map((v, c) => {
                const isActive = view.active && view.active.row === r && view.active.col === c;
                return (
                  <div key={c} className={`conv-cell out${isActive ? ' active' : ''}${v === null ? ' empty' : ''}`}>
                    {v === null ? '' : v}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
