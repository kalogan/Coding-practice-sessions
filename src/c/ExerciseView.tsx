import { useState } from 'react';
import { Editor } from '../playground/Editor';
import { compiler } from './engine';
import { runExercise } from './exercises/runner';
import type { ExerciseRunResult } from './exercises/runner';
import type { CExercise } from './exercises/types';
import { LessonPanel } from './LessonPanel';

interface Props {
  exercise: CExercise;
}

// One exercise: prompt + editor (starter) + Check. Runs the user's code through
// the hidden harness / I/O cases and reports pass/fail per case. `key` on the
// exercise id (in CApp) remounts this so state resets when you switch exercises.
export function ExerciseView({ exercise }: Props) {
  const [code, setCode] = useState(exercise.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExerciseRunResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  async function check() {
    setRunning(true);
    setResult(null);
    const r = await runExercise(exercise, code, compiler);
    setResult(r);
    setRunning(false);
  }

  const passed = result?.passed ?? false;

  return (
    <div className="c-session">
      {exercise.lesson && <LessonPanel lesson={exercise.lesson} title={exercise.title} />}
      <div className="c-session-main">
      <header className="algo-header">
        <div className="algo-meta">
          <span className="pill">{exercise.module}</span>
          <span className="pill ghost">{exercise.difficulty}</span>
          <span className="pill ghost">{exercise.mode === 'function' ? 'write a function' : 'write a program'}</span>
        </div>
        <h2>{exercise.title}</h2>
        <p className="scenario cx-prompt">{exercise.prompt}</p>
      </header>

      <div className="c-ide">
        <div className="c-editor-wrap">
          <Editor value={code} onChange={setCode} language="c" />
        </div>
        <div className="c-actions">
          <button className="ctl play c-run" onClick={check} disabled={running} data-testid="c-check">
            {running ? 'Checking…' : '✓ Check'}
          </button>
          <button
            className="ctl ghost cx-reset"
            onClick={() => {
              setCode(exercise.starter);
              setResult(null);
            }}
            disabled={running}
          >
            Reset
          </button>
          <button
            className="ctl ghost cx-solution"
            onClick={() => setShowSolution((s) => !s)}
            aria-expanded={showSolution}
          >
            {showSolution ? 'Hide solution' : 'Show solution'}
          </button>
        </div>

        {showSolution && (
          <pre className="cx-solution-code" data-testid="cx-solution">
            {exercise.reference}
          </pre>
        )}

        <section
          className="cx-results"
          data-testid="cx-results"
          aria-live="polite"
          aria-label="Check results"
        >
          {running && <p className="c-console-body muted">Compiling &amp; checking…</p>}

          {!running && result && !result.compiled && (
            <>
              <p className="cx-banner cx-fail" data-testid="cx-status">
                Compile error
              </p>
              <pre className="c-console-body error">{result.diagnostics}</pre>
            </>
          )}

          {!running && result && result.compiled && (
            <>
              <p
                className={`cx-banner ${passed ? 'cx-pass' : 'cx-fail'}`}
                data-testid="cx-status"
              >
                {passed
                  ? `Passed — all ${result.cases.length} case${result.cases.length === 1 ? '' : 's'} ✓`
                  : 'Not passing yet'}
              </p>
              <ul className="cx-caselist">
                {result.cases.map((c, i) => (
                  <li key={i} className={c.passed ? 'ok' : 'bad'}>
                    <span className="cx-case-name">
                      {c.passed ? '✓' : '✗'} {c.name}
                    </span>
                    {!c.passed && (
                      <div className="cx-diff">
                        <div>
                          <span className="cx-diff-label">expected</span>
                          <pre>{c.expected}</pre>
                        </div>
                        <div>
                          <span className="cx-diff-label">got</span>
                          <pre>{c.got || '(no output)'}</pre>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}
