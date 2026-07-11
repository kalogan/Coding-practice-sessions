import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'rectangle-area',
  title: 'Area of a rectangle',
  module: '1 · Values & Operators',
  order: 20,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement rectangle_area(w, h) so it returns the area of a rectangle with
width w and height h.

The area of a rectangle is its width times its height. You only write the
function — a hidden harness calls it with several sizes and checks each result.`,
  starter: `int rectangle_area(int w, int h) {
    // return the area: width times height
    return 0;
}
`,
  lesson: {
    intro: `You already added two numbers with \`+\`. Now meet a second *operator*: \`*\`,
which means multiply. In C the asterisk \`*\` is the multiplication sign — there is no
\`×\` key, so \`3 * 4\` is how you write "three times four", which is \`12\`.

An operator is just a symbol that combines values into a new value. \`w * h\` takes the
two numbers you were handed and produces a single new number — their product — which you
then hand back with \`return\`.`,
    sections: [
      {
        heading: 'Operators combine values',
        body: `\`+\` and \`*\` are both *binary* operators: they sit between two values and
produce one. \`w + h\` gives the sum; \`w * h\` gives the product. They are different
questions about the same two numbers.

For a 3-by-4 rectangle, \`w + h\` is \`7\` (that would be half the perimeter, not the
area), while \`w * h\` is \`12\` — the actual area. Picking the right operator is the whole
job here: you want the product, so you want \`*\`.`,
      },
      {
        heading: 'The result is still just an int',
        body: `Both inputs are \`int\`, and multiplying two \`int\`s gives an \`int\`, so the
return type stays \`int\`. Nothing new to declare.

Watch the size of the numbers, though: multiplication grows fast. \`w * h\` for small
sizes fits comfortably in an \`int\`, but multiplying two large values could overflow the
range of \`int\`. For this exercise the sizes are small, so a plain \`int\` is fine.`,
      },
    ],
    workedExample: `// area of a square is side times itself
int square_area(int side) {
    return side * side;   // e.g. side 5 -> 25
}
// square_area(5)  ->  25`,
    whyItMatters: `Multiplication is everywhere: scaling a price by a quantity, computing
how many pixels are in a w-by-h image, stepping through a 2D grid. Recognising which
operator answers your question — sum? product? difference? — is a skill you'll use in
every program you ever write.`,
    commonMistakes: [
      'Using `+` instead of `*` — `w + h` is the sum, not the area.',
      'Writing `w x h` or `w · h` — C only understands `*` for multiplication.',
      'Forgetting the semicolon `;` at the end of the `return` line.',
      'Leaving the placeholder `return 0;` so every rectangle reports an area of zero.',
    ],
    hint: 'The body is a single line: `return w * h;`. You have both sides — multiply them and hand the result back.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", rectangle_area(3, 4));
    printf("%d\\n", rectangle_area(10, 10));
    printf("%d\\n", rectangle_area(7, 1));
    printf("%d\\n", rectangle_area(0, 5));
    return 0;
}`,
  expectedStdout: `12
100
7
0
`,
  reference: `int rectangle_area(int w, int h) {
    return w * h;
}
`,
};

export default exercise;
