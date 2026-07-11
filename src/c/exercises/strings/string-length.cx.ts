import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'string-length',
  title: 'String length',
  module: '6 · Text & Characters',
  order: 500,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement string_length(s) so it returns how many characters are in the
string s — NOT counting the invisible terminator at the end.

Do NOT call strlen. The whole point is to walk the string yourself.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int string_length(const char* s) {
    // count characters until you reach the '\\0' terminator
    return 0;
}
`,
  lesson: {
    intro: `A string in C is not a special built-in type — it is just a run of
\`char\` values sitting next to each other in memory, with one extra invisible
character on the end: the *null terminator*, written \`'\\0'\` (a byte whose value
is zero). That terminator is how every C function knows where the string stops.

So the text \`"hi"\` is really three characters in memory: \`'h'\`, \`'i'\`, and
\`'\\0'\`. There is no hidden length stored anywhere. To find out how long a string
is, you start at the front and walk forward, counting, until you hit the \`'\\0'\`.`,
    sections: [
      {
        heading: 'const char* — a pointer to read-only characters',
        body: `The parameter type \`const char*\` means "a pointer to characters that
I promise not to change." You can read \`s[0]\`, \`s[1]\`, \`s[2]\`, and so on — this
indexing walks through the characters one at a time, exactly like an array.

The \`const\` is a promise: this function only *reads* the string, it never writes
to it. That is perfect for counting — we look but do not touch.`,
      },
      {
        heading: 'Walk until the terminator',
        body: `Use a counter \`i\` starting at 0. Keep going while \`s[i]\` is not the
terminator: \`while (s[i] != '\\0')\`. Each step, move one character further by
doing \`i++\`. When \`s[i]\` finally *is* \`'\\0'\`, the loop stops, and \`i\` holds
exactly how many real characters you passed.

An empty string \`""\` is just \`'\\0'\` by itself — so \`s[0]\` is already the
terminator, the loop never runs, and the answer is \`0\`. That falls out for free.`,
      },
    ],
    workedExample: `// count how many characters until the terminator
int len(const char* s) {
    int i = 0;
    while (s[i] != '\\0') {  // stop at the null terminator
        i++;                 // one more real character
    }
    return i;
}
// len("cat")  ->  3   (c, a, t ... then '\\0' stops us)`,
    whyItMatters: `Almost every string operation in C — copying, comparing, searching,
printing — depends on finding the terminator. Understanding that a string is
"characters plus a \`'\\0'\` sentinel" is the single most important idea in C text
handling. Get this and \`strcpy\`, \`strcmp\`, and friends stop being magic.`,
    commonMistakes: [
      'Comparing against `"\\0"` (a string) instead of `\'\\0\'` (a single character). Use single quotes for one char.',
      'Counting the terminator itself — the answer for `"hi"` is `2`, not `3`. Stop *at* the `\'\\0\'`, do not count it.',
      'Starting the counter at `1` instead of `0`, which over-counts by one.',
      'Using a `for` loop but forgetting the stop condition, so it runs off the end of the string.',
    ],
    hint: 'Set `int i = 0;`, loop `while (s[i] != \'\\0\') i++;`, then `return i;`. The counter *is* the length when the loop ends.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", string_length("hello"));
    printf("%d\\n", string_length(""));
    printf("%d\\n", string_length("a"));
    printf("%d\\n", string_length("C rocks"));
    return 0;
}`,
  expectedStdout: `5
0
1
7
`,
  reference: `int string_length(const char* s) {
    int i = 0;
    while (s[i] != '\\0') {
        i++;
    }
    return i;
}
`,
};

export default exercise;
