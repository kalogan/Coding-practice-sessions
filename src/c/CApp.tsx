import { useEffect, useState } from 'react';
import { AppShell } from '../core/AppShell';
import { Editor } from '../playground/Editor';
import { compiler } from './engine';
import type { CompileRunResult } from './engine';
import { Console } from './Console';

type WarmState = 'warming' | 'ready' | 'error';

const SANDBOX_STARTER = `#include <stdio.h>

int main(void) {
    // Write C, hit Run — this really compiles with clang and runs in your browser.
    printf("hello from C\\n");

    // A little matrix math to start:
    double A[2][2] = {{1, 2}, {3, 4}};
    double B[2][2] = {{5, 6}, {7, 8}};
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            double s = 0;
            for (int k = 0; k < 2; k++) s += A[i][k] * B[k][j];
            printf("%g ", s);
        }
        printf("\\n");
    }
    return 0;
}
`;

// The /c-programming IDE. This layer is the free SANDBOX: write C, hit Run, see
// stdout + real compiler errors. The toolchain warms in the background on mount
// (first load streams ~30MB of clang, like Pyodide; compiles are ~1s after).
export function CApp() {
  const [code, setCode] = useState(SANDBOX_STARTER);
  const [warm, setWarm] = useState<WarmState>('warming');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompileRunResult | null>(null);

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

  async function run() {
    setRunning(true);
    setResult(null);
    const r = await compiler.compileAndRun(code);
    setResult(r);
    setRunning(false);
  }

  return (
    <AppShell
      className="c-mode"
      sidebar={() => (
        <>
          <h1 className="brand">
            Algo<span>Harness</span>
          </h1>
          <span className="mode-badge">C — SANDBOX</span>
          <p className="tagline">Hand-write C. Compile it for real. Watch it run.</p>
          <a className="preview-link" href="/">
            ← Back to the learning view
          </a>
          <p className="boundary">
            Your <strong>real</strong> C is compiled by <strong>clang</strong> (via the Wasmer SDK,
            WebAssembly) entirely <strong>in your browser</strong> — your code never leaves the
            device. The first compile streams the toolchain (~30&nbsp;MB, like the Python
            playground); after that it&apos;s about a second.
          </p>
        </>
      )}
    >
      <header className="algo-header">
        <div className="algo-meta">
          <span className="pill">C Programming</span>
          <span className="pill ghost">clang · WASM</span>
          <span
            className={`pill warm warm-${warm}`}
            data-testid="c-warm"
            role="status"
            aria-live="polite"
          >
            {warm === 'warming' ? 'compiler: loading…' : warm === 'ready' ? 'compiler: ready' : 'compiler: offline'}
          </span>
        </div>
        <h2>Sandbox</h2>
        <p className="scenario">
          Write any C program, set nothing up, hit <strong>Run</strong>. Compiler errors show in the
          console just like a real toolchain.
        </p>
      </header>

      <div className="c-ide">
        <div className="c-editor-wrap">
          <Editor value={code} onChange={setCode} language="c" />
        </div>
        <div className="c-actions">
          <button className="ctl play c-run" onClick={run} disabled={running} data-testid="c-run">
            {running ? 'Compiling…' : '▶ Compile & Run'}
          </button>
        </div>
        <Console result={result} running={running} />
      </div>
    </AppShell>
  );
}
