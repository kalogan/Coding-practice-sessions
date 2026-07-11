import { useEffect, useState } from 'react';
import { AppShell } from '../core/AppShell';
import { compiler } from './engine';
import { Sandbox } from './Sandbox';
import { ExerciseView } from './ExerciseView';
import { cExercises, exercisesByModule, getExercise } from './exercises/registry';
import type { CExercise } from './exercises/types';
import { loadCompleted, saveCompleted, toggleId } from './progress';

type WarmState = 'warming' | 'ready' | 'error';
type Mode = 'exercises' | 'sandbox';

// The learner's current spot: the first session they haven't marked done.
function firstUnfinished(done: Set<string>): CExercise | undefined {
  return cExercises.find((e) => !done.has(e.id)) ?? cExercises[0];
}

// The /c-programming IDE. Exercise-led ladder + a free sandbox, over real gcc
// (hosted via Wandbox) that warms in the background on mount.
export function CApp() {
  const [warm, setWarm] = useState<WarmState>('warming');
  const [mode, setMode] = useState<Mode>('exercises');
  // Which sessions the learner has marked done — persisted to localStorage.
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());
  // Resume where they left off, and open ONLY that session's module (the rail is
  // massive with all 22 modules expanded).
  const [exerciseId, setExerciseId] = useState<string>(() => firstUnfinished(completed)?.id ?? '');
  const [openModule, setOpenModule] = useState<string>(
    () => getExercise(exerciseId)?.module ?? '',
  );

  function toggleDone(id: string) {
    setCompleted((prev) => {
      const next = toggleId(prev, id);
      saveCompleted(next);
      return next;
    });
  }

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
            <>
              <p className="cx-progress" data-testid="c-progress">
                <span className="cx-progress-count">
                  {completed.size} / {cExercises.length}
                </span>{' '}
                sessions done
              </p>
              <nav className="cx-ladder" data-testid="c-ladder" aria-label="Exercise ladder">
                {groups.map((g) => {
                  const open = openModule === g.module;
                  const doneCount = g.items.filter((i) => completed.has(i.id)).length;
                  return (
                    <div key={g.module} className={`cx-ladder-group${open ? ' open' : ''}`}>
                      <button
                        type="button"
                        className="cx-ladder-title"
                        aria-expanded={open}
                        onClick={() => setOpenModule(open ? '' : g.module)}
                      >
                        <span className="cx-caret" aria-hidden="true">
                          {open ? '▾' : '▸'}
                        </span>
                        <span className="cx-ladder-name">{g.module}</span>
                        <span className="cx-ladder-count">
                          {doneCount}/{g.items.length}
                        </span>
                      </button>
                      {open && (
                        <div className="cx-ladder-items">
                          {g.items.map((ex) => {
                            const isDone = completed.has(ex.id);
                            return (
                              <button
                                key={ex.id}
                                className={`picker-item cx-rung${ex.id === exerciseId ? ' active' : ''}${isDone ? ' done' : ''}`}
                                onClick={() => {
                                  setExerciseId(ex.id);
                                  close();
                                }}
                              >
                                <span className="cx-rung-check" aria-hidden="true">
                                  {isDone ? '✓' : ''}
                                </span>
                                <span className="cx-rung-title">{ex.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </>
          )}

          <a className="preview-link" href="/">
            ← Back to the learning view
          </a>
          <p className="boundary">
            Your <strong>real</strong> C is compiled and run by <strong>gcc</strong> on a sandboxed
            server (the <a href="https://wandbox.org">Wandbox</a> service) and the output streamed
            back — so it needs a network connection, and your code is sent to that sandbox to run.
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
          <ExerciseView
            key={selected.id}
            exercise={selected}
            done={completed.has(selected.id)}
            onToggleDone={() => toggleDone(selected.id)}
          />
        ) : (
          <p className="c-console-body muted">No exercises found.</p>
        ))}
    </AppShell>
  );
}
