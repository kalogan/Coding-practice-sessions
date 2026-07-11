import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-words',
  title: 'Count the words',
  module: '6 · Text & Characters',
  order: 560,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Implement count_words(s) so it returns the number of words in the string s.
A word is a maximal run of non-space characters. Words are separated by one or
more spaces, and there may be leading or trailing spaces — all of which should be
handled correctly. An empty string has 0 words.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int count_words(const char* s) {
    // count runs of non-space characters
    return 0;
}
`,
  lesson: {
    intro: `Counting words is trickier than counting characters because a word can be
many characters long, and the gaps between words can be many spaces long. If you
naively counted spaces and added one, \`"  the quick brown fox "\` (with double and
trailing spaces) would give the wrong answer.

The robust way to think about it is as a tiny *state machine*. As you scan
left to right you are always in one of two states: **inside a word** or **in the
gap between words**. A new word begins exactly at the moment you *transition* from
"in a gap" to "inside a word." Count those transitions and you have counted the
words.`,
    sections: [
      {
        heading: 'Track whether you are currently inside a word',
        body: `Keep a flag, say \`int in_word = 0;\` (0 = not in a word, 1 = in a word),
and a counter \`int count = 0;\`. Walk each character. Ask one question per
character: is it a space?

If the character is NOT a space, you are looking at part of a word. If you were
NOT already in a word (\`in_word == 0\`), this is the *start* of a new word — so
\`count++\` and set \`in_word = 1\`. If you were already in a word, do nothing extra;
you are just continuing the same word.`,
      },
      {
        heading: 'Leaving a word resets the flag',
        body: `If the character IS a space, then you are in a gap, so set
\`in_word = 0\`. That way the next non-space you hit will again be seen as the
start of a fresh word and get counted.

This handles every messy case for free: multiple spaces just keep \`in_word\` at 0
without re-counting; leading spaces set \`in_word = 0\` before any word appears;
trailing spaces set it to 0 after the last word (which was already counted); and
the empty string never enters the loop, so \`count\` stays 0. The word is counted
at its *first* character, exactly once.`,
      },
    ],
    workedExample: `// count runs of 'a' characters, e.g. "aa b aaa" has 2 runs
int count_a_runs(const char* s) {
    int count = 0;
    int in_run = 0;
    int i = 0;
    while (s[i] != '\\0') {
        if (s[i] == 'a') {
            if (!in_run) {      // transition: gap -> run
                count++;
                in_run = 1;
            }
        } else {
            in_run = 0;         // back to a gap
        }
        i++;
    }
    return count;
}`,
    whyItMatters: `The state-machine idea — "my behavior depends on what state I am in, and
I count transitions between states" — is a foundational tool in parsing,
tokenizing, and reading input. Splitting text into words is literally the first
step of most text processing, and doing it correctly with messy whitespace is a
real-world detail that trips people up. Counting transitions rather than
delimiters is the insight.`,
    commonMistakes: [
      'Counting spaces and adding one — this breaks on multiple spaces, and on leading or trailing spaces.',
      'Forgetting to reset `in_word = 0` when you hit a space, so the whole string counts as one word.',
      'Setting `in_word = 1` but never incrementing `count` at the transition, or incrementing on *every* non-space character (counting letters, not words).',
      'Only treating `\' \'` handling and forgetting the empty string — but with the flag starting at 0 and the loop not running, empty correctly gives 0.',
    ],
    hint: 'Flags `int count = 0, in_word = 0;`. Walk to `\'\\0\'`: if `s[i] != \' \'` and `!in_word`, do `count++; in_word = 1;`; if `s[i] == \' \'`, set `in_word = 0;`. Return `count`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", count_words("hello world"));
    printf("%d\\n", count_words("  the quick brown fox "));
    printf("%d\\n", count_words(""));
    printf("%d\\n", count_words("single"));
    printf("%d\\n", count_words("a b c"));
    return 0;
}`,
  expectedStdout: `2
4
0
1
3
`,
  reference: `int count_words(const char* s) {
    int count = 0;
    int in_word = 0;
    int i = 0;
    while (s[i] != '\\0') {
        if (s[i] != ' ') {
            if (!in_word) {
                count++;
                in_word = 1;
            }
        } else {
            in_word = 0;
        }
        i++;
    }
    return count;
}
`,
};

export default exercise;
