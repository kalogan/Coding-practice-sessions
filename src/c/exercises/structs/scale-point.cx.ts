import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'scale-point',
  title: 'Scale a point by a factor',
  module: '8 · Structs & Enums',
  order: 720,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Structs can go *out* of a function as well as in. Scale a point by an
integer factor and return a brand-new point.

Define \`struct Point { int x; int y; };\` at the top of your code, then implement
\`scale(p, k)\` so it returns a new \`struct Point\` whose fields are \`{p.x * k,
p.y * k}\`.

A hidden harness scales a few points and prints the resulting x and y.`,
  starter: `struct Point { int x; int y; };

struct Point scale(struct Point p, int k) {
    // return a NEW struct Point: { p.x * k, p.y * k }
    struct Point result = {0, 0};
    return result;
}
`,
  lesson: {
    intro: `You've passed structs *into* functions. A function can also *return* one.
The return type just becomes \`struct Point\` instead of \`int\`, and the \`return\`
statement hands back a whole struct — all its fields at once, copied to the caller.

Here \`scale(p, k)\` builds a new point by multiplying each field of \`p\` by \`k\`
and returns it. The input \`p\` is untouched; the caller gets a fresh point back.`,
    sections: [
      {
        heading: 'Constructing a struct with { ... }',
        body: `You can make a struct value on the spot with a brace list, in field
order: \`struct Point result = {p.x * k, p.y * k};\` sets \`result.x\` to the first
value and \`result.y\` to the second. Order matters — the first brace entry fills the
first field.

You can also build one anonymously as an expression using a *compound literal*:
\`(struct Point){p.x * k, p.y * k}\`. That's a nameless \`struct Point\` you can
return directly, without a local variable.`,
      },
      {
        heading: 'Returning a struct by value',
        body: `When you \`return\` a struct, C copies the whole thing back to the
caller — every field. So writing \`struct Point r = scale(a, 2);\` gives \`r\` its own
independent copy of the returned point. This is *return by value*, the same idea as
passing by value, just in the other direction.

Either style works: declare a local \`result\`, set its fields, and \`return
result;\` — or return a compound literal directly. Both hand back a new point.`,
      },
    ],
    workedExample: `struct Point { int x; int y; };

// shift a point by a fixed offset, returning a new point
struct Point shift(struct Point p) {
    struct Point out = {p.x + 1, p.y + 1};
    return out;                 // hand the whole struct back
}
// shift( (struct Point){4, 9} )  ->  {5, 10}`,
    whyItMatters: `Returning a struct is how a function produces a compound result:
a new position after a move, a parsed color, a normalized vector. Because the caller
gets a copy, there's no shared-state surprise — great for small "make a new value from
an old one" helpers, which are everywhere in graphics and game code.`,
    commonMistakes: [
      'Modifying `p` in place and returning it, instead of building a new struct — the task asks for a NEW point.',
      'Scaling only one field (e.g. `p.x * k` but leaving `y` alone).',
      'Getting the brace order wrong: `{p.x * k, p.y * k}` fills `x` then `y`.',
      'Declaring the return type as `int` — it must be `struct Point`, since you return a whole point.',
    ],
    hint: 'Build the new point from the two products and return it: `struct Point r = {p.x * k, p.y * k}; return r;`. (Or `return (struct Point){p.x * k, p.y * k};`.)',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Point r = scale((struct Point){2, 3}, 4);
    printf("%d %d\\n", r.x, r.y);
    struct Point s = scale((struct Point){1, 1}, 0);
    printf("%d %d\\n", s.x, s.y);
    struct Point t = scale((struct Point){-1, 2}, 3);
    printf("%d %d\\n", t.x, t.y);
    return 0;
}`,
  expectedStdout: `8 12
0 0
-3 6
`,
  reference: `struct Point { int x; int y; };

struct Point scale(struct Point p, int k) {
    struct Point result = {p.x * k, p.y * k};
    return result;
}
`,
};

export default exercise;
