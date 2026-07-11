import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-vowels',
  title: 'Count the vowels',
  module: '6 · Text & Characters',
  order: 550,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement count_vowels(s) so it returns how many vowels are in the string s.
Count only the lowercase vowels: a, e, i, o, u. Everything else — consonants,
uppercase letters, spaces, digits — does not count.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int count_vowels(const char* s) {
    // count how many characters are a, e, i, o, or u
    return 0;
}
`,
  lesson: {
    intro: `This is a counting task with a twist: instead of matching one target
character, you are matching *any of several*. A character counts if it is
\`'a'\` OR \`'e'\` OR \`'i'\` OR \`'o'\` OR \`'u'\`. That word "OR" maps directly to the
C operator \`||\`.

So the core test for one character \`c\` is a membership check: "is \`c\` one of the
vowels?" You walk the string as usual, run that check on each character, and tally
every one that passes.`,
    sections: [
      {
        heading: 'The || (logical OR) operator',
        body: `\`a || b\` is true when \`a\` is true, or \`b\` is true, or both. Chain it
to test membership in a small set:
\`if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')\`. Each piece is a
full comparison — you must repeat \`c ==\` every time. Writing
\`c == 'a' || 'e'\` does NOT work: \`'e'\` on its own is just a non-zero character,
which C treats as always-true, so that bug counts *every* character.`,
      },
      {
        heading: 'Walk, test, tally',
        body: `The overall shape is identical to counting a single character: an
accumulator \`int count = 0;\` outside the loop, walk \`while (s[i] != '\\0')\`, and
inside, \`if (\`the vowel test\`) count++;\`, then \`i++\`.

If you prefer, you can factor the membership test into a tiny helper function
\`int is_vowel(char c)\` that returns 1 or 0 — that keeps the loop tidy and reads
almost like English: \`if (is_vowel(s[i])) count++;\`. Either style is fine.`,
      },
    ],
    workedExample: `// a helper that answers: is this char a vowel?
int is_vowel(char c) {
    return c == 'a' || c == 'e' || c == 'i'
        || c == 'o' || c == 'u';   // 1 if any match, else 0
}
// then the count loop becomes very readable:
//   if (is_vowel(s[i])) count++;`,
    whyItMatters: `Set-membership tests — "is this one of these allowed values?" — show up
constantly: validating input against a whitelist, classifying characters, routing
on a set of commands. Learning to spell "is it any of these?" cleanly with \`||\`
(or a helper) is a small skill you will reach for again and again.`,
    commonMistakes: [
      'Writing `c == \'a\' || \'e\' || \'i\'` — only the first is a real comparison; the bare chars are always-true and break the logic. Repeat `c ==` each time.',
      'Counting uppercase vowels too — the task says lowercase only, so `\'A\'` must NOT count.',
      'Declaring `count` inside the loop so it resets every iteration.',
      'Using `&&` (AND) instead of `||` (OR) — a character can never be `\'a\'` AND `\'e\'` at once, so that always counts zero.',
    ],
    hint: 'Accumulator `int count = 0;`, walk to `\'\\0\'`, and inside test `if (s[i]==\'a\'||s[i]==\'e\'||s[i]==\'i\'||s[i]==\'o\'||s[i]==\'u\') count++;`. Return `count`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", count_vowels("hello"));
    printf("%d\\n", count_vowels("sky"));
    printf("%d\\n", count_vowels("aeiou"));
    printf("%d\\n", count_vowels("banana"));
    return 0;
}`,
  expectedStdout: `2
0
5
3
`,
  reference: `int count_vowels(const char* s) {
    int count = 0;
    int i = 0;
    while (s[i] != '\\0') {
        char c = s[i];
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
        i++;
    }
    return count;
}
`,
};

export default exercise;
