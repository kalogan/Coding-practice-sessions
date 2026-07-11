import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'enum-next-day',
  title: 'Next day of the week (enum)',
  module: '8 · Structs & Enums',
  order: 730,
  difficulty: 'easy',
  mode: 'function',
  prompt: `The days of the week wrap around: after Saturday comes Sunday again. Model the
days with an enum and compute the next one.

Define \`enum Day { SUN, MON, TUE, WED, THU, FRI, SAT };\` at the top of your code,
then implement \`next_day(d)\` so it returns \`(d + 1) % 7\` — the day after \`d\`,
wrapping SAT (6) back to SUN (0).

A hidden harness passes a few days (as their enum values) and prints the next day's
number.`,
  starter: `enum Day { SUN, MON, TUE, WED, THU, FRI, SAT };

int next_day(int d) {
    // return the next day: (d + 1) wrapping around after SAT back to SUN
    return 0;
}
`,
  lesson: {
    intro: `An **enum** gives friendly names to a fixed set of integer constants. Instead
of remembering "3 means Wednesday," you write \`WED\`. The compiler numbers them for
you: the first name is \`0\`, the next \`1\`, and so on.

So \`enum Day { SUN, MON, TUE, WED, THU, FRI, SAT };\` makes \`SUN == 0\`, \`MON == 1\`,
... \`SAT == 6\`. Under the hood every enum value is just an \`int\` — you can add to
it, compare it, and take a remainder, exactly like any other int.`,
    sections: [
      {
        heading: 'Enum values are ints that start at 0',
        body: `Because the names are plain integers, \`next_day\` can take an \`int\`
parameter and do arithmetic on it. \`d + 1\` is "one day later," but after \`SAT\`
(6) that would be \`7\`, which is off the end of the week.

The names are for *readability*: \`WED\` in code is clearer than \`3\`, but they mean
the same value. That's the whole point of an enum — the same integer, with a name a
human can read.`,
      },
      {
        heading: 'Wrapping with the % operator',
        body: `The remainder operator \`%\` gives what's left after division. \`7 % 7\`
is \`0\`, \`8 % 7\` is \`1\` — so \`(d + 1) % 7\` keeps the result in the range 0..6,
wrapping \`SAT + 1\` back to \`SUN\`.

This "add then mod by the size" trick is the standard way to move around any cycle:
clock hours (mod 12 or 24), array ring buffers, board positions. Learn it once and
you'll reuse it constantly.`,
      },
    ],
    workedExample: `enum Dir { NORTH, EAST, SOUTH, WEST };   // 0, 1, 2, 3

// turn right: the next compass direction, wrapping WEST -> NORTH
int turn_right(int dir) {
    return (dir + 1) % 4;   // 4 directions, so mod 4
}
// turn_right(WEST /* 3 */)  ->  0  (NORTH)`,
    whyItMatters: `Enums make code self-explaining — a state machine with \`IDLE\`,
\`RUNNING\`, \`DONE\` beats bare 0/1/2. And "advance and wrap with \`%\`" is the core of
cyclic logic everywhere: turn systems, animation frames, circular buffers, angles.
Days of the week are just a friendly first example of a cycle.`,
    commonMistakes: [
      'Forgetting the wrap: returning `d + 1` gives `7` for SAT, which is not a valid day.',
      'Using the wrong modulus — there are 7 days, so it is `% 7`, not `% 6`.',
      'Assuming enums start at 1; in C the first name is `0` unless you assign otherwise.',
      'Adding a semicolon in the wrong place — the enum definition ends with `};` after the closing brace.',
    ],
    hint: 'It is a one-liner: `return (d + 1) % 7;`. Add one to move forward, then take remainder by 7 so SAT wraps back to SUN.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", next_day(SUN));
    printf("%d\\n", next_day(SAT));
    printf("%d\\n", next_day(WED));
    return 0;
}`,
  expectedStdout: `1
0
4
`,
  reference: `enum Day { SUN, MON, TUE, WED, THU, FRI, SAT };

int next_day(int d) {
    return (d + 1) % 7;
}
`,
};

export default exercise;
