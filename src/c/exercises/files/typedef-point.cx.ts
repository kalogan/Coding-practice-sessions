import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'typedef-point',
  title: 'typedef: give a type a short name',
  module: '14 · The Preprocessor & Declarations',
  order: 1450,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Back in the structs module you wrote \`struct Point { ... }\` and had to say
\`struct Point\` every single time. \`typedef\` fixes that: it gives an existing type a
new, shorter name.

At the top of your solution, define a point type with \`typedef\`, then implement
\`int manhattan(Point a, Point b)\` that returns the Manhattan distance between the two
points: \`|a.x - b.x| + |a.y - b.y|\` (the sum of the absolute differences of the
coordinates).

You write both the \`typedef\` and the function — the harness only calls
\`manhattan\`.`,
  starter: `typedef struct {
    int x;
    int y;
} Point;

int manhattan(Point a, Point b) {
    // return |a.x - b.x| + |a.y - b.y|
    return 0;
}
`,
  lesson: {
    intro: `\`typedef\` means "type definition": it introduces a new *name* for a type that
already exists. It doesn't create a new kind of thing — it's an alias, a nickname.
After \`typedef struct { int x; int y; } Point;\`, the name \`Point\` means exactly the
same thing as that struct, and you can write \`Point p;\` instead of the clunkier
\`struct Point p;\`.

This is why almost every real C codebase wraps its structs in a \`typedef\`. It reads
more like the types you already know — \`Point\`, \`Color\`, \`Node\` — instead of
sprinkling \`struct\` everywhere.`,
    sections: [
      {
        heading: 'The combined struct + typedef form',
        body: `You'll see this exact shape constantly:

\`typedef struct { int x; int y; } Point;\`

Read it in pieces: \`struct { int x; int y; }\` is an anonymous struct (a struct with
no tag name of its own), and \`typedef ... Point\` names that whole type \`Point\`. From
then on, \`Point\` is a first-class type name: you declare \`Point p;\`, pass \`Point\`
arguments, and return \`Point\` values — no \`struct\` keyword needed.

The members work the same as any struct: \`p.x\` and \`p.y\` reach the fields with the
dot operator.`,
      },
      {
        heading: 'Absolute value without a library',
        body: `Manhattan distance sums *absolute* differences, so a negative difference has to
be flipped positive. You don't need \`<math.h>\` for integers — a tiny helper or an
inline expression does it:

\`int d = a.x - b.x; if (d < 0) d = -d;\`

Do that for the x difference and the y difference, then add the two non-negative
results. (You could also write a small \`abs_int\` helper above \`manhattan\` — either
is fine.)`,
      },
    ],
    workedExample: `// typedef names a struct type "Vec2"
typedef struct {
    int x;
    int y;
} Vec2;

// note: the parameter and return type are just "Vec2" — no "struct"
Vec2 add(Vec2 a, Vec2 b) {
    Vec2 sum;
    sum.x = a.x + b.x;   // reach fields with the dot
    sum.y = a.y + b.y;
    return sum;          // whole struct handed back by value
}
// add({1,2}, {3,4}) -> {4, 6}`,
    whyItMatters: `\`typedef\` is everywhere in professional C. The standard library itself is full of
it — \`size_t\`, \`FILE\`, \`time_t\` are all typedefs. Naming your structs makes headers
and function signatures far more readable, and it lets you change the underlying
representation later while callers keep using the same friendly name. It's a small
feature that shapes how every serious C API is written.`,
    commonMistakes: [
      'Forgetting the semicolon after the closing brace of the `typedef` — `} Point;` needs the `;` (a struct/typedef declaration is a statement).',
      'Putting the new name in the wrong place: it goes *after* the braces (`} Point;`), not before `struct`.',
      'Returning a signed difference without taking the absolute value, so points in the "wrong" order give a negative distance.',
      'Using `->` instead of `.` — `a` is a `Point` value, not a pointer, so it\'s `a.x`, not `a->x`.',
    ],
    hint: 'Compute `dx = a.x - b.x` and `dy = a.y - b.y`, flip each to positive if negative (`if (dx < 0) dx = -dx;`), then `return dx + dy;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    Point p = {0, 0}, q = {3, 4};
    printf("%d\\n", manhattan(p, q));
    Point r = {1, 1}, s = {1, 1};
    printf("%d\\n", manhattan(r, s));
    Point t = {-2, 3}, u = {2, -3};
    printf("%d\\n", manhattan(t, u));
    return 0;
}`,
  expectedStdout: `7
0
10
`,
  reference: `typedef struct {
    int x;
    int y;
} Point;

int manhattan(Point a, Point b) {
    int dx = a.x - b.x;
    if (dx < 0) dx = -dx;
    int dy = a.y - b.y;
    if (dy < 0) dy = -dy;
    return dx + dy;
}
`,
};

export default exercise;
