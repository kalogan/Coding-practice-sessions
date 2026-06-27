import type { AlgoResult } from '../algorithms/types';
import type { RunOutcome } from './runJs';

// Real Python via Pyodide (CPython compiled to WebAssembly), loaded lazily from
// the CDN on first use (~10MB). The Python code builds the trace as plain dicts;
// we serialize with json.dumps and JSON.parse it back, so nothing depends on
// fragile Python<->JS proxy objects.

const PYODIDE_VERSION = 'v0.26.2';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Pyodide from the CDN (offline?).'));
    document.head.appendChild(s);
  });
}

function getPyodide(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript(`${PYODIDE_URL}pyodide.js`);
      const loadPyodide = (window as any).loadPyodide as (opts: { indexURL: string }) => Promise<any>;
      return loadPyodide({ indexURL: PYODIDE_URL });
    })();
  }
  return pyodidePromise;
}

const PREAMBLE = `
class Tracer:
    def __init__(self):
        self.steps = []
    def step(self, s):
        if len(self.steps) > 5000:
            raise RuntimeError("Too many steps (> 5000). Is your loop terminating?")
        self.steps.append(s)
`;

export async function runPython(code: string, input: unknown): Promise<RunOutcome> {
  try {
    const py = await getPyodide();
    py.globals.set('__INPUT_JSON__', JSON.stringify(input));
    const program = `${PREAMBLE}
${code}

import json as _json
__input = _json.loads(__INPUT_JSON__)
if not callable(globals().get("run")):
    raise RuntimeError("Define a function named run(input, trace).")
__t = Tracer()
__answer = run(__input, __t)
_json.dumps({"steps": __t.steps, "answer": __answer})
`;
    const out: string = await py.runPythonAsync(program);
    const parsed = JSON.parse(out) as AlgoResult;
    return { ok: true, result: parsed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
