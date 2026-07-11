import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'longest-word',
  title: 'Find the longest string',
  module: '16 · Pointers, Level 2',
  order: 1630,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement longest_index(words, n): given an array of n strings, return the
INDEX of the longest one. On a tie, return the *first* (smallest index). You may assume
n >= 1.

\`words\` has type \`const char**\` — a pointer to an array of string pointers. Each
\`words[i]\` is one string (a \`const char*\`). Measure a string's length yourself by
walking to its terminating '\\0'; do NOT use strlen.`,
  starter: `int longest_index(const char** words, int n) {
    // return the index of the longest string (first one on ties)
    return 0;
}
`,
  lesson: {
    intro: `A C string is a \`char*\` — the address of the first character, with the run
of characters ending at a \`'\\0'\` (the null terminator). An *array of strings* is
therefore an array of \`char*\` values, and when it is passed to a function it decays to
a pointer to its first element: \`const char**\`, a pointer to pointers.

That double star looks scary but reads simply: \`words\` points at a row of string
pointers, so \`words[i]\` is the i-th string (a \`const char*\`), and \`words[i][j]\` is
the j-th character of that string. Two levels of indexing, two levels of indirection.`,
    sections: [
      {
        heading: 'Measuring a length by hand',
        body: `To find a string's length without \`strlen\`, start a counter at 0 and walk
forward until you hit the terminator: \`while (s[len] != '\\0') len++;\`. When the loop
stops, \`len\` is the number of characters before the \`'\\0'\` — the length.

You do this for each string \`words[i]\` and keep track of which index had the largest
length so far. Because C strings are null-terminated rather than length-prefixed,
walking to the \`'\\0'\` is *the* way to learn how long one is.`,
      },
      {
        heading: 'Keeping the first on a tie',
        body: `Track \`best\` (the winning index) and \`best_len\` (its length). Update them
only when you find a *strictly longer* string: \`if (len > best_len) { best_len = len;
best = i; }\`. Using strict \`>\` means a later string of *equal* length never displaces
the earlier one, so ties naturally keep the first index.

Start \`best_len\` at \`-1\` (or handle \`i == 0\` as an automatic win) so the very first
string always sets the initial best.`,
      },
    ],
    workedExample: `// return the index of the SHORTEST string (first on ties)
int shortest_index(const char** words, int n) {
    int best = 0, best_len = -1;
    for (int i = 0; i < n; i++) {
        int len = 0;
        while (words[i][len] != '\\0') len++;   // walk to the terminator
        if (best_len < 0 || len < best_len) {
            best_len = len;
            best = i;
        }
    }
    return best;
}`,
    whyItMatters: `Program arguments arrive as exactly this shape: \`int main(int argc,
char** argv)\`. Every command-line tool indexes \`argv[i]\` to read its arguments.
Understanding \`char**\` — an array of strings behind a pointer-to-pointer — is what lets
you handle argument lists, word lists, and any table of strings.`,
    commonMistakes: [
      "Comparing whole strings with `>` expecting length — `words[i] > words[j]` compares *addresses*, not lengths. You must count characters.",
      "Writing `'\\0'` as the number `0` is fine, but comparing against `\"\\0\"` (a string) or `'0'` (the digit) is wrong — the terminator is the character `'\\0'`.",
      'Using `>=` when picking the winner, which lets a later equal-length string steal the tie; use strict `>` to keep the first.',
      'Confusing the two index levels — `words[i]` is a whole string, `words[i][j]` is one character of it.',
    ],
    hint: 'Loop over i; for each, count characters up to `\\0` into `len`; keep `best`/`best_len`, updating only when `len > best_len`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    const char* w1[] = {"hi", "hello", "hey"};
    printf("%d\\n", longest_index(w1, 3));
    const char* w2[] = {"solo"};
    printf("%d\\n", longest_index(w2, 1));
    const char* w3[] = {"enormous", "tiny", "x"};
    printf("%d\\n", longest_index(w3, 3));
    return 0;
}`,
  expectedStdout: `1
0
0
`,
  reference: `int longest_index(const char** words, int n) {
    int best = 0;
    int best_len = -1;
    for (int i = 0; i < n; i++) {
        int len = 0;
        while (words[i][len] != '\\0') len++;
        if (len > best_len) {
            best_len = len;
            best = i;
        }
    }
    return best;
}
`,
};

export default exercise;
