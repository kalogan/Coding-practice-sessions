import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'is-palindrome',
  title: 'Is it a palindrome?',
  module: '6 · Text & Characters',
  order: 540,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement is_palindrome(s) so it returns 1 if the string s reads the same
forwards and backwards, and 0 if it does not. Compare characters exactly — no
case folding, so "Racecar" is NOT a palindrome (capital R vs lowercase r).

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int is_palindrome(const char* s) {
    // return 1 if s reads the same backward, else 0
    return 0;
}
`,
  lesson: {
    intro: `A palindrome is a string that is identical when reversed: \`"racecar"\`,
\`"abba"\`, \`"a"\`. The efficient way to check is the *two-pointer* technique again,
but now instead of swapping the ends you *compare* them.

Put one index \`left\` at the front and one \`right\` at the back. If the characters
there ever differ, you can stop immediately and answer 0 — it is not a palindrome.
If they match, step inward and check the next pair. If you make it all the way to
the middle without a mismatch, it is a palindrome: answer 1.`,
    sections: [
      {
        heading: 'Find the end, then close in from both sides',
        body: `As before, C does not tell you the length, so walk to find it:
\`int len = 0; while (s[len] != '\\0') len++;\`. The last character is at
\`len - 1\`. Set \`left = 0\` and \`right = len - 1\`.

While \`left < right\`, compare \`s[left]\` with \`s[right]\`. If they are *not*
equal, \`return 0\` right away — there is no reason to keep looking. If they are
equal, do \`left++\` and \`right--\` to move toward the center and check again.`,
      },
      {
        heading: 'Early return vs. surviving the whole loop',
        body: `The shape here is "prove it false, or fall through to true." Any single
mismatched pair is enough to disqualify the string, so you \`return 0\` the moment
you find one. Only if the loop finishes with every pair matching do you reach the
final \`return 1\`.

Edge cases handle themselves: a single character (\`left\` and \`right\` start
equal, loop never runs) returns 1, and the empty string (\`len = 0\`, so
\`right = -1\`, loop never runs) also returns 1 — both are trivially palindromes.`,
      },
    ],
    workedExample: `// do the first and last characters match?
int ends_match(const char* s) {
    int len = 0;
    while (s[len] != '\\0') len++;
    if (len < 2) return 1;            // 0 or 1 char: trivially yes
    return s[0] == s[len - 1];        // compare the two ends
}
// ends_match("gong") -> 1 (g == g);  ends_match("cat") -> 0`,
    whyItMatters: `Palindrome checking is a classic interview warm-up because it exercises
the two-pointer pattern and clean early-exit logic — skills that transfer to
comparing sequences, validating symmetry, and merging. Learning to bail out the
instant an answer is decided (rather than always scanning everything) is a habit
that makes real code faster.`,
    commonMistakes: [
      'Returning `1` inside the loop on the first match — a match of one pair does not prove the whole string; only return `1` after the loop.',
      'Setting `right = len` instead of `len - 1`, comparing against the `\'\\0\'` terminator.',
      'Case-folding when the task says compare exactly — do not lowercase; `\'R\'` and `\'r\'` are different characters here.',
      'Forgetting the final `return 1;` after the loop, so palindromes fall through with no answer.',
    ],
    hint: 'Find `len` by walking. Then `left=0`, `right=len-1`; while `left < right`, if `s[left] != s[right]` return 0, else `left++; right--;`. After the loop, `return 1;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", is_palindrome("racecar"));
    printf("%d\\n", is_palindrome("hello"));
    printf("%d\\n", is_palindrome("a"));
    printf("%d\\n", is_palindrome(""));
    printf("%d\\n", is_palindrome("abba"));
    return 0;
}`,
  expectedStdout: `1
0
1
1
1
`,
  reference: `int is_palindrome(const char* s) {
    int len = 0;
    while (s[len] != '\\0') {
        len++;
    }
    int left = 0;
    int right = len - 1;
    while (left < right) {
        if (s[left] != s[right]) {
            return 0;
        }
        left++;
        right--;
    }
    return 1;
}
`,
};

export default exercise;
