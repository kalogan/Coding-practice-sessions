import { useState } from 'react';
import { Editor } from '../playground/Editor';
import { compiler } from './engine';
import type { CompileRunResult } from './engine';
import { Console } from './Console';

const STARTER = `#include <stdio.h>

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

// The free sandbox: write any C, compile & run, see stdout + real diagnostics.
export function Sandbox() {
  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompileRunResult | null>(null);

  async function run() {
    setRunning(true);
    setResult(null);
    const r = await compiler.compileAndRun(code);
    setResult(r);
    setRunning(false);
  }

  return (
    <>
      <header className="algo-header">
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
    </>
  );
}
