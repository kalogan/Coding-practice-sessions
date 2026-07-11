import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'grade-letter',
  title: 'Score to letter grade',
  module: '2 · Making Decisions',
  order: 140,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement grade(score) so it returns the letter grade as a char:
  90 and up -> 'A'
  80 to 89  -> 'B'
  70 to 79  -> 'C'
  60 to 69  -> 'D'
  below 60  -> 'F'

Note the return type: this function hands back a char, not an int.`,
  starter: `char grade(int score) {
    // return 'A', 'B', 'C', 'D', or 'F' for the score
    return '?';
}
`,
  lesson: {
    intro: `Not every value is a number. C has a \`char\` type for a single character —
a letter, a digit, a punctuation mark. Here you'll build a function that decides
*which letter grade* a score earns and returns that character.

The scoring is a set of thresholds that cascade: 90+, then 80+, then 70+, and so
on. This is a job for an else-if chain, but with a catch you have to get right —
the order of the checks.`,
    sections: [
      {
        heading: 'The char type and single quotes',
        body: `A \`char\` literal is written in *single* quotes: \`'A'\`, \`'x'\`, \`'?'\`.
That's different from a string like \`"A"\`, which uses *double* quotes and is a
whole sequence of characters. A single character is one \`char\`; the two are not
interchangeable.

The function's return type is \`char\`, so every \`return\` must hand back a single
quoted character. To print a \`char\` with \`printf\`, use the \`%c\` format.`,
      },
      {
        heading: 'Check the highest threshold first',
        body: `The ranges overlap in a sneaky way: a score of \`95\` is \`>= 90\`, but it's
*also* \`>= 80\`, \`>= 70\`, and \`>= 60\`. All four tests are true for it. Since an
else-if chain stops at the *first* match, you must check the highest threshold
first.

Start with \`if (score >= 90) return 'A';\`, then \`else if (score >= 80)\`, and so
on downward. Because A was already caught and left, by the time you reach the
\`>= 80\` test you know the score is below 90 — so it correctly means "80 to 89".
Order the thresholds high-to-low and each branch means exactly its band.`,
      },
    ],
    workedExample: `// map a rating 1..5 to a size character
char size_of(int stars) {
    if (stars >= 5) return 'L';        // check the top first
    else if (stars >= 3) return 'M';   // 3 or 4
    else return 'S';                   // 1 or 2
}
// size_of(5) -> 'L'   size_of(3) -> 'M'   size_of(1) -> 'S'`,
    whyItMatters: `Cascading thresholds turn a continuous number into a discrete
category — a pattern you'll reuse for grades, tiers, severity levels, tax
brackets, difficulty bands. And learning that overlapping ranges must be ordered
from most-specific/highest to least is a lesson that prevents a whole class of
"why is everything an A?" bugs.`,
    commonMistakes: [
      'Checking the lowest threshold first (e.g. `>= 60`), which matches almost every score and returns `D` for everything.',
      'Using double quotes `"A"` instead of single quotes `\'A\'`. A `char` literal needs single quotes.',
      'Printing a `char` with `%d` instead of `%c` — `%d` would show the numeric character code, not the letter.',
      'Missing the final `else` for the failing case, so scores under 60 return nothing.',
    ],
    hint: 'Order the checks top-down: `if (score >= 90) return \'A\';` then `else if (score >= 80) return \'B\';` ... down to a final `else return \'F\';`. Each earlier `return` guarantees the next band is bounded above.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%c\\n", grade(95));
    printf("%c\\n", grade(83));
    printf("%c\\n", grade(71));
    printf("%c\\n", grade(60));
    printf("%c\\n", grade(40));
    return 0;
}`,
  expectedStdout: `A
B
C
D
F
`,
  reference: `char grade(int score) {
    if (score >= 90) {
        return 'A';
    } else if (score >= 80) {
        return 'B';
    } else if (score >= 70) {
        return 'C';
    } else if (score >= 60) {
        return 'D';
    } else {
        return 'F';
    }
}
`,
};

export default exercise;
