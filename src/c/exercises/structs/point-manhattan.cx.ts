import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'point-manhattan',
  title: 'Manhattan distance between two points',
  module: '8 · Structs & Enums',
  order: 700,
  difficulty: 'easy',
  mode: 'function',
  prompt: `A point on a grid has an x and a y. Rather than passing two loose
integers everywhere, bundle them into a struct Point.

Define \`struct Point { int x; int y; };\` at the top of your code, then implement
\`manhattan(a, b)\` so it returns the Manhattan distance between two points:
|a.x - b.x| + |a.y - b.y| (the number of grid steps, moving only up/down/left/right).

You write the struct and the function — a hidden harness makes some points and checks
the distance.`,
  starter: `struct Point { int x; int y; };

int manhattan(struct Point a, struct Point b) {
    // return |a.x - b.x| + |a.y - b.y|
    return 0;
}
`,
  lesson: {
    intro: `So far every value has been a single number. But real things come in
groups: a point is an \`x\` *and* a \`y\`, a date is a day *and* a month *and* a year.
A **struct** lets you bundle several named values into one new type, so you can pass
the whole thing around as a unit.

Here we define \`struct Point { int x; int y; };\` — a new type whose values each
carry two \`int\` fields named \`x\` and \`y\`. Once that type exists, a function can
take a \`struct Point\` as a parameter just like it takes an \`int\`.`,
    sections: [
      {
        heading: 'Defining a struct and reading its fields',
        body: `The line \`struct Point { int x; int y; };\` is a *definition*: it tells
the compiler "a \`struct Point\` is made of two ints called \`x\` and \`y\`." Don't
forget the semicolon after the closing brace — a struct definition is a statement.

Given a variable \`p\` of type \`struct Point\`, you reach inside it with a dot:
\`p.x\` is its x field, \`p.y\` is its y. Those behave exactly like ordinary ints —
you can read them, add them, compare them.`,
      },
      {
        heading: 'Passing a struct by value',
        body: `When you write \`manhattan(struct Point a, struct Point b)\`, each call
copies the caller's points into \`a\` and \`b\`. This is *pass by value*: the function
gets its own copy, so changing \`a.x\` inside would not affect the caller. For reading
fields (which is all we need here) that copy is perfectly fine.

To get an absolute value without any library, just check the sign: if a difference is
negative, negate it. \`d < 0 ? -d : d\` gives \`|d|\`.`,
      },
    ],
    workedExample: `struct Vec { int a; int b; };

// sum of the two fields of one struct
int total(struct Vec v) {
    return v.a + v.b;   // reach in with a dot
}
// total( (struct Vec){3, 4} )  ->  7`,
    whyItMatters: `Structs are how C programs model anything with more than one part:
coordinates, colors (r,g,b), network packets, file headers. Grouping related fields
under one name keeps signatures short and meaning clear — you pass a \`Point\`, not a
loose pair of ints you might accidentally swap.`,
    commonMistakes: [
      'Forgetting the semicolon after the struct definition: `struct Point { int x; int y; };` — the `;` is required.',
      'Writing `a.x - b.x` but forgetting the absolute value, so a negative difference makes the answer too small.',
      'Using `ax` or `x` instead of `a.x` — you must name the variable *and* the field, joined by a dot.',
      'Reaching for `abs()` from a header — you do not need it; `d < 0 ? -d : d` works with no include.',
    ],
    hint: 'Take each difference, make it non-negative, and add the two. For one axis: `int dx = a.x - b.x; if (dx < 0) dx = -dx;`. Do the same for y, then `return dx + dy;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Point p = {0, 0}, q = {3, 4};
    printf("%d\\n", manhattan(p, q));
    struct Point r = {1, 1}, s = {1, 1};
    printf("%d\\n", manhattan(r, s));
    struct Point u = {-2, 3}, v = {2, -3};
    printf("%d\\n", manhattan(u, v));
    return 0;
}`,
  expectedStdout: `7
0
10
`,
  reference: `struct Point { int x; int y; };

int manhattan(struct Point a, struct Point b) {
    int dx = a.x - b.x;
    if (dx < 0) dx = -dx;
    int dy = a.y - b.y;
    if (dy < 0) dy = -dy;
    return dx + dy;
}
`,
};

export default exercise;
