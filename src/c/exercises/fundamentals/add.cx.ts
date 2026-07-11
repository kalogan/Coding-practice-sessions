import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'add-two-ints',
  title: 'Add two integers',
  module: '1 · Values & Operators',
  order: 10,
  difficulty: 'intro',
  mode: 'function',
  prompt: `Warm-up. Implement add(a, b) so it returns the sum of the two integers.

You only write the function — a hidden harness calls it and checks the result.
This is the shape every "function" exercise takes: fill in the body, hit Check.`,
  starter: `int add(int a, int b) {
    // return the sum of a and b
    return 0;
}
`,
  lesson: {
    intro: `Welcome to C. Before anything moves, you need a *function* — a named block of
code that takes some inputs, does work, and hands back a result.

Look at the first line: \`int add(int a, int b)\`. Read it right-to-left in plain
English: "a function called \`add\` that takes two \`int\`s named \`a\` and \`b\`, and
gives back an \`int\`." That word before the name (\`int\`) is the *return type* — the
kind of value that comes back out.`,
    sections: [
      {
        heading: 'Types are the whole game in C',
        body: `Every value in C has a type, declared up front. \`int\` is a whole number
(no decimal point) — like -3, 0, or 42. You'll meet \`double\` (numbers with
decimals) and \`char\` (a single character) soon. C is strict about this: you say
exactly what kind of thing each value is, and the compiler holds you to it.`,
      },
      {
        heading: 'return hands a value back',
        body: `Inside the braces \`{ }\` is the function body. The \`return\` keyword sends a
value back to whoever called the function — and immediately ends the function.
\`return a + b;\` computes \`a + b\` and hands that number back. The starter returns
\`0\` as a placeholder; your job is to return the real sum.`,
      },
    ],
    workedExample: `// a function that doubles a number
int twice(int n) {
    return n + n;   // or n * 2
}
// calling it:  twice(5)  ->  10`,
    whyItMatters: `Functions are how every real program is built — you write small,
named, reusable pieces and combine them. \`main\` (which you'll see in a moment) is
itself just a function: the one the program starts from. Master "inputs → work →
return" and the rest of C is variations on it.`,
    commonMistakes: [
      'Forgetting the semicolon `;` at the end of the `return` line. In C, almost every statement ends in `;`.',
      'Writing `return a + b` without actually giving `a + b` back — e.g. leaving the placeholder `return 0;` in place.',
      'Confusing the parameter *types* — both inputs here are `int`, and the result is an `int`.',
    ],
    hint: 'The body should be a single line: `return a + b;`. That\'s it — you have both numbers, add them, hand the result back.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", add(2, 3));
    printf("%d\\n", add(-4, 10));
    printf("%d\\n", add(0, 0));
    return 0;
}`,
  expectedStdout: `5
6
0
`,
  reference: `int add(int a, int b) {
    return a + b;
}
`,
};

export default exercise;
