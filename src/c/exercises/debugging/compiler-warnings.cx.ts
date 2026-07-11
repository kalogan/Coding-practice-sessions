import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'reading-compiler-warnings',
  title: 'Listen to the compiler (-Wall)',
  module: '21 · Tooling & Debugging',
  order: 2100,
  difficulty: 'easy',
  mode: 'function',
  prompt: `The starter has a classic bug that the compiler will warn you about the instant you
turn warnings on — but it compiles and runs, silently wrong. is_zero(n) should return 1
when n is zero and 0 otherwise. It doesn't. Find and fix the bug.

(Hint for the lesson: build with -Wall -Wextra and read what it says.)`,
  starter: `int is_zero(int n) {
    if (n = 0) return 1;   // compiles, runs, always wrong
    return 0;
}
`,
  lesson: {
    intro: `C will happily compile code that is obviously broken — unless you ask it not to.
The starter uses \`=\` (assignment) where it means \`==\` (comparison): \`if (n = 0)\` *assigns*
0 to \`n\` and then tests that 0, which is always false. So \`is_zero\` always returns 0. The
program runs; it's just wrong.

The fix is one character (\`=\` → \`==\`). The real lesson is *how you'd catch it*: turn on
compiler warnings and treat them as the free code review they are.`,
    sections: [
      {
        heading: 'The three flags to always use',
        body: `Compile with \`gcc -Wall -Wextra -Werror\`:
\`-Wall\` turns on the common, high-value warnings; \`-Wextra\` adds more; \`-Werror\` makes
every warning a hard error so you *can't* ignore it. For this bug, \`-Wall\` prints:
\`warning: suggest parentheses around assignment used as truth value\` — the compiler is
telling you "you wrote \`=\` inside an \`if\`; did you mean \`==\`?".`,
      },
      {
        heading: 'Warnings are not optional',
        body: `A clean build with \`-Wall -Wextra\` catches a huge fraction of beginner bugs
before you ever run the program: unused variables, uninitialized reads, mismatched
\`printf\` format specifiers, functions that fall off the end without returning. Professional
C projects build with \`-Werror\` so a warning breaks the build. The habit "zero warnings,
always" is one of the cheapest quality wins in C.`,
      },
    ],
    workedExample: `// what the compiler says about the bug:
$ gcc -Wall -Wextra bug.c
bug.c: In function 'is_zero':
bug.c:2: warning: suggest parentheses around assignment used as truth value
//                          ^ the giveaway: you wrote = but meant ==

if (n == 0) return 1;   // the fix`,
    whyItMatters: `"It compiled" is not "it's correct." The compiler already did a deep analysis
of your code — warnings are it handing you the bugs it found for free. Ignoring them is
throwing away your best, fastest debugging tool. Turning on \`-Wall -Wextra -Werror\` on day
one saves hours of chasing bugs a warning would have named instantly.`,
    commonMistakes: [
      'Using `=` (assign) instead of `==` (compare) inside an `if`/`while` — the #1 bug `-Wall` catches.',
      'Compiling without any warning flags and assuming a clean compile means correct code.',
      'Silencing a warning by casting or tweaking syntax instead of fixing the underlying bug it points to.',
      'Ignoring "control reaches end of non-void function" — a function that sometimes returns nothing.',
    ],
    hint: 'Change `if (n = 0)` to `if (n == 0)`. `=` assigns; `==` compares.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", is_zero(0));
    printf("%d\\n", is_zero(5));
    printf("%d\\n", is_zero(-3));
    return 0;
}`,
  expectedStdout: `1
0
0
`,
  reference: `int is_zero(int n) {
    if (n == 0) return 1;
    return 0;
}
`,
};

export default exercise;
