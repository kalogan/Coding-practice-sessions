import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'debug-with-gdb',
  title: 'Trace a bug with gdb',
  module: '21 · Tooling & Debugging',
  order: 2150,
  difficulty: 'medium',
  mode: 'function',
  prompt: `factorial(n) should return n! = 1·2·3·…·n, but it's returning the wrong numbers
(factorial(5) gives 16 instead of 120). Somewhere in the loop the wrong operator is used.
The lesson walks through how you'd corner it in gdb; then make the one-character fix.`,
  starter: `long factorial(int n) {
    long result = 1;
    for (int i = 1; i <= n; i++)
        result += i;      // wrong operator: this ADDS instead of multiplying
    return result;
}
`,
  lesson: {
    intro: `When a function returns wrong values and you can't see why by reading it, you *watch
it run* with a debugger. **gdb** (the GNU debugger) lets you pause a program mid-execution,
step one line at a time, and print the value of any variable at any moment. Instead of
guessing, you observe.

This \`factorial\` builds \`result\` in a loop but uses \`+=\` (add) where it should use \`*=\`
(multiply). So it computes \`1 + 1 + 2 + 3 + … + n\` instead of \`1 · 1 · 2 · 3 · … · n\`.
Below is exactly how gdb reveals that; the fix is \`+=\` → \`*=\`.`,
    sections: [
      {
        heading: 'A gdb session, start to finish',
        body: `Compile with debug symbols: \`gcc -g factorial.c -o fac\`. Start the debugger:
\`gdb ./fac\`. Set a breakpoint on the function — \`break factorial\` — and \`run\`. Execution
pauses at the first line of \`factorial\`. Now step through the loop with \`next\` and inspect
values with \`print\`: \`print i\`, \`print result\`. Watch what happens: after \`i = 2\` you
expected \`result\` to be \`2\`, but gdb shows \`result = 4\`. It's growing by *addition*, not
multiplication — you've found the bug without changing a line of code.`,
      },
      {
        heading: 'The handful of commands you actually need',
        body: `You can be productive in gdb with six commands: \`break <fn or file:line>\` (set a
breakpoint), \`run\` (start), \`next\` (run the next line, stepping *over* calls), \`step\`
(step *into* a call), \`print <expr>\` (show a value), \`continue\` (resume to the next
breakpoint), and \`backtrace\`/\`bt\` (the call stack, invaluable after a crash). That's
enough to trace almost any logic bug or crash. A debugger beats scattering \`printf\`s: no
recompiling, and you can inspect *anything*, not just what you remembered to print.`,
      },
    ],
    workedExample: `$ gcc -g factorial.c -o fac
$ gdb ./fac
(gdb) break factorial
(gdb) run
(gdb) next          # step through the loop
(gdb) print i
$1 = 2
(gdb) print result
$2 = 4              # expected 2 for 2! -> it's ADDING, not multiplying
// the fix:
result *= i;        // multiply into the accumulator`,
    whyItMatters: `A debugger is the single most powerful bug-finding tool you have, and most
beginners avoid it far too long. Being able to stop a program, walk it line by line, and
watch variables change turns "I have no idea why this is wrong" into a methodical
investigation. The same gdb skills apply to crashes (\`bt\` shows where it died), infinite
loops (interrupt and \`bt\`), and wrong values (breakpoint + \`print\`) — for the rest of your
career, in almost every compiled language.`,
    commonMistakes: [
      'Using `+=` (add into) where you mean `*=` (multiply into) an accumulator — and vice-versa.',
      'Forgetting to compile with `-g`, so gdb can\'t show source lines or variable names.',
      'Reaching for scattered `printf` debugging when a breakpoint + `print` would be faster and cleaner.',
      'Initializing a product accumulator to `0` instead of `1` (then everything multiplies to zero) — a sibling bug.',
    ],
    hint: 'The accumulator should be multiplied, not added: change `result += i;` to `result *= i;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", factorial(5));
    printf("%ld\\n", factorial(1));
    printf("%ld\\n", factorial(4));
    printf("%ld\\n", factorial(0));
    return 0;
}`,
  expectedStdout: `120
1
24
1
`,
  reference: `long factorial(int n) {
    long result = 1;
    for (int i = 1; i <= n; i++)
        result *= i;
    return result;
}
`,
};

export default exercise;
