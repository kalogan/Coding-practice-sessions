import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'reverse-array',
  title: 'Reverse in place',
  module: '5 · Arrays',
  order: 440,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement reverse_array(a, n): reverse the int array a IN PLACE — that is,
rearrange its own elements so the order is flipped, without allocating a second array.

It returns nothing (void); the caller sees the change because a points at the caller's
array. Example: {1, 2, 3, 4, 5} becomes {5, 4, 3, 2, 1}.`,
  starter: `void reverse_array(int* a, int n) {
    // swap elements from the outside in
}
`,
  lesson: {
    intro: `Reversing *in place* means you don't build a new array — you rearrange the
one you were handed. The clean way is the **two-pointer swap**: one index starts at the
front, one at the back, and you swap the pair, then step both toward the middle.

Notice the parameter is \`int* a\`, not \`const int* a\`. Dropping \`const\` is
deliberate: it announces "this function *modifies* the array." Because \`a\` points at
the caller's memory, your swaps are visible to them after the call returns.`,
    sections: [
      {
        heading: 'Swapping needs a temp',
        body: `You can't just write \`a[i] = a[j]; a[j] = a[i];\` — the first line
clobbers \`a[i]\` before the second can use it, so both slots end up equal. You need a
temporary holding variable:

\`int tmp = a[i]; a[i] = a[j]; a[j] = tmp;\`

Save one value aside, copy the other in, then restore the saved one into the second
slot. Three lines, one \`tmp\`.`,
      },
      {
        heading: 'Meet in the middle',
        body: `Pair up index \`i\` with its mirror \`n - 1 - i\`: the first with the last,
the second with the second-to-last, and so on. You only need to loop while
\`i < n / 2\` — past the halfway point you'd swap everything *back* and undo your work.

Integer division makes the middle behave: for odd \`n\`, the exact middle element pairs
with itself and can be left alone, which \`i < n / 2\` handles automatically.`,
      },
    ],
    workedExample: `// swap two named variables with a temp — the core move:
int tmp = a[i];
a[i] = a[j];
a[j] = tmp;
// to reverse, let i climb from 0 and pair it with n-1-i,
// looping while i < n / 2.`,
    whyItMatters: `In-place reversal shows up in string manipulation, undo stacks,
rotating arrays, and palindrome checks. More importantly it's your first taste of
*mutating* through a pointer — the same mechanism behind in-place sorts and every
function that edits a buffer it was given.`,
    commonMistakes: [
      'Swapping without a `tmp`, so both slots become the same value.',
      'Looping `i < n` instead of `i < n / 2` — that reverses the array and then reverses it right back to the original.',
      'Mirroring to `n - i` instead of `n - 1 - i`, which reads one past the end.',
      'Trying to return the array — the signature is `void`; the change happens in place.',
    ],
    hint: 'Loop `i` from 0 while `i < n / 2`, and swap `a[i]` with `a[n - 1 - i]` using a temp variable.',
  },
  harness: `#include <stdio.h>
static void show(int* a, int n) {
    reverse_array(a, n);
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\n");
}
int main(void) {
    int a[] = {1, 2, 3, 4, 5};
    show(a, 5);
    int b[] = {1, 2};
    show(b, 2);
    int c[] = {9};
    show(c, 1);
    return 0;
}`,
  expectedStdout: `5 4 3 2 1
2 1
9
`,
  reference: `void reverse_array(int* a, int n) {
    for (int i = 0; i < n / 2; i++) {
        int tmp = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = tmp;
    }
}
`,
};

export default exercise;
