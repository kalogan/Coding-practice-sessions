import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'map-array',
  title: 'Transform an array with a callback',
  module: '16 · Pointers, Level 2',
  order: 1610,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement map_array(a, n, f): walk the first n elements of the int array a and
replace each one *in place* with f applied to it — that is, set a[i] = f(a[i]).

\`f\` is a function pointer of type \`int (*)(int)\`: it takes one int and returns one
int. The harness supplies concrete functions (squaring, doubling) and prints the
array afterward, so your job is only to rewrite each slot.`,
  starter: `void map_array(int* a, int n, int (*f)(int)) {
    // replace each a[i] with f(a[i])
}
`,
  lesson: {
    intro: `You already know how to walk an array with a for loop. The new idea here is
that *what to do* at each element is not baked in — it arrives as a function pointer.

\`map_array\` doesn't know or care whether \`f\` squares, doubles, or negates. It loops
over the elements and, for each one, calls \`f\` and stores the result back:
\`a[i] = f(a[i])\`. This is the classic *map* (a.k.a. transform) operation: apply the
same operation to every element.`,
    sections: [
      {
        heading: 'In place means overwrite the original',
        body: `The array is passed as \`int* a\` — a pointer to the caller's real array,
not a copy. Writing \`a[i] = ...\` changes the caller's data directly. When
\`map_array\` returns, the array the caller handed in has been transformed; there is no
new array to return, which is why the return type is \`void\`.

Read \`a[i] = f(a[i])\` right-to-left: take the current element \`a[i]\`, pass it to
\`f\`, and put the answer back into the same slot.`,
      },
      {
        heading: 'One loop, any operation',
        body: `Because the operation is a parameter, the *same* \`map_array\` handles
every transformation. Squaring \`{1,2,3,4}\` gives \`{1,4,9,16}\`; doubling \`{5,10}\`
gives \`{10,20}\`. You wrote the loop once; the caller decides the behavior by choosing
which function to pass.

This separation — "the shape of the traversal" vs. "the operation applied" — is a
powerful way to avoid rewriting the same loop with a different middle line each time.`,
      },
    ],
    workedExample: `// add one to every element, in place
int inc(int x) { return x + 1; }

void bump_all(int* a, int n, int (*f)(int)) {
    for (int i = 0; i < n; i++) {
        a[i] = f(a[i]);   // overwrite slot i with the transformed value
    }
}
// on {10, 20, 30} with inc -> {11, 21, 31}`,
    whyItMatters: `"Apply this operation to every element" is one of the most reused
patterns in programming — it is exactly \`map\` in Python/JavaScript and
\`std::transform\` in C++. Doing it with a function pointer shows what those higher-level
tools are built on: a loop plus a callback.`,
    commonMistakes: [
      'Computing `f(a[i])` but forgetting to store it back — `f(a[i]);` on its own throws the result away; you need `a[i] = f(a[i]);`.',
      'Looping `i <= n` instead of `i < n`, which writes one element past the end.',
      'Making a local copy of the array and transforming that — the caller must see the change, so write through `a` directly.',
      'Declaring the parameter as `int f(int)` (a function) instead of `int (*f)(int)` (a pointer to one).',
    ],
    hint: 'A single for loop from 0 to n-1 with the body `a[i] = f(a[i]);`.',
  },
  harness: `#include <stdio.h>
static int square(int x){return x*x;}
static int dbl(int x){return x*2;}
int main(void) {
    int a[] = {1, 2, 3, 4};
    map_array(a, 4, square);
    for (int i = 0; i < 4; i++) printf("%d%s", a[i], i < 3 ? " " : "\\n");
    int b[] = {5, 10};
    map_array(b, 2, dbl);
    for (int i = 0; i < 2; i++) printf("%d%s", b[i], i < 1 ? " " : "\\n");
    return 0;
}`,
  expectedStdout: `1 4 9 16
10 20
`,
  reference: `void map_array(int* a, int n, int (*f)(int)) {
    for (int i = 0; i < n; i++) {
        a[i] = f(a[i]);
    }
}
`,
};

export default exercise;
