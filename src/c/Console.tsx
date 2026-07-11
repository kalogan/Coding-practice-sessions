import type { CompileRunResult } from './engine';

interface Props {
  result: CompileRunResult | null;
  running: boolean;
}

// The output panel below the editor. Compiler errors (compile failed) render in
// the error tone; a clean run shows stdout + a small meta line. aria-live so a
// screen reader announces the result when a run finishes.
export function Console({ result, running }: Props) {
  return (
    <section className="c-console" data-testid="c-console" aria-live="polite" aria-label="Program output">
      <div className="c-console-bar">
        <span className="c-console-title">Console</span>
        {result && (
          <span className="c-console-meta" data-testid="c-console-meta">
            {result.compiled
              ? `exit ${result.exitCode} · ${result.ms}ms`
              : `compile failed · ${result.ms}ms`}
          </span>
        )}
      </div>

      {running && <pre className="c-console-body muted">Compiling &amp; running…</pre>}

      {!running && !result && (
        <pre className="c-console-body muted">Hit “Compile &amp; Run” to see output here.</pre>
      )}

      {!running && result && !result.compiled && (
        <pre className="c-console-body error" data-testid="c-diagnostics">
          {result.diagnostics}
        </pre>
      )}

      {!running && result && result.compiled && (
        <pre className="c-console-body" data-testid="c-stdout">
          {result.stdout || '(no output)'}
          {result.stderr ? `\n\n[stderr]\n${result.stderr}` : ''}
          {result.diagnostics ? `\n\n[warnings]\n${result.diagnostics}` : ''}
        </pre>
      )}
    </section>
  );
}
