import { useState } from 'react';
import { algorithms, getAlgorithm } from './algorithms/registry';
import { AlgoPicker } from './harness/AlgoPicker';
import { Workbench } from './core/Workbench';

// Production entry (served at /). Clean, opinionated learning view.
export function App() {
  const [selectedId, setSelectedId] = useState(algorithms[0]?.id ?? '');
  const algo = getAlgorithm(selectedId) ?? algorithms[0];

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">
          Algo<span>Harness</span>
        </h1>
        <p className="tagline">Watch real algorithms run, step by step.</p>
        <AlgoPicker algorithms={algorithms} selectedId={algo.id} onSelect={setSelectedId} />
        <a className="preview-link" href="/preview">
          Open the preview workbench →
        </a>
      </aside>
      <main className="stage">
        <Workbench key={algo.id} algo={algo} input={algo.defaultInput} />
      </main>
    </div>
  );
}
