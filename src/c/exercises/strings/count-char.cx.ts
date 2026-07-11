import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-char',
  title: 'Count a character',
  module: '6 · Text & Characters',
  order: 510,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement count_char(s, target) so it returns how many times the character
target appears inside the string s.

Walk the whole string and tally every match. You only write the function — a
hidden harness calls it and checks the result.`,
  starter: `int count_char(const char* s, char target) {
    // count how many characters in s equal target
    return 0;
}
`,
  lesson: {
    intro: `Now that you can walk a string, you can *inspect* each character as you go.
Counting how often a particular character shows up is the classic first "search"
task: look at every character, and each time it matches the one you care about,
add one to a running total.

The character you are looking for arrives as a \`char\` parameter named \`target\`.
A \`char\` holds a single character like \`'a'\` or \`'z'\` — written with single
quotes. Comparing two chars with \`==\` asks "are these the same character?"`,
    sections: [
      {
        heading: 'A running total (an accumulator)',
        body: `Start a counter at \`0\` before the loop: \`int count = 0;\`. This is an
*accumulator* — a variable that gathers up a result across many steps. As you
visit each character, you conditionally bump it: \`if (s[i] == target) count++;\`.

The counter lives *outside* the loop so it survives every iteration. If you
declared it inside the loop it would reset to \`0\` every step and always end at
\`0\` or \`1\` — a very common beginner bug.`,
      },
      {
        heading: 'Walk to the terminator, comparing as you go',
        body: `Reuse the same walking pattern as string length:
\`while (s[i] != '\\0')\`. Inside, compare the current character to \`target\`.

Order matters only in that you must stop at the \`'\\0'\`. The terminator will
never equal a normal character like \`'a'\`, so even if you compared it you would
not falsely count it — but stopping at it is what keeps you from reading past the
end of the string into memory you do not own.`,
      },
    ],
    workedExample: `// count how many spaces are in a string
int count_spaces(const char* s) {
    int count = 0;
    int i = 0;
    while (s[i] != '\\0') {
        if (s[i] == ' ') {   // is this character a space?
            count++;         // yes -> tally it
        }
        i++;
    }
    return count;
}
// count_spaces("a b c")  ->  2`,
    whyItMatters: `Tallying matches while scanning is the seed of every real search and
frequency count: how many times a word appears, how many vowels in a name, how
many commas in a CSV line. The "accumulator + loop + condition" shape you learn
here reappears constantly, in every language.`,
    commonMistakes: [
      'Declaring `count` *inside* the loop, so it resets every iteration and never grows.',
      'Forgetting to return `count` — or returning `i` (the position) by accident.',
      'Writing `s[i] = target` (assignment) instead of `s[i] == target` (comparison). One `=` copies; two `==` compares.',
      'Comparing with double quotes `"a"` (a string) instead of single quotes `\'a\'` (a char).',
    ],
    hint: 'Set `int count = 0;`, walk `while (s[i] != \'\\0\')`, and inside do `if (s[i] == target) count++;`. Return `count` at the end.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", count_char("banana", 'a'));
    printf("%d\\n", count_char("hello", 'l'));
    printf("%d\\n", count_char("abc", 'z'));
    printf("%d\\n", count_char("", 'x'));
    return 0;
}`,
  expectedStdout: `3
2
0
0
`,
  reference: `int count_char(const char* s, char target) {
    int count = 0;
    int i = 0;
    while (s[i] != '\\0') {
        if (s[i] == target) {
            count++;
        }
        i++;
    }
    return count;
}
`,
};

export default exercise;
