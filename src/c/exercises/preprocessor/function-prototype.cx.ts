import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'function-prototype',
  title: 'Declaration vs definition: the prototype',
  module: '14 · The Preprocessor & Declarations',
  order: 1440,
  difficulty: 'medium',
  mode: 'program',
  prompt: `Write a complete program. It reads one integer from stdin and prints three
times that integer, on its own line.

The twist: your \`main\` must call a helper \`triple\` that you DEFINE *below* main.
Because C reads top to bottom, you must DECLARE \`triple\` with a prototype above
main first. Structure:

  #include <stdio.h>

  int triple(int);      // prototype (declaration)

  int main(void) { ... read n, print triple(n) ... }

  int triple(int n) { return n * 3; }   // definition, below main`,
  starter: `#include <stdio.h>

// TODO: declare the triple prototype here

int main(void) {
    int n;
    // read n, then print triple(n) followed by a newline
    return 0;
}

// TODO: define triple here (below main)
`,
  lesson: {
    intro: `C reads a source file strictly top to bottom. When the compiler reaches a
call like \`triple(n)\` inside \`main\`, it needs to already know what \`triple\` is —
its return type and what arguments it takes. If \`triple\`'s full body appears
*after* \`main\`, the compiler hasn't seen it yet and complains.

The fix is a *prototype*: a one-line \`int triple(int);\` placed above \`main\`. It
tells the compiler "a function named \`triple\` exists; it takes an \`int\` and
returns an \`int\` — trust me, the body comes later." That promise is enough for the
compiler to check every call. This is exactly what a \`.h\` header file is full of.`,
    sections: [
      {
        heading: 'Declaration vs definition',
        body: `A *declaration* announces a name and its shape without providing the
body: \`int triple(int);\`. Note the semicolon and that the parameter can be
nameless — only the *type* matters here. You may declare a function many times.

A *definition* is the real thing, with a body: \`int triple(int n) { return n * 3; }\`.
It says name, shape, AND what it does — and there must be exactly one of it. Every
definition is also a declaration, but a declaration by itself reserves the name so
callers above can use it before the body appears.`,
      },
      {
        heading: 'This is what headers are',
        body: `When you \`#include <stdio.h>\`, you're pasting in a file full of
prototypes — declarations for \`printf\`, \`scanf\`, and friends. Their *definitions*
live compiled inside the C library, elsewhere entirely. The header is just the
promise; the library provides the body. You're doing the same thing by hand here:
prototype up top, definition down below.

To read the integer, use \`scanf("%d", &n)\` — the \`&\` gives \`scanf\` the address of
\`n\` so it can store the value there. Then \`printf("%d\\n", triple(n))\` prints the
tripled value and a newline.`,
      },
    ],
    workedExample: `#include <stdio.h>

int negate(int);              // declaration (prototype) — body promised below

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%d\\n", negate(n));
    return 0;
}

int negate(int n) {           // definition — the actual body
    return -n;
}`,
    whyItMatters: `Splitting a promise (the declaration in a \`.h\`) from the body (the
definition in a \`.c\`) is how every non-trivial C program is organized. It lets
files call each other's functions without copying code, and it's the foundation of
how C projects compile in separate pieces and link together. The prototype you
write here is the atom of that whole system.`,
    commonMistakes: [
      'Omitting the prototype and defining `triple` below `main` — the compiler hits the call before it knows the function.',
      'Forgetting the `;` on the prototype, or accidentally giving it a `{ }` body up top (that would be a duplicate definition).',
      'Using `scanf("%d", n)` without the `&` — scanf needs the address `&n` to store into.',
      'Printing without the newline, or printing extra text — the output must be exactly the number and a `\\n`.',
    ],
    hint: 'Line above main: `int triple(int);` (with semicolon). In main: `scanf("%d", &n); printf("%d\\n", triple(n));`. Below main: `int triple(int n) { return n * 3; }`.',
  },
  cases: [
    { name: 'positive', stdin: `4\n`, expectedStdout: `12\n` },
    { name: 'zero', stdin: `0\n`, expectedStdout: `0\n` },
    { name: 'negative', stdin: `-5\n`, expectedStdout: `-15\n` },
  ],
  reference: `#include <stdio.h>

int triple(int);

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%d\\n", triple(n));
    return 0;
}

int triple(int n) {
    return n * 3;
}
`,
};

export default exercise;
