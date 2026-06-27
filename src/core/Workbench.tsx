import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AlgoDescriptor, AlgoInput } from '../algorithms/types';
import { Player } from './Player';

interface Props {
  algo: AlgoDescriptor;
  input: AlgoInput;
  /** harness shell injects extra controls (input knobs) here */
  children?: ReactNode;
}

// The shared, real visualization. Both the production app (/) and the preview
// workbench (/preview) mount THIS — never a copy. Given an algorithm and an
// input, it runs the real code, collects the trace, and plays it back.
export function Workbench({ algo, input, children }: Props) {
  const result = useMemo(() => algo.run(input), [algo, input]);

  return (
    <div className="workbench">
      <header className="algo-header">
        <div className="algo-meta">
          <span className="pill">{algo.category}</span>
          <span className="pill ghost">{algo.complexity}</span>
        </div>
        <h2>{algo.title}</h2>
        <p className="scenario">{algo.scenario}</p>
        <p className="pattern">
          <strong>Pattern.</strong> {algo.pattern}
        </p>
      </header>

      {children}

      <Player result={result} code={algo.code} />
    </div>
  );
}
