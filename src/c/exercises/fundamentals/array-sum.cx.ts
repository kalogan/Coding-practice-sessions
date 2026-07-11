import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'array-sum',
  title: 'Sum an array',
  module: 'C Fundamentals',
  order: 20,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement sum(a, n): return the sum of the first n elements of the int array a.

This is your first pointer + loop. n can be 0 (an empty range → 0). The array is
passed as a pointer; index it with a[i].`,
  starter: `int sum(const int* a, int n) {
    // add up a[0] .. a[n-1]
    return 0;
}
`,
  harness: `#include <stdio.h>
int main(void) {
    int x[] = {1, 2, 3, 4, 5};
    printf("%d\\n", sum(x, 5));
    int y[] = {-3, 3, 10};
    printf("%d\\n", sum(y, 3));
    int z[] = {42};
    printf("%d\\n", sum(z, 1));
    printf("%d\\n", sum(z, 0));
    return 0;
}`,
  expectedStdout: `15
10
42
0
`,
  reference: `int sum(const int* a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}
`,
};

export default exercise;
