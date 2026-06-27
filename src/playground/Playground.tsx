import { useState } from 'react';
import { Player } from '../core/Player';
import { Editor } from './Editor';
import { runJs } from './runJs';
import { runPython } from './runPython';
import type { RunOutcome } from './runJs';
import { JS_TEMPLATE, PY_TEMPLATE, DEFAULT_INPUT } from './templates';
import type { AlgoResult } from '../algorithms/types';

type Lang = 'js' | 'python';

// The write-and-run entry (/playground). Reuses the SAME Player as the built-in
// algorithms — only the source of the trace changes: the user's real code,
// executed in a worker (JS) or via Pyodide (Python).
export function Playground() {
  const [lang, setLang] = useState<Lang>('js');
  const [code, setCode] = useState(JS_TEMPLATE);
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [result, setResult] = useState<AlgoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function switchLang(next: Lang) {
    if (next === lang) return;
    setLang(next);
    setCode(next === 'js' ? JS_TEMPLATE : PY_TEMPLATE);
    setResult(null);
    setError(null);
  }

  async function handleRun() {
    setRunning(true);
    setError(null);
    let input: unknown;
    try {
      input = JSON.parse(inputText);
    } catch (e) {
      setError(`Input is not valid JSON: ${(e as Error).message}`);
      setRunning(false);
      return;
    }
    const runner = lang === 'js' ? runJs : runPython;
    const outcome: RunOutcome = await runner(code, input);
    if (outcome.ok) {
      if (outcome.result.steps.length === 0) {
        setError('Your code ran but emitted no steps — call trace.step(...) inside your loop.');
        setResult(null);
      } else {
        setResult(outcome.result);
      }
    } else {
      setError(outcome.error);
      setResult(null);
    }
    setRunning(false);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">
          Algo<span>Harness</span>
        </h1>
        <span className="mode-badge">PLAYGROUND</span>
        <p className="tagline">Write your own code. Watch it run.</p>
        <div className="lang-toggle" data-testid="lang-toggle">
          <button className={lang === 'js' ? 'active' : ''} onClick={() => switchLang('js')}>
            JavaScript
          </button>
          <button className={lang === 'python' ? 'active' : ''} onClick={() => switchLang('python')}>
            Python
          </button>
        </div>
        <a className="preview-link" href="/">
          ← Back to the learning view
        </a>
        <p className="boundary">
          Your <strong>real</strong> code runs{' '}
          {lang === 'js'
            ? 'in a sandboxed Web Worker with a timeout'
            : 'via Pyodide — CPython compiled to WebAssembly, loaded from a CDN on first run (~10MB)'}
          . The animation IS its execution.
        </p>
      </aside>

      <main className="stage">
        <header className="algo-header">
          <div className="algo-meta">
            <span className="pill">Playground</span>
            <span className="pill ghost">{lang === 'js' ? 'JavaScript' : 'Python'}</span>
          </div>
          <h2>Write &amp; run your own</h2>
          <p className="scenario">
            Edit the <code>run(input, trace)</code> function, set the input, and hit Run. Call{' '}
            <code>trace.step(...)</code> wherever you want a frame.
          </p>
        </header>

        <div className="pg-io">
          <Editor value={code} onChange={setCode} language={lang} />
          <div className="pg-input">
            <label className="pg-label">input (JSON)</label>
            <textarea
              className="pg-input-area"
              spellCheck={false}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              data-testid="input-editor"
            />
            <button
              className="ctl play pg-run"
              onClick={handleRun}
              disabled={running}
              data-testid="run"
            >
              {running ? 'Running…' : '▶ Run'}
            </button>
          </div>
        </div>

        {error && (
          <div className="pg-error" data-testid="run-error">
            {error}
          </div>
        )}

        {result && <Player result={result} code={code} />}
      </main>
    </div>
  );
}
