import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'reverse-string',
  title: 'Reverse in place',
  module: '6 · Text & Characters',
  order: 530,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement reverse_string(s) so it reverses the string s *in place*: the first
character swaps with the last, the second with the second-to-last, and so on.

The function returns nothing (void) — it rearranges the existing characters. You
will need to find the length first (by hand, no strlen), then swap from both ends
inward. A hidden harness calls it and prints the mutated string.`,
  starter: `void reverse_string(char* s) {
    // find the length, then swap ends moving inward
}
`,
  lesson: {
    intro: `Reversing a string in place means rearranging the characters that are
already there, without allocating a second string. The clean way is the
*two-pointer* technique: one index \`left\` starting at the front, another \`right\`
starting at the back. Swap those two characters, then step \`left\` forward and
\`right\` backward. Stop when they meet in the middle.

But there is a catch: to know where the *back* is, you need the length — and C
does not hand it to you. So this task has two phases: first walk to find the
length (just like the string-length exercise), then do the swapping.`,
    sections: [
      {
        heading: 'Phase 1 — find the length by walking',
        body: `Before you can point at the last character, you must count the
characters. Walk with a counter until the terminator: \`int len = 0; while
(s[len] != '\\0') len++;\`. Now \`len\` is the number of real characters, and the
*last* character sits at index \`len - 1\` (because indexing starts at 0).

For \`"hello"\`, \`len\` is 5 and the last character \`'o'\` is at index 4. Getting
this off-by-one right is the crux — the terminator at index 5 must stay put at
the end; you only reverse indices 0 through 4.`,
      },
      {
        heading: 'Phase 2 — swap from both ends inward',
        body: `Set \`int left = 0;\` and \`int right = len - 1;\`. While \`left < right\`,
swap the two characters using a temporary variable so you do not lose one:
\`char tmp = s[left]; s[left] = s[right]; s[right] = tmp;\`. Then move inward:
\`left++;\` and \`right--;\`.

The loop stops when the pointers cross or land on the same middle character —
that middle one (in an odd-length string) needs no swap. An empty string has
\`len = 0\`, so \`right\` is \`-1\`, \`left < right\` is immediately false, and nothing
happens — correct, an empty string reversed is still empty.`,
      },
    ],
    workedExample: `// reverse an array of ints in place (same two-pointer idea)
void reverse_ints(int* a, int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        int tmp = a[left];   // save one before overwriting
        a[left] = a[right];
        a[right] = tmp;
        left++;
        right--;
    }
}
// {1,2,3,4} becomes {4,3,2,1}`,
    whyItMatters: `The two-pointer pattern — indices closing in from both ends — is one of
the most reusable techniques in programming: reversing, checking palindromes,
partitioning, merging. And doing it *in place* (no extra array) is exactly the
kind of memory-conscious thinking C forces you to develop.`,
    commonMistakes: [
      'Overwriting `s[left]` before saving it, losing the character — always stash it in a `tmp` first.',
      'Setting `right = len` instead of `len - 1`, which points at the `\'\\0\'` and corrupts the string.',
      'Looping `while (left <= right)` and swapping the middle character with itself (harmless) — or worse, running one step too far.',
      'Trying to reverse by building a new string; the task is *in place*, rearranging what is already there.',
    ],
    hint: 'First `int len = 0; while (s[len] != \'\\0\') len++;`. Then two pointers `left=0`, `right=len-1`; while `left < right`, swap via a `tmp`, then `left++; right--;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    char a[] = "hello";
    reverse_string(a);
    printf("%s\\n", a);
    char b[] = "ab";
    reverse_string(b);
    printf("%s\\n", b);
    char c[] = "x";
    reverse_string(c);
    printf("%s\\n", c);
    char d[] = "";
    reverse_string(d);
    printf("%s\\n", d);
    return 0;
}`,
  expectedStdout: `olleh
ba
x

`,
  reference: `void reverse_string(char* s) {
    int len = 0;
    while (s[len] != '\\0') {
        len++;
    }
    int left = 0;
    int right = len - 1;
    while (left < right) {
        char tmp = s[left];
        s[left] = s[right];
        s[right] = tmp;
        left++;
        right--;
    }
}
`,
};

export default exercise;
