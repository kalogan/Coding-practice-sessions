import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'max-of-two',
  title: 'The larger of two',
  module: '2 · Making Decisions',
  order: 100,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement max2(a, b) so it returns the larger of the two integers.

Until now your functions always did the same thing to their inputs. This one has
to *choose* — look at the two numbers and hand back whichever is bigger.`,
  starter: `int max2(int a, int b) {
    // return whichever of a and b is larger
    return 0;
}
`,
  lesson: {
    intro: `So far every function computed one fixed thing. But real programs need to
*decide* — to take one path when something is true and a different path when it
isn't. The tool for that is the \`if\` statement.

An \`if\` asks a yes/no question, and only runs the code in its braces when the
answer is yes. Pair it with \`else\` and you have a fork in the road: one block
runs when the question is true, the other when it's false. Exactly one of them
happens.`,
    sections: [
      {
        heading: 'Comparison operators ask the questions',
        body: `The question inside the parentheses is a *comparison*. \`a > b\` is true
when \`a\` is greater than \`b\`; \`a < b\` is true when \`a\` is less than \`b\`. There's
also \`>=\` (greater or equal), \`<=\` (less or equal), \`==\` (equal), and \`!=\` (not
equal).

Each comparison boils down to a yes/no — in C, that's really just \`1\` for true
or \`0\` for false. The \`if\` runs its block when the value is non-zero.`,
      },
      {
        heading: 'if / else is a fork in the road',
        body: `The shape is:

\`if (condition) { ... } else { ... }\`

When \`condition\` is true, the first \`{ }\` block runs and the \`else\` block is
skipped entirely. When it's false, the first block is skipped and the \`else\`
block runs. The braces group the statements that belong to each branch — get
into the habit of always writing them, even for a single line.`,
      },
    ],
    workedExample: `// return the smaller of two numbers
int min2(int a, int b) {
    if (a < b) {
        return a;        // a is smaller — hand it back
    } else {
        return b;        // otherwise b is smaller (or they're equal)
    }
}
// min2(3, 7) -> 3     min2(9, 2) -> 2`,
    whyItMatters: `Branching is the heartbeat of every program — validating input,
picking a winner, handling an error versus a success. "Find the max/min" is also
the seed of countless algorithms: the largest element in an array, the shortest
path, the best move. Master the two-way choice and you can build the rest.`,
    commonMistakes: [
      'Using `=` (assignment) instead of `==` (comparison). In an `if`, you almost always want `==` or one of the `<`/`>` operators, never a single `=`.',
      'Forgetting one branch — if you `return` in the `if` but fall off the end without returning in the `else` case, the function has no value to give back.',
      'Getting `<` and `>` backwards. Read it out loud: `a > b` is "a greater than b".',
      'Leaving out the braces and then adding a second line, which silently ends up outside the `if`.',
    ],
    hint: 'Ask one question: is `a` greater than `b`? If so, `return a;` — otherwise `return b;`. When they\'re equal it doesn\'t matter which you return, since both are the answer.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", max2(3, 7));
    printf("%d\\n", max2(9, 2));
    printf("%d\\n", max2(5, 5));
    printf("%d\\n", max2(-3, -8));
    return 0;
}`,
  expectedStdout: `7
9
5
-3
`,
  reference: `int max2(int a, int b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}
`,
};

export default exercise;
