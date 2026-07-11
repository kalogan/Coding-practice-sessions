import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'read-sum',
  title: 'Sum of n numbers',
  module: '9 · Reading Input',
  order: 800,
  difficulty: 'easy',
  mode: 'program',
  prompt: `Now YOU write the whole program — including \`main()\`.

Read an integer \`n\` from standard input. Then read \`n\` more integers. Print their
sum, followed by a newline.

Input:  the first number is the count \`n\`, then \`n\` integers (they may be on the
same line or separate lines — \`scanf("%d", ...)\` skips whitespace either way).
Output: a single integer (the sum) and a newline.`,
  starter: `#include <stdio.h>

int main(void) {
    // read n, then read n ints and sum them, then print the sum
    return 0;
}
`,
  lesson: {
    intro: `Up to now a hidden harness fed your function its inputs. From here on YOU write
the full program: your own \`main()\`, reading the input yourself and printing the
answer yourself. This is what a real C program does.

The two tools for that are \`scanf\` (read from standard input) and \`printf\` (write to
standard output). A program reads bytes from *stdin*, computes, and writes bytes to
*stdout* — that's the whole contract. We feed your program some input; we compare
what it prints against the expected output.`,
    sections: [
      {
        heading: 'scanf reads a value into a variable',
        body: `\`scanf("%d", &n);\` reads one integer from stdin and stores it in \`n\`. Two things
matter. First, the format string \`"%d"\` says "expect an integer". Second — and this
trips up everyone — you pass \`&n\`, the *address* of \`n\`, not \`n\` itself. The \`&\`
means "where n lives in memory", so \`scanf\` knows where to put the value.

\`scanf\` automatically skips leading whitespace (spaces, tabs, newlines) before each
\`%d\`, so it doesn't matter whether the numbers are on one line or many.`,
      },
      {
        heading: 'Read a count, then loop that many times',
        body: `A very common input shape is "a count, then that many values". You read the
count once, then run a loop that reads one value per iteration and folds it into a
running total:

\`for (int i = 0; i < n; i++) { scanf("%d", &x); sum += x; }\`

Start \`sum\` at \`0\` before the loop. Each pass reads the next number into \`x\` and
adds it on. After the loop, \`sum\` holds the total.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);          // how many numbers follow
    int product = 1;          // identity for multiplication
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);      // read the next value
        product *= x;         // fold it in
    }
    printf("%d\\n", product);  // one line of output
    return 0;
}
// This multiplies instead of adds — same reading pattern, different fold.`,
    whyItMatters: `Almost every command-line tool, competitive-programming problem, and data
filter begins by parsing input into variables. "Read a count, loop that many times"
is the single most common input pattern in C, and \`scanf\`/\`printf\` are the
workhorses you'll reach for constantly.`,
    commonMistakes: [
      'Passing `n` instead of `&n` to `scanf`. Without the `&`, `scanf` gets a value, not an address, and can\'t store the result (usually a crash).',
      'Forgetting to initialize `sum` to `0` — an uninitialized variable holds garbage, so the total is wrong.',
      'Looping the wrong number of times (`i <= n` reads one too many). Use `i < n`.',
      'Leaving off the `\\n` in `printf` — the expected output ends with a newline.',
    ],
    hint: 'Declare `int n, sum = 0, x;`. `scanf("%d", &n);` once, then a `for` loop reading `&x` and doing `sum += x;`. Finish with `printf("%d\\n", sum);`.',
  },
  cases: [
    { name: 'three positives', stdin: `3\n1 2 3\n`, expectedStdout: `6\n` },
    { name: 'single value', stdin: `1\n42\n`, expectedStdout: `42\n` },
    { name: 'empty (n is zero)', stdin: `0\n`, expectedStdout: `0\n` },
    { name: 'negatives', stdin: `4\n-1 -2 -3 -4\n`, expectedStdout: `-10\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        sum += x;
    }
    printf("%d\\n", sum);
    return 0;
}
`,
};

export default exercise;
