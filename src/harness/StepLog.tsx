import type { TraceStep } from '../algorithms/types';

interface Props {
  step: TraceStep;
  index: number;
  total: number;
  answer: string | number;
  done: boolean;
}

export function StepLog({ step, index, total, answer, done }: Props) {
  return (
    <div className="step-log" data-testid="step-log">
      <h3>
        Step {index + 1} <span className="muted">of {total}</span>
      </h3>
      <p className="note" data-testid="step-note">
        {step.note}
      </p>
      {done && (
        <p className="answer" data-testid="answer">
          Answer: <strong>{answer}</strong>
        </p>
      )}
    </div>
  );
}
