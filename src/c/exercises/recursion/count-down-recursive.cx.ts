import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-down-recursive',
  title: 'Countdown to liftoff',
  module: '4 · Functions & Recursion',
  order: 350,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Write countdown(n), a recursive function that PRINTS a countdown:
n, then n-1, ..., down to 1, each on its own line, and finally the word
"liftoff" on its own line.

This function returns nothing (\`void\`) — it does its work by calling printf
itself, so your code needs \`#include <stdio.h>\` at the top. When n is 0 it just
prints "liftoff" and stops. A hidden harness calls countdown(3) and countdown(1).`,
  starter: `#include <stdio.h>

void countdown(int n) {
    // base case: when n == 0, print "liftoff\\n" and return
    // otherwise: print n on its own line, then call countdown(n - 1)
}
`,
  lesson: {
    intro: `So far every recursive function has *returned* a value and done its real
work while the calls unwound back up. This one is different: it returns \`void\`
(nothing), and it does its work by *printing* — and it prints on the way *down*,
before it recurses.

That ordering is the whole lesson. If you print \`n\` first and *then* call
\`countdown(n - 1)\`, the numbers come out largest-first: 3, 2, 1. The moment you
hit the bottom, you print "liftoff" and the whole thing stops.`,
    sections: [
      {
        heading: 'A void base case',
        body: `Not every function hands back a value. \`void\` means "this function
returns nothing" — it exists purely for its *side effect*, here the printing.
Because there's nothing to return, the base case doesn't compute an answer; it
just does its final action and bails out with a bare \`return;\` (or simply by
reaching the end of its branch).

Our base case is \`n == 0\`: print \`"liftoff\\n"\` and stop. It still plays the
same essential role as always — it's the condition that halts the recursion so
it doesn't run forever.`,
      },
      {
        heading: 'Doing work on the way DOWN',
        body: `Order of operations matters enormously in a recursive function that
has side effects. Put the \`printf("%d\\n", n)\` *before* the recursive call and
each number prints as you descend: 3, then 2, then 1, then the base case's
"liftoff". That's a countdown.

If instead you recursed *first* and printed *after*, the numbers would print as
the stack unwound — giving 1, 2, 3: a count *up*. Same code, one line reordered,
opposite result. When a recursion produces output, always ask: do I act before
or after I recurse?`,
      },
    ],
    workedExample: `// print 1..n going UP — note the print comes AFTER the recursion
void countup(int n) {
    if (n == 0) return;      // nothing to print at the bottom
    countup(n - 1);          // recurse FIRST...
    printf("%d\\n", n);       // ...then print on the way back up
}
// countup(3) prints:  1  2  3   (the reverse of a countdown)`,
    whyItMatters: `Recursion that performs actions rather than computing a return
value is how you walk trees and directories, render nested structures, or emit
output in a specific order. The pre-order (act, then recurse) versus post-order
(recurse, then act) distinction you feel here is exactly the difference between
tree traversals you'll use for the rest of your programming life.`,
    commonMistakes: [
      'Printing after the recursive call instead of before — that counts *up*, not down.',
      'Forgetting the `n == 0` base case, so it recurses past zero into negative numbers forever.',
      'Leaving out `#include <stdio.h>` — your function calls `printf`, so it needs the header.',
      'Trying to `return` a value from a `void` function, or printing "liftoff" for every n instead of only at the bottom.',
    ],
    hint: 'Structure: `if (n == 0) { printf("liftoff\\n"); return; }` then `printf("%d\\n", n);` then `countdown(n - 1);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    countdown(3);
    countdown(1);
    return 0;
}`,
  expectedStdout: `3
2
1
liftoff
1
liftoff
`,
  reference: `#include <stdio.h>

void countdown(int n) {
    if (n == 0) {
        printf("liftoff\\n");
        return;
    }
    printf("%d\\n", n);
    countdown(n - 1);
}
`,
};

export default exercise;
