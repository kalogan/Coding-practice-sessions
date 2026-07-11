import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'define-constant',
  title: 'Name a constant with #define',
  module: '14 · The Preprocessor & Declarations',
  order: 1400,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Give the number 3600 a name, then use it.

Write a preprocessor line \`#define SECONDS_PER_HOUR 3600\`, and a function
\`long to_seconds(int hours)\` that returns \`hours * SECONDS_PER_HOUR\`.

A hidden harness calls your function and prints the results.`,
  starter: `#define SECONDS_PER_HOUR 0   // TODO: give it the right value

long to_seconds(int hours) {
    // return the number of seconds in that many hours
    return 0;
}
`,
  lesson: {
    intro: `Before your C code is ever compiled, a separate step runs over it first: the
*preprocessor*. It doesn't understand C — it just edits text. The most common
thing you ask it to do is \`#define\` a name for a value.

Write \`#define SECONDS_PER_HOUR 3600\` at the top of the file. Now, everywhere the
word \`SECONDS_PER_HOUR\` appears later, the preprocessor literally swaps in the
text \`3600\` before the compiler sees anything. The compiler never knows the name
existed — it only ever sees \`3600\`.`,
    sections: [
      {
        heading: 'It is text substitution, not a variable',
        body: `A \`#define\` is NOT a variable. There is no memory, no type, no \`=\`, and no
semicolon at the end. The form is exactly \`#define NAME replacement\` — three
parts separated by spaces. If you write \`#define SECONDS_PER_HOUR 3600;\` (with a
stray \`;\`), the preprocessor will paste the semicolon in too, and
\`hours * SECONDS_PER_HOUR\` becomes \`hours * 3600;\` — usually a compile error. So:
no trailing semicolon on a \`#define\`.

By convention these names are written in \`ALL_CAPS\` so a reader instantly knows
"this is a compile-time constant, not a normal variable."`,
      },
      {
        heading: 'Named constants beat magic numbers',
        body: `A bare \`3600\` sitting in the middle of an expression is called a *magic
number* — the reader has to guess what it means. \`SECONDS_PER_HOUR\` says it out
loud. And if the meaning ever changes, you edit one \`#define\` instead of hunting
down every \`3600\` in the file (some of which might be a different 3600!).

Note the return type here is \`long\`. Seconds add up fast, and a \`long\` holds
bigger numbers than an \`int\` safely. We print it with \`%ld\` (the \`l\` means
"long").`,
      },
    ],
    workedExample: `// name a constant, then use it by name
#define MINUTES_PER_DAY 1440

long to_minutes(int days) {
    return days * MINUTES_PER_DAY;   // preprocessor makes this days * 1440
}
// to_minutes(2)  ->  2880`,
    whyItMatters: `Real codebases are full of \`#define\`d constants — buffer sizes, limits,
version numbers, feature flags. Naming a value once, at the top, and referring to
it everywhere by name is one of the first habits that separates readable C from a
minefield of magic numbers.`,
    commonMistakes: [
      'Putting a `;` at the end of the `#define` line. There is no semicolon — it would get pasted into your code.',
      'Writing `#define SECONDS_PER_HOUR = 3600`. There is no `=` in a `#define`; the value is just separated by a space.',
      'Declaring the function as `int` instead of `long`, or printing with `%d` instead of `%ld`.',
      'Forgetting the `#` — it is `#define`, a preprocessor directive, and the `#` must be there.',
    ],
    hint: 'Two pieces: the line `#define SECONDS_PER_HOUR 3600` (no `=`, no `;`), and a body that is just `return hours * SECONDS_PER_HOUR;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", to_seconds(1));
    printf("%ld\\n", to_seconds(24));
    printf("%ld\\n", to_seconds(0));
    return 0;
}`,
  expectedStdout: `3600
86400
0
`,
  reference: `#define SECONDS_PER_HOUR 3600

long to_seconds(int hours) {
    return hours * SECONDS_PER_HOUR;
}
`,
};

export default exercise;
