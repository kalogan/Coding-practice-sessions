// Sandboxed JS executor. The user's run(input, trace) runs HERE, in a Web
// Worker, so an infinite loop or crash never freezes the UI — the main thread
// terminates this worker on timeout. Steps are plain objects, so they post back
// across the worker boundary as structured-clone data.

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (m: unknown) => void;
};

const MAX_STEPS = 5000;

ctx.onmessage = (e: MessageEvent) => {
  const { code, input } = e.data as { code: string; input: unknown };
  const steps: unknown[] = [];
  const trace = {
    step(s: unknown) {
      if (steps.length >= MAX_STEPS) {
        throw new Error(`Too many steps (> ${MAX_STEPS}). Is your loop terminating?`);
      }
      steps.push(s);
    },
  };
  try {
    const factory = new Function(
      'input',
      'trace',
      `"use strict";\n${code}\n;\nif (typeof run !== 'function') throw new Error('Define a function named run(input, trace).');\nreturn run(input, trace);`,
    );
    const answer = factory(input, trace);
    ctx.postMessage({ ok: true, steps, answer });
  } catch (err) {
    ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
