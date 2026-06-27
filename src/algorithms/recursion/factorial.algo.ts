import type { AlgoDescriptor, AlgoInput, AlgoResult, Frame } from '../types';
import { Tracer } from '../tracer';

// Recursion made visible: the call stack.
// Scenario: factorial is the textbook recursion — n! = n × (n-1)!. Each call
// suspends and waits on the call below it, so the language's call stack grows
// as we recurse down and unwinds (multiplying) as each call returns. We mirror
// that hidden machinery as an explicit 'stack' view: one frame per pending call.

function run(input: AlgoInput): AlgoResult {
  const n = input.params?.n ?? 0;
  const t = new Tracer();

  // The live call stack. The LAST element is the top (most recent call).
  const frames: { n: number; status: 'active' | 'returning' | 'done' }[] = [];

  // Render the current stack. The top frame (most recent) is drawn last/highest.
  const view = (): { kind: 'stack'; frames: Frame[] } => ({
    kind: 'stack',
    frames: frames.map((f) => ({
      title: `factorial(${f.n})`,
      detail:
        f.status === 'active'
          ? 'waiting on the call below'
          : f.status === 'returning'
            ? 'returning its value'
            : 'settled',
      status: f.status,
    })),
  });

  const factorial = (k: number): number => {
    // Push a new frame: this call is now active and about to recurse / hit base.
    frames.push({ n: k, status: 'active' });

    if (k <= 1) {
      // Base case: stop recursing. factorial(1) and factorial(0) return 1.
      frames[frames.length - 1].status = 'returning';
      t.step({
        view: view(),
        state: [
          { label: 'computing', value: `factorial(${k})` },
          { label: 'returns', value: 1, highlight: true },
          { label: 'stack depth', value: frames.length },
        ],
        note: `Base case: factorial(${k}) returns 1 without recursing. The stack stops growing and starts to unwind.`,
      });
      const result = 1;
      frames.pop();
      return result;
    }

    // Recursive case: this call must wait for factorial(k-1) before it can finish.
    t.step({
      view: view(),
      state: [
        { label: 'computing', value: `factorial(${k})` },
        { label: 'needs', value: `factorial(${k - 1})`, highlight: true },
        { label: 'stack depth', value: frames.length },
      ],
      note: `factorial(${k}) calls factorial(${k - 1}) and waits — it can't multiply until that value comes back.`,
    });

    const sub = factorial(k - 1);
    const result = k * sub;

    // factorial(k-1) has returned; this frame can now compute and return.
    frames[frames.length - 1].status = 'returning';
    t.step({
      view: view(),
      state: [
        { label: 'computing', value: `factorial(${k})` },
        { label: 'returns', value: result, highlight: true },
        { label: 'stack depth', value: frames.length },
      ],
      note: `factorial(${k}) returns ${k} × ${sub} = ${result}. This frame pops off the stack.`,
    });

    frames.pop();
    return result;
  };

  const answer = factorial(n);

  // Final settled view: the stack is empty, the answer is computed.
  t.step({
    view: { kind: 'stack', frames: [{ title: `factorial(${n}) = ${answer}`, detail: 'stack fully unwound', status: 'done' }] },
    state: [{ label: 'answer', value: answer, highlight: true }],
    note: `Done. The stack has fully unwound and factorial(${n}) = ${answer}.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'recursion-factorial',
  title: 'Factorial & the call stack',
  category: 'Recursion',
  scenario:
    'Recursion solves a problem by deferring to a smaller copy of itself. factorial(n) = n × factorial(n-1): each call suspends and waits on the one below it. That waiting is normally hidden inside the language runtime — here we make the call stack visible, watching it grow on the way down and unwind (multiplying) on the way back up.',
  pattern:
    'Base case + recursive case. The recursive case pushes a frame and waits; frames pile up until the base case stops the descent; then the stack unwinds, each frame multiplying the returned value as it pops. The stack grows to depth n, then collapses.',
  complexity: 'O(n) time · O(n) stack space',
  defaultInput: { params: { n: 5 } },
  expected: 120,
  run,
  code: `function factorial(n) {
  if (n <= 1) return 1;          // base case: stop recursing
  return n * factorial(n - 1);   // recursive case: wait, then multiply
}`,
};

export default descriptor;
