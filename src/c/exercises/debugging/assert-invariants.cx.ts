import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'assert-invariants',
  title: 'assert() — crash early, crash loud',
  module: '21 · Tooling & Debugging',
  order: 2140,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement average(a, n): return the integer average (sum / n) of the array. Because
dividing by zero is undefined, this function has a precondition: n must be greater than 0.
State that assumption with an assert, then compute the average.

  #include <assert.h>
  assert(n > 0);   // documents AND checks the invariant

The harness only calls it with valid input, so the assert always passes.`,
  starter: `#include <assert.h>

int average(const int* a, int n) {
    // assert the precondition n > 0, then return sum / n
    return 0;
}
`,
  lesson: {
    intro: `An **assertion** is a claim you believe is always true at a certain point in the
program. \`assert(n > 0);\` says "n had better be positive here." If it is, the assert does
nothing. If it isn't, the program stops *immediately* at that exact line and prints
something like \`Assertion 'n > 0' failed\`. That's the point: a bug is caught at its
*source*, loudly, instead of causing weird behavior three functions later.

Here the precondition is \`n > 0\` (you can't average zero elements). Assert it, then return
\`sum / n\`.`,
    sections: [
      {
        heading: 'Assertions document and check at once',
        body: `\`assert(condition)\` (from \`<assert.h>\`) is executable documentation. A reader
sees \`assert(n > 0)\` and instantly knows the function requires a non-empty array — and the
computer *enforces* it while you develop. Use assertions for things that should be
impossible if your code is correct: preconditions, invariants, "this pointer can't be NULL
here," "this index is in range." When one fires, it names the exact false claim and the
line — often the fastest possible bug report.`,
      },
      {
        heading: 'Asserts vs. real error handling',
        body: `Assertions are for *programmer* mistakes (bugs), not for expected runtime
failures. Bad *user* input, a missing file, a failed \`malloc\` — those are normal
possibilities you handle with \`if\` checks and error returns, not asserts. A handy rule:
assert things that should never happen; handle things that might. Also note assertions are
compiled out when you define \`NDEBUG\` (\`gcc -DNDEBUG\`) for release builds, so never put
code with side effects *inside* an assert.`,
      },
    ],
    workedExample: `#include <assert.h>
int first(const int* a, int n) {
    assert(a != NULL);   // precondition: caller must pass a real array
    assert(n > 0);       // precondition: must be non-empty
    return a[0];
}
// if someone calls first(NULL, 0), it stops right here:
//   a.out: prog.c:3: first: Assertion 'a != NULL' failed.  (Aborted)`,
    whyItMatters: `Assertions turn silent, far-away corruption into an immediate, precise stop
at the moment an assumption breaks — which is exactly when debugging is easiest. Sprinkling
asserts on your preconditions and invariants is a cheap, powerful habit: they cost nothing
in release builds, they document your assumptions for the next reader, and they catch bugs
the instant they happen instead of letting them propagate.`,
    commonMistakes: [
      'Using `assert` to validate *user* input or handle expected failures — those need real `if`/error-return handling.',
      'Putting code with side effects inside an assert, e.g. `assert(x = compute());` — it vanishes under `-DNDEBUG`.',
      'Forgetting `#include <assert.h>`.',
      'Writing `assert(n = 0)` instead of a comparison — the same `=` vs `==` trap, and it would assign then assert 0.',
    ],
    hint: 'Add `assert(n > 0);` first (you already include `<assert.h>`), then `int s = 0; for (...) s += a[i]; return s / n;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {2, 4, 6};
    printf("%d\\n", average(a, 3));
    int b[] = {10, 20};
    printf("%d\\n", average(b, 2));
    int c[] = {5};
    printf("%d\\n", average(c, 1));
    return 0;
}`,
  expectedStdout: `4
15
5
`,
  reference: `#include <assert.h>

int average(const int* a, int n) {
    assert(n > 0);
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s / n;
}
`,
};

export default exercise;
