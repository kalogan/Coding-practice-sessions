import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'rectangle-struct-area',
  title: 'Area of a rectangle struct',
  module: '8 · Structs & Enums',
  order: 710,
  difficulty: 'easy',
  mode: 'function',
  prompt: `A rectangle is a width and a height. Bundle them into a struct and compute
the area.

Define \`struct Rect { int w; int h; };\` at the top of your code, then implement
\`rect_area(r)\` so it returns \`r.w * r.h\`.

A hidden harness builds a few rectangles and prints their areas.`,
  starter: `struct Rect { int w; int h; };

int rect_area(struct Rect r) {
    // return width * height
    return 0;
}
`,
  lesson: {
    intro: `A rectangle is naturally *two* numbers — a width and a height — that belong
together. A **struct** lets you say that in the type system: \`struct Rect\` is one
value that carries both.

Once the type exists, a function can accept a whole rectangle at once. Inside,
\`r.w\` is the width and \`r.h\` is the height, and the area is just their product.`,
    sections: [
      {
        heading: 'One parameter, two fields',
        body: `Instead of \`rect_area(int w, int h)\`, we write
\`rect_area(struct Rect r)\` — a single parameter that carries both numbers. This
keeps related data glued together: you can't call it with the width but forget the
height, because they travel as one \`struct Rect\`.

To use the fields, reach in with a dot: \`r.w\` and \`r.h\`. Multiply them and return
the result.`,
      },
      {
        heading: 'A struct is just a bag of typed fields',
        body: `\`struct Rect { int w; int h; };\` declares a type with two \`int\`
fields. Each field has its own name and type; you access them independently. There is
nothing magic about \`w\` and \`h\` — they are ordinary ints you happen to keep under
one roof.

Because both fields are ints, their product is an int, so \`rect_area\` returns an
\`int\` and you print it with \`%d\`.`,
      },
    ],
    workedExample: `struct Box { int len; int wid; };

// perimeter of a box: twice the sum of the sides
int perimeter(struct Box b) {
    return 2 * (b.len + b.wid);   // read both fields with a dot
}
// perimeter( (struct Box){3, 5} )  ->  16`,
    whyItMatters: `Grouping a shape's dimensions into one struct is the same move you'll
make for a player (health + score + position), a config (width + height + fullscreen),
or a database row. The function signature stays short and self-documenting, and you
can pass the whole thing to any function that needs it.`,
    commonMistakes: [
      'Adding instead of multiplying — area is `r.w * r.h`, not `r.w + r.h`.',
      'Writing `w * h` without the `r.` prefix; the fields live inside `r`, so it must be `r.w * r.h`.',
      'Dropping the semicolon after the struct definition line.',
      'Trying to pass width and height as two separate arguments — the function takes one `struct Rect`.',
    ],
    hint: 'The body is a single line: `return r.w * r.h;`. You already have the rectangle `r`; just multiply its two fields.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Rect a = {3, 4};
    printf("%d\\n", rect_area(a));
    struct Rect b = {10, 10};
    printf("%d\\n", rect_area(b));
    struct Rect c = {5, 1};
    printf("%d\\n", rect_area(c));
    return 0;
}`,
  expectedStdout: `12
100
5
`,
  reference: `struct Rect { int w; int h; };

int rect_area(struct Rect r) {
    return r.w * r.h;
}
`,
};

export default exercise;
