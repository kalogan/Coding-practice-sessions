import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AlgoDescriptor, AlgoInput } from '../algorithms/types';
import { StepView } from '../harness/StepView';
import { Controls } from '../harness/Controls';
import { StatePanel } from '../harness/StatePanel';
import { StepLog } from '../harness/StepLog';
import { CodePanel } from '../harness/CodePanel';

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
  const total = result.steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5); // steps per second

  const clamped = Math.min(stepIndex, total - 1);
  const step = result.steps[clamped];
  const done = clamped >= total - 1;

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStepIndex((i) => Math.min(i + 1, total - 1)), 1000 / speed);
    return () => clearTimeout(id);
  }, [playing, clamped, done, total, speed]);

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

      <StepView step={step} />

      <Controls
        stepIndex={clamped}
        total={total}
        playing={playing}
        speed={speed}
        onPlayPause={() => setPlaying((p) => !p)}
        onStep={(d) => {
          setPlaying(false);
          setStepIndex((i) => Math.max(0, Math.min(total - 1, i + d)));
        }}
        onScrub={(i) => {
          setPlaying(false);
          setStepIndex(i);
        }}
        onSpeed={setSpeed}
        onRestart={() => {
          setPlaying(false);
          setStepIndex(0);
        }}
      />

      <div className="lower">
        <StepLog step={step} index={clamped} total={total} answer={result.answer} done={done} />
        <StatePanel step={step} />
      </div>

      <CodePanel code={algo.code} />
    </div>
  );
}
