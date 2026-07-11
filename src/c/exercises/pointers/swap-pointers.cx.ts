import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'swap-pointers',
  title: 'Swap two ints',
  module: '7 · Pointers & Memory',
  order: 600,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement swap(a, b): given two int pointers, exchange the values they point at.

After swap(&x, &y), the variable x should hold what y held and vice-versa. You do
this by going *through* the pointers with the \`*\` operator — not by swapping the
pointers themselves.`,
  starter: `void swap(int* a, int* b) {
    // exchange the ints that a and b point to
}
`,
  lesson: {
    intro: `Every variable lives at some *address* in memory. The \`&\` operator reads
that address: \`&x\` means "the location where x lives". A *pointer* is a variable
that stores such an address — \`int* a\` holds the address of some \`int\`.

Given a pointer, the \`*\` operator does the reverse: \`*a\` means "the int sitting
at the address a holds". You can read it (\`int t = *a;\`) and you can write it
(\`*a = 5;\`). Writing through a pointer changes the *original* variable, wherever it
lives — that is the whole point.`,
    sections: [
      {
        heading: 'Why pass-by-value can\'t swap',
        body: `When you call a function in C, the arguments are *copied* in. If \`swap\`
took \`int a, int b\`, it would receive copies; swapping those copies would do nothing
to the caller's \`x\` and \`y\` — they'd be untouched when the function returns.

To reach back out and change the caller's variables, the function needs their
*addresses*. So the caller passes \`&x\` and \`&y\`, and \`swap\` edits the originals
through the pointers.`,
      },
      {
        heading: 'The three-line dance',
        body: `Swapping needs a *temporary*. If you just did \`*a = *b; *b = *a;\` you'd
clobber the first value before you saved it — both ends up equal.

Instead: stash one value in a local (\`int t = *a;\`), copy the second onto the first
(\`*a = *b;\`), then copy the stash onto the second (\`*b = t;\`). Three moves, one
temp.`,
      },
    ],
    workedExample: `// swap two doubles through pointers
void swap_d(double* a, double* b) {
    double t = *a;   // save what a points at
    *a = *b;         // overwrite a's target with b's
    *b = t;          // put the saved value into b's target
}`,
    whyItMatters: `Passing a pointer so a function can modify the caller's data is one
of C's core moves. Sorting routines swap elements this way, and any function that
"returns" a result by writing into a variable you handed it (an out-parameter) relies
on exactly this address-of / dereference pair.`,
    commonMistakes: [
      'Swapping the pointers (`int* t = a; a = b; b = t;`) instead of the values — that only shuffles local copies of the addresses and leaves the caller untouched.',
      'Forgetting the `*` and writing `t = a;` — that copies the address, not the int it points to.',
      'Skipping the temporary and doing `*a = *b; *b = *a;`, which loses the first value.',
      'Calling `swap(x, y)` instead of `swap(&x, &y)` — the function needs addresses, not the ints.',
    ],
    hint: 'Declare `int t = *a;`, then `*a = *b;`, then `*b = t;`. Every access goes through `*`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int x = 3, y = 7;
    swap(&x, &y);
    printf("%d %d\\n", x, y);
    int p = 1, q = 2;
    swap(&p, &q);
    printf("%d %d\\n", p, q);
    return 0;
}`,
  expectedStdout: `7 3
2 1
`,
  reference: `void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}
`,
};

export default exercise;
