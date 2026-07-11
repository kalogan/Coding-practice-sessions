import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'to-upper',
  title: 'Uppercase in place',
  module: '6 · Text & Characters',
  order: 520,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement to_upper(s) so it converts every lowercase letter in the string s
to its uppercase form, modifying the string *in place*. Characters that are not
lowercase letters (uppercase letters, digits, spaces) stay exactly as they are.

The function returns nothing (void) — it changes the characters directly. A
hidden harness calls it and prints the mutated string.`,
  starter: `void to_upper(char* s) {
    // walk s and uppercase each lowercase letter in place
}
`,
  lesson: {
    intro: `Under the hood, every \`char\` is really a small integer — its *ASCII code*.
The letter \`'a'\` is the number 97, \`'b'\` is 98, up to \`'z'\` at 122. The capitals
sit lower: \`'A'\` is 65, \`'B'\` is 66, up to \`'Z'\` at 90. Notice that each capital
is exactly 32 less than its lowercase partner: \`'a' - 'A'\` is \`97 - 65\` = 32.

That gap is the trick. To turn a lowercase letter into uppercase, subtract 32.
Because chars *are* numbers, you can do arithmetic on them directly:
\`s[i] = s[i] - 32;\` rewrites the character in place.`,
    sections: [
      {
        heading: 'char* (no const) means you may write',
        body: `This time the parameter is \`char*\`, not \`const char*\`. Dropping the
\`const\` is the signal that this function is allowed to *change* the characters.
Assigning \`s[i] = something;\` overwrites the character at position \`i\` right
inside the caller's string. This is "in place" — no new string is created.

Because you are writing back into the caller's memory, the harness passes a
mutable character array (\`char buf[] = "hello";\`), not a bare string literal.
String literals are read-only; arrays copied from them can be modified.`,
      },
      {
        heading: 'Guard so you only touch lowercase letters',
        body: `You must not blindly subtract 32 from every character — that would wreck
digits, spaces, and already-capital letters. Test first:
\`if (s[i] >= 'a' && s[i] <= 'z')\`. This asks "is this character in the lowercase
range?" Only inside that \`if\` do you subtract.

You can write the shift as \`s[i] - 32\` or, more readable, \`s[i] - 'a' + 'A'\` —
both compute the same thing: how far into the alphabet the letter is, added onto
the capital \`'A'\`. Anything failing the guard is left untouched.`,
      },
    ],
    workedExample: `// lowercase a single character (the reverse direction)
char to_lower_char(char c) {
    if (c >= 'A' && c <= 'Z') {  // only capitals
        return c + 32;           // shift down into lowercase
    }
    return c;                    // leave everything else alone
}
// to_lower_char('H') -> 'h';  to_lower_char('7') -> '7'`,
    whyItMatters: `Case conversion is everywhere: normalizing user input, case-insensitive
search, formatting headings. And the deeper lesson — that characters are numbers
you can compute with — unlocks a huge amount of text processing. \`toupper\` in the
standard library does exactly this; now you know it is not magic.`,
    commonMistakes: [
      'Skipping the range guard and shifting *every* character, which corrupts digits, spaces, and capitals.',
      'Adding 32 instead of subtracting — that moves uppercase toward lowercase, the wrong direction here.',
      'Using `const char*` for the parameter, then getting a compile error when you try to assign `s[i] = ...`.',
      'Trying to `return` the string — this function is `void`; the change happens in place, there is nothing to return.',
    ],
    hint: 'Walk `while (s[i] != \'\\0\')`. Inside, `if (s[i] >= \'a\' && s[i] <= \'z\') s[i] = s[i] - 32;` then `i++`. No return.',
  },
  harness: `#include <stdio.h>
int main(void) {
    char a[] = "hello";
    to_upper(a);
    printf("%s\\n", a);
    char b[] = "Mix42";
    to_upper(b);
    printf("%s\\n", b);
    char c[] = "ABC";
    to_upper(c);
    printf("%s\\n", c);
    return 0;
}`,
  expectedStdout: `HELLO
MIX42
ABC
`,
  reference: `void to_upper(char* s) {
    int i = 0;
    while (s[i] != '\\0') {
        if (s[i] >= 'a' && s[i] <= 'z') {
            s[i] = s[i] - 32;
        }
        i++;
    }
}
`,
};

export default exercise;
