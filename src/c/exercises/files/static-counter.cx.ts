import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'static-counter',
  title: 'static locals: memory between calls',
  module: '15 · Files & Bigger Programs',
  order: 1540,
  difficulty: 'medium',
  mode: 'function',
  prompt: `A normal local variable is born fresh every time a function is called and dies when
the function returns — it has no memory of the past. A \`static\` local is different:
it's created *once* and keeps its value between calls, for the life of the whole
program.

Implement \`int next_id(void)\` using a \`static\` local counter that starts at \`0\`.
Each call should increment it and return the new value, so calling \`next_id()\`
repeatedly yields \`1, 2, 3, 4, ...\`. The harness calls it four times.`,
  starter: `int next_id(void) {
    // use a static local that survives between calls;
    // increment it and return the new value
    return 0;
}
`,
  lesson: {
    intro: `Every ordinary local variable lives on the *stack*: it springs into existence when
its function is entered and vanishes the moment the function returns. Call the
function again and you get a brand-new variable with no memory of last time. That's
usually exactly what you want.

But sometimes a function needs to *remember* something across calls — a running
count, a cache, a "have I been set up yet?" flag. The \`static\` keyword on a local
variable gives it that memory: the variable is created once, keeps its value between
calls, and lives for the entire run of the program.`,
    sections: [
      {
        heading: 'static changes lifetime, not visibility',
        body: `Write \`static int counter = 0;\` inside a function and two special things happen.
First, the initializer \`= 0\` runs **only once**, the first time control reaches it —
not on every call. Second, \`counter\` is not destroyed when the function returns; its
value persists, waiting for the next call.

Crucially, \`counter\` is still *local* in scope — only \`next_id\` can see it by name.
\`static\` here changes the variable's *lifetime* (how long it lives), not its
*visibility* (who can name it). So you get a private, persistent piece of state that
belongs to just this one function.`,
      },
      {
        heading: 'Contrast with a plain local',
        body: `Compare two versions. With a plain local, \`int counter = 0; return ++counter;\`
sets \`counter\` back to \`0\` on *every* call, so it always returns \`1\`. With
\`static int counter = 0; return ++counter;\`, the \`= 0\` happens once and the value
carries forward, so successive calls return \`1, 2, 3, ...\`.

\`++counter\` is *pre-increment*: it adds one to \`counter\` first, then yields the new
value — exactly what you want to return. (\`counter++\` would return the old value and
give you \`0, 1, 2, ...\` instead.)`,
      },
    ],
    workedExample: `#include <stdio.h>

int tick(void) {
    static int calls = 0;   // initialized ONCE, survives between calls
    calls = calls + 1;      // remembers its old value each time
    return calls;
}

int main(void) {
    printf("%d\\n", tick());  // 1
    printf("%d\\n", tick());  // 2  (calls kept its value)
    printf("%d\\n", tick());  // 3
    return 0;
}
// Drop the "static" and every line would print 1 instead.`,
    whyItMatters: `\`static\` locals are the simplest form of persistent state in C: ID generators,
call counters, one-time initialization guards ("lazy init"), and small caches all
lean on them. They're also a stepping stone to understanding *storage duration* —
one of C's core ideas — and a caution sign: because the state hides inside the
function and persists, a \`static\` local makes a function non-reentrant and not
thread-safe, which matters once your programs get concurrent.`,
    commonMistakes: [
      'Leaving off `static`, so the counter resets to `0` every call and always returns `1`.',
      'Thinking `static int counter = 0;` re-runs the `= 0` on each call — it initializes exactly once, the first time only.',
      'Using post-increment `counter++` as the return value, which returns the value *before* incrementing (`0, 1, 2, ...` instead of `1, 2, 3, ...`).',
      'Declaring the counter *outside* the function as a global to fake persistence — it works but leaks the state to the whole file; a `static` local keeps it private.',
    ],
    hint: 'One line of state, one line of work: `static int counter = 0;` then `return ++counter;`. The `static` makes the count survive; `++counter` returns the incremented value.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    return 0;
}`,
  expectedStdout: `1
2
3
4
`,
  reference: `int next_id(void) {
    static int counter = 0;
    return ++counter;
}
`,
};

export default exercise;
