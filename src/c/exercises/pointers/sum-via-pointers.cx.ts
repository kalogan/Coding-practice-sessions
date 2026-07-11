import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'sum-via-pointers',
  title: 'Sum with pointer arithmetic',
  module: '7 · Pointers & Memory',
  order: 610,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement sum_ptr(a, n): return the sum of the first n ints of a, but reach
each element with the pointer form \`*(a + i)\` instead of the bracket form \`a[i]\`.

They compute the exact same thing — this exercise is about seeing why.`,
  starter: `int sum_ptr(const int* a, int n) {
    // add up *(a + 0) .. *(a + (n-1))
    return 0;
}
`,
  lesson: {
    intro: `Here's C's best-kept open secret: \`a[i]\` is not really "array indexing" —
it is *defined* to mean \`*(a + i)\`. The brackets are pure sugar. The array name \`a\`
is a pointer to the first element, \`a + i\` is a pointer to the i-th element, and the
\`*\` reads the int there.

So \`a[0]\` is \`*(a + 0)\`, \`a[3]\` is \`*(a + 3)\`, and the loop you already know
still works — you're just spelling the access the long way.`,
    sections: [
      {
        heading: 'Pointer arithmetic counts elements, not bytes',
        body: `When you write \`a + i\` on an \`int*\`, C does *not* add \`i\` raw bytes.
It adds \`i * sizeof(int)\` bytes for you, so \`a + 1\` lands exactly on the next
\`int\`, \`a + 2\` on the one after, and so on. The compiler scales by the pointed-to
type automatically.

That's why the same expression \`*(a + i)\` works whether the array holds \`int\`,
\`double\`, or anything else — the pointer type carries the element size.`,
      },
      {
        heading: 'Two spellings, one meaning',
        body: `Because \`a[i]\` is defined as \`*(a + i)\`, and addition commutes, even
the bizarre-looking \`i[a]\` is legal C (it means \`*(i + a)\`, the same thing). You
won't write that on purpose, but it proves the bracket is just arithmetic underneath.

Prefer \`a[i]\` in real code for readability — but knowing it's \`*(a + i)\` is what
lets you understand pointers walking through memory later.`,
      },
    ],
    workedExample: `int total = 0;
for (int i = 0; i < n; i++) {
    total += *(a + i);   // identical to a[i]
}
return total;`,
    whyItMatters: `Understanding that indexing is pointer arithmetic unlocks the rest of
C: iterating with a moving pointer, slicing arrays by passing \`a + k\`, walking
strings until a terminator, and reasoning about why an off-by-one steps off the end of
an allocation. It's the same idea dressed differently.`,
    commonMistakes: [
      'Writing `*a + i` instead of `*(a + i)` — without parentheses, `*` binds first, so you dereference `a` (getting `a[0]`) and then add `i` to that value.',
      'Assuming `a + i` moves `i` bytes; it actually moves `i` elements (`i * sizeof(int)` bytes).',
      'Looping `i <= n`, which reads `*(a + n)` — one past the last valid element.',
      'Forgetting to initialize the running total to 0.',
    ],
    hint: 'Same loop as a bracket sum, but each iteration does `total += *(a + i);`. Mind the parentheses around `a + i`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int x[] = {1, 2, 3, 4, 5};
    printf("%d\\n", sum_ptr(x, 5));
    int y[] = {10, -2};
    printf("%d\\n", sum_ptr(y, 2));
    int z[] = {7};
    printf("%d\\n", sum_ptr(z, 1));
    return 0;
}`,
  expectedStdout: `15
8
7
`,
  reference: `int sum_ptr(const int* a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += *(a + i);
    return s;
}
`,
};

export default exercise;
