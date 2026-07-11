import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'celsius-to-fahrenheit',
  title: 'Celsius to Fahrenheit',
  module: '1 · Values & Operators',
  order: 40,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement c_to_f(c) so it converts a temperature in degrees Celsius to
degrees Fahrenheit.

The formula is: Fahrenheit = Celsius times 9/5, plus 32. Note the parameter and
return type are both \`double\` — these are numbers that can have decimals. A hidden
harness checks several temperatures.`,
  starter: `double c_to_f(double c) {
    // convert Celsius c to Fahrenheit: c * 9/5 + 32
    return 0.0;
}
`,
  lesson: {
    intro: `So far every value has been an \`int\` — a whole number. But 37°C converts to
98.6°F, and a whole number can't hold that \`.6\`. For numbers with a fractional part C
gives you \`double\`: a "double-precision" number that can carry decimals, like \`9.5\`,
\`-40.0\`, or \`98.6\`.

Here both the parameter \`c\` and the return type are \`double\`, so the whole calculation
happens in decimals. That choice matters more than it looks — as the next section shows,
the difference between \`9.0 / 5.0\` and \`9 / 5\` decides whether your answer is right.`,
    sections: [
      {
        heading: 'Why 9.0 / 5.0 and not 9 / 5',
        body: `Remember integer division from the last lesson: when *both* operands are
\`int\`, \`/\` throws the remainder away. So \`9 / 5\` is \`1\`, not \`1.8\` — and your whole
formula would be wrong, collapsing to \`c + 32\`.

The fix is to make at least one operand a \`double\` by writing a decimal point. \`9.0 / 5.0\`
is real division and gives \`1.8\`. The \`.0\` is the whole trick: it tells the compiler
"treat this as a \`double\`, keep the fraction." So write \`c * 9.0 / 5.0 + 32.0\`, keeping
every constant a \`double\` so nothing silently rounds to an integer.`,
      },
      {
        heading: 'Operator precedence: * and / before +',
        body: `C evaluates \`*\` and \`/\` *before* \`+\` and \`-\`, exactly like the arithmetic
you learned in school ("multiply and divide before add and subtract"). So in
\`c * 9.0 / 5.0 + 32.0\`, the \`c * 9.0 / 5.0\` part happens first, and only then is \`32.0\`
added. That's precisely the order the formula needs — no parentheses required.

The \`*\` and \`/\` at the same level run left-to-right: \`c * 9.0\` first, then that result
\`/ 5.0\`. If you ever want a different order, wrap the part you want first in parentheses
\`( )\` — they always win. Here the natural precedence already does the right thing.`,
      },
    ],
    workedExample: `// half of a number, keeping the fraction
double half(double x) {
    return x / 2.0;   // x / 2.0 keeps decimals; x / 2 with an int x would not
}
// half(7.0)  ->  3.5`,
    whyItMatters: `The int-vs-double distinction trips up beginners constantly, and the
bug is silent — the code compiles and runs, it just gives a wrong, rounded answer.
Unit conversions, averages, prices, physics — anything with a fractional result needs
\`double\` and needs at least one decimal operand so division doesn't quietly truncate.`,
    commonMistakes: [
      'Writing `9 / 5` (integer division = 1) instead of `9.0 / 5.0` (= 1.8) — the classic silent bug.',
      'Returning an `int` or declaring `c` as `int`, which throws away the decimals.',
      'Adding parentheses that change the order, e.g. `c * 9.0 / (5.0 + 32.0)`.',
      'Forgetting the `+ 32.0` offset entirely, or writing `+ 32` (still fine numerically, but keep constants `double` for clarity).',
    ],
    hint: 'The body is one line: `return c * 9.0 / 5.0 + 32.0;`. Keep every constant a `double` (with a `.0`) so the division keeps its fraction.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%g\\n", c_to_f(0));
    printf("%g\\n", c_to_f(100));
    printf("%g\\n", c_to_f(37));
    printf("%g\\n", c_to_f(-40));
    return 0;
}`,
  expectedStdout: `32
212
98.6
-40
`,
  reference: `double c_to_f(double c) {
    return c * 9.0 / 5.0 + 32.0;
}
`,
};

export default exercise;
