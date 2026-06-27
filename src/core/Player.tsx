import { useEffect, useState } from 'react';
import type { AlgoResult } from '../algorithms/types';
import { StepView } from '../harness/StepView';
import { Controls } from '../harness/Controls';
import { StatePanel } from '../harness/StatePanel';
import { StepLog } from '../harness/StepLog';
import { CodePanel } from '../harness/CodePanel';

interface Props {
  /** the trace to play back (steps + the real answer) */
  result: AlgoResult;
  /** source shown in the code panel (built-in algo code, or the user's code) */
  code: string;
}

// The play-back surface, driven purely by a result. Reused by the built-in
// Workbench (result = algo.run(input)) and the Playground (result = the user's
// code, executed in a worker / Pyodide). It never knows where the trace came
// from — only how to step through it.
export function Player({ result, code }: Props) {
  const total = result.steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5); // steps per second

  const clamped = Math.min(stepIndex, Math.max(0, total - 1));
  const step = result.steps[clamped];
  const done = clamped >= total - 1;

  // a fresh result (new code run / new input) restarts the playback
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [result]);

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStepIndex((i) => Math.min(i + 1, total - 1)), 1000 / speed);
    return () => clearTimeout(id);
  }, [playing, clamped, done, total, speed]);

  if (total === 0 || !step) {
    return <div className="player-empty">No steps to show — run some code first.</div>;
  }

  return (
    <>
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

      <CodePanel code={code} />
    </>
  );
}
