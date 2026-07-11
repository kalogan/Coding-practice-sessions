import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'apply-function',
  title: 'Call a function through a pointer',
  module: '16 · Pointers, Level 2',
  order: 1600,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement apply(f, x): call the function f with the argument x and return
whatever it returns.

Here \`f\` is not an int — it is a *function pointer*: the address of some function
that takes an \`int\` and returns an \`int\`. Your job is just to call it: \`f(x)\`.

The test harness defines a couple of real functions (one that doubles, one that
negates) and hands them to your \`apply\`. You never see their names — you only get a
pointer, and you call through it.`,
  starter: `int apply(int (*f)(int), int x) {
    // call the function f points at, passing x, and return its result
    return 0;
}
`,
  lesson: {
    intro: `A function lives in memory just like a variable does, so it has an
*address*. A *function pointer* is a variable that holds that address. Once you have
one, you can call the function through it — without ever naming the function directly.

The parameter \`int (*f)(int)\` says: "\`f\` is a pointer to a function that takes one
\`int\` and returns an \`int\`." Read it inside-out, starting at the name: \`f\` … is a
pointer \`(*f)\` … to a function \`(*f)(int)\` … that returns \`int\` → \`int (*f)(int)\`.
The parentheses around \`*f\` are essential; without them \`int *f(int)\` would mean
something completely different (a function returning \`int*\`).`,
    sections: [
      {
        heading: 'Getting a function pointer and calling it',
        body: `A function's name already *is* its address, so you can assign it straight
into a matching pointer: \`int (*g)(int) = square;\` (no \`&\` needed, though \`&square\`
also works and means the same thing).

To call through the pointer you just write \`g(5)\` — modern C lets you call a function
pointer with the same syntax as a normal call. (You may also see the older explicit
form \`(*g)(5)\`; both are identical.) So inside \`apply\`, calling \`f\` on \`x\` is
simply \`f(x)\`.`,
      },
      {
        heading: 'The types must match exactly',
        body: `A function pointer's type includes the return type *and* the parameter
types. \`int (*)(int)\` can only point at functions shaped like \`int name(int)\`. You
could not store a \`double area(double)\` in it — the shapes disagree.

That is why \`apply\` can accept *any* \`int name(int)\` function the caller supplies:
doubling, negating, squaring — as long as it has that one shape, it fits the pointer,
and \`apply\` treats them all the same.`,
      },
    ],
    workedExample: `// a pointer to "int -> int", pointed at two different functions
int inc(int x)  { return x + 1; }
int square(int x) { return x * x; }

int call_twice(int (*f)(int), int x) {
    return f(f(x));   // call through the pointer, twice
}
// call_twice(inc, 4)    -> 6
// call_twice(square, 3) -> 81`,
    whyItMatters: `Passing a function as an argument is how *callbacks* work. Sorting
routines like \`qsort\` take a comparison function; event systems take a handler;
"do this to each item" helpers take an operation. Function pointers are C's way of
saying "here is some behavior — you decide when to run it."`,
    commonMistakes: [
      'Writing the parameter as `int *f(int)` (a function returning `int*`) instead of `int (*f)(int)` (a pointer to a function). The parentheses around `*f` are required.',
      'Trying to look inside `f` with `*f` as if it were a data pointer — you do not dereference to read a value, you *call* it: `f(x)`.',
      'Returning `x` or `f` instead of `f(x)` — the answer is the *result* of the call.',
      'Passing `apply(dbl(5), ...)` — that calls `dbl` first; you want to pass the function `dbl` itself, then let `apply` call it.',
    ],
    hint: 'The whole body is one line: `return f(x);`.',
  },
  harness: `#include <stdio.h>
static int dbl(int x){return x*2;}
static int neg(int x){return -x;}
int main(void) {
    printf("%d\\n", apply(dbl, 5));
    printf("%d\\n", apply(neg, 7));
    printf("%d\\n", apply(dbl, 0));
    return 0;
}`,
  expectedStdout: `10
-7
0
`,
  reference: `int apply(int (*f)(int), int x) {
    return f(x);
}
`,
};

export default exercise;
