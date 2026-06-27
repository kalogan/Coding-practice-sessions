import { useEffect, useMemo, useState } from 'react';
import { algorithms, getAlgorithm } from '../algorithms/registry';
import { AlgoPicker } from '../harness/AlgoPicker';
import { Workbench } from '../core/Workbench';
import type { AlgoInput } from '../algorithms/types';

// Preview entry (served at /preview). Same real Workbench + same registry as
// production, PLUS inspection knobs: edit the input, slide the params, and see
// the raw emitted trace. This is the harness shell — never a forked renderer.
export function PreviewApp() {
  const [selectedId, setSelectedId] = useState(algorithms[0]?.id ?? '');
  const algo = getAlgorithm(selectedId) ?? algorithms[0];

  const [input, setInput] = useState<AlgoInput>(algo.defaultInput);

  // reset the input when you switch algorithms
  useEffect(() => {
    const next = getAlgorithm(selectedId);
    if (next) setInput(next.defaultInput);
  }, [selectedId]);

  // run the real code here too, purely to show the raw trace (deterministic —
  // identical to what the Workbench renders, since it's the same pure function)
  const trace = useMemo(() => algo.run(input), [algo, input]);

  function setArray(text: string) {
    const nums = text
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    if (nums.length) setInput((p) => ({ ...p, array: nums }));
  }

  function setParam(key: string, value: number) {
    setInput((p) => ({ ...p, params: { ...p.params, [key]: value } }));
  }

  return (
    <div className="app preview-mode">
      <aside className="sidebar">
        <h1 className="brand">
          Algo<span>Harness</span>
        </h1>
        <span className="mode-badge">PREVIEW · workbench</span>
        <p className="tagline">Tweak inputs, inspect the raw trace.</p>
        <AlgoPicker algorithms={algorithms} selectedId={algo.id} onSelect={setSelectedId} />
        <a className="preview-link" href="/">
          ← Back to the learning view
        </a>
        <p className="boundary">
          Boundary: this previews the <strong>real</strong> algorithm + renderer. It does not
          verify performance at scale or anything the code doesn&apos;t actually execute.
        </p>
      </aside>

      <main className="stage">
        <Workbench key={algo.id + JSON.stringify(input)} algo={algo} input={input}>
          <div className="knobs" data-testid="knobs">
            <h3>
              Inputs <span className="muted">— same input, same trace (deterministic)</span>
            </h3>
            <label className="knob">
              <span>array</span>
              <input
                type="text"
                key={selectedId}
                defaultValue={input.array.join(', ')}
                onBlur={(e) => setArray(e.target.value)}
                aria-label="array values"
              />
            </label>
            {Object.entries(input.params ?? {}).map(([k, v]) => (
              <label className="knob" key={k}>
                <span>
                  {k}: <strong>{v}</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={Math.max(20, ...input.array)}
                  value={v}
                  onChange={(e) => setParam(k, Number(e.target.value))}
                  aria-label={k}
                />
              </label>
            ))}
          </div>
        </Workbench>

        <details className="raw-trace">
          <summary>Raw trace — {trace.steps.length} emitted snapshots</summary>
          <pre>{JSON.stringify(trace.steps, null, 2)}</pre>
        </details>
      </main>
    </div>
  );
}
