import { useEffect, useState } from 'react';
import { AppShell } from '../core/AppShell';
import { compiler } from './engine';
import { Sandbox } from './Sandbox';
import { ExerciseView } from './ExerciseView';
import { cExercises, exercisesByModule, getExercise } from './exercises/registry';

type WarmState = 'warming' | 'ready' | 'error';
type Mode = 'exercises' | 'sandbox';

// The /c-programming IDE. Exercise-led ladder + a free sandbox, over a real clang
// toolchain (Wasmer, WASM) that warms in the background on mount.
export function CApp() {
  const [warm, setWarm] = useState<WarmState>('warming');
  const [mode, setMode] = useState<Mode>('exercises');
  const [exerciseId, setExerciseId] = useState<string>(cExercises[0]?.id ?? '');

  useEffect(() => {
    let alive = true;
    compiler
      .warm()
      .then(() => alive && setWarm('ready'))
      .catch(() => alive && setWarm('error'));
    return () => {
      alive = false;
    };
  }, []);

  const selected = getExercise(exerciseId);
  const groups = exercisesByModule();

  return (
    <AppShell
      className="c-mode"
      sidebar={(close) => (
        <>
          <h1 className="brand">
            Algo<span>Harness</span>
          </h1>
          <span className="mode-badge">C PROGRAMMING</span>
          <p className="tagline">Hand-write C. Compile it for real. Watch it run.</p>

          <div className="lang-toggle" data-testid="c-mode-toggle">
            <button
              className={mode === 'exercises' ? 'active' : ''}
              onClick={() => setMode('exercises')}
            >
              Exercises
            </button>
            <button
              className={mode === 'sandbox' ? 'active' : ''}
              onClick={() => setMode('sandbox')}
            >
              Sandbox
            </button>
          </div>

          {mode === 'exercises' && (
            <nav className="cx-ladder" data-testid="c-ladder" aria-label="Exercise ladder">
              {groups.map((g) => (
                <div key={g.module} className="cx-ladder-group">
                  <h3 className="cx-ladder-title">{g.module}</h3>
                  {g.items.map((ex) => (
                    <button
                      key={ex.id}
                      className={`picker-item cx-rung${ex.id === exerciseId ? ' active' : ''}`}
                      onClick={() => {
                        setExerciseId(ex.id);
                        close();
                      }}
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          )}

          <a className="preview-link" href="/">
            ← Back to the learning view
          </a>
          <p className="boundary">
            Your <strong>real</strong> C is compiled and run by <strong>gcc</strong> on a sandboxed
            server (the <a href="https://github.com/engineer-man/piston">Piston</a> service) and the
            output streamed back — so it needs a network connection, and your code is sent to that
            sandbox to run.
          </p>
        </>
      )}
    >
      <div className="c-topline">
        <span
          className={`pill warm warm-${warm}`}
          data-testid="c-warm"
          role="status"
          aria-live="polite"
        >
          {warm === 'warming'
            ? 'compiler: loading…'
            : warm === 'ready'
              ? 'compiler: ready'
              : 'compiler: offline'}
        </span>
      </div>

      {mode === 'sandbox' && <Sandbox />}
      {mode === 'exercises' &&
        (selected ? (
          <ExerciseView key={selected.id} exercise={selected} />
        ) : (
          <p className="c-console-body muted">No exercises found.</p>
        ))}
    </AppShell>
  );
}
