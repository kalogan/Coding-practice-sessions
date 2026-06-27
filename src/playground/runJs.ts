import type { AlgoResult } from '../algorithms/types';

export type RunOutcome = { ok: true; result: AlgoResult } | { ok: false; error: string };

const TIMEOUT_MS = 3000;

// Run user JS in a fresh worker, with a hard timeout. A hung loop never blocks
// the page — we just terminate the worker and report it.
export function runJs(code: string, input: unknown): Promise<RunOutcome> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
    let settled = false;
    const finish = (o: RunOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(o);
    };
    const timer = setTimeout(
      () => finish({ ok: false, error: `Timed out after ${TIMEOUT_MS}ms — an infinite loop?` }),
      TIMEOUT_MS,
    );
    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as { ok: boolean; steps?: AlgoResult['steps']; answer?: AlgoResult['answer']; error?: string };
      if (d.ok) finish({ ok: true, result: { steps: d.steps ?? [], answer: d.answer ?? '' } });
      else finish({ ok: false, error: d.error ?? 'Unknown error' });
    };
    worker.onerror = (e) => finish({ ok: false, error: e.message || 'Worker error' });
    worker.postMessage({ code, input });
  });
}
