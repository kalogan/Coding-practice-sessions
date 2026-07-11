import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'add-two-ints',
  title: 'Add two integers',
  module: 'C Fundamentals',
  order: 10,
  difficulty: 'intro',
  mode: 'function',
  prompt: `Warm-up. Implement add(a, b) so it returns the sum of the two integers.

You only write the function — a hidden harness calls it and checks the result.
This is the shape every "function" exercise takes: fill in the body, hit Check.`,
  starter: `int add(int a, int b) {
    // return the sum of a and b
    return 0;
}
`,
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", add(2, 3));
    printf("%d\\n", add(-4, 10));
    printf("%d\\n", add(0, 0));
    return 0;
}`,
  expectedStdout: `5
6
0
`,
  reference: `int add(int a, int b) {
    return a + b;
}
`,
};

export default exercise;
