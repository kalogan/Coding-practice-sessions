import { useState } from 'react';
import { algorithms, getAlgorithm } from './algorithms/registry';
import { AlgoPicker } from './harness/AlgoPicker';
import { Workbench } from './core/Workbench';
import { AppShell } from './core/AppShell';

// allow deep-links from the study path: /?algo=<id>
function initialAlgoId(): string {
  try {
    const q = new URLSearchParams(window.location.search).get('algo');
    if (q && getAlgorithm(q)) return q;
  } catch {
    /* no-op */
  }
  return algorithms[0]?.id ?? '';
}

// Production entry (served at /). Clean, opinionated learning view.
export function App() {
  const [selectedId, setSelectedId] = useState(initialAlgoId);
  const algo = getAlgorithm(selectedId) ?? algorithms[0];

  return (
    <AppShell
      sidebar={(close) => (
        <>
          <h1 className="brand">
            Algo<span>Harness</span>
          </h1>
          <p className="tagline">Watch real algorithms run, step by step.</p>
          <AlgoPicker
            algorithms={algorithms}
            selectedId={algo.id}
            onSelect={(id) => {
              setSelectedId(id);
              close();
            }}
          />
          <a className="preview-link" href="/learn">
            🎓 Study path →
          </a>
          <a className="preview-link" href="/playground">
            ✎ Write &amp; run your own →
          </a>
          <a className="preview-link" href="/preview">
            Open the preview workbench →
          </a>
        </>
      )}
    >
      <Workbench key={algo.id} algo={algo} input={algo.defaultInput} />
    </AppShell>
  );
}
