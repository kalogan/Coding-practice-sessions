import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'file-line-count',
  title: 'Round-trip: write lines, then count them',
  module: '15 · Files & Bigger Programs',
  order: 1510,
  difficulty: 'medium',
  mode: 'program',
  prompt: `Read a count \`N\` from standard input, then read \`N\` integers. Write each integer
to a file on its own line (using \`fprintf(f, "%d\\n", x)\`). Then close the file,
reopen it for reading, and count how many numbers you can read back before hitting
the end of the file. Print that count, followed by a newline.

If you wrote \`N\` numbers you'll read \`N\` back — so the count you print equals \`N\`.
The exercise is the read/write round trip and detecting end-of-file, not the number.

Input:  \`N\`, then \`N\` integers.
Output: the number of lines read back (a single integer) and a newline.`,
  starter: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);

    // 1. fopen "lines.txt" "w"; for each of n ints, read it and fprintf "%d\\n"; fclose
    // 2. fopen "lines.txt" "r"; fscanf in a loop until it stops returning 1; count
    // 3. print the count

    return 0;
}
`,
  lesson: {
    intro: `You already know how to open a file, write to it, and read it back. This session
adds the piece that makes reading a file *general*: you usually don't know how many
items are in it, so you read in a loop until the file runs out — until you hit
*end-of-file* (EOF).

The trick is that \`fscanf\` tells you how it did. It returns the number of items it
successfully read. Ask for one \`%d\` and it returns \`1\` on success, and something
other than \`1\` (the special value \`EOF\`) when there's nothing left. That return
value is your loop condition.`,
    sections: [
      {
        heading: 'Writing line by line',
        body: `Putting each value on its own line is just a \`\\n\` in the format string:
\`fprintf(f, "%d\\n", x);\`. Do that inside a loop and the file fills up one line at a
time:

\`for (int i = 0; i < n; i++) { scanf("%d", &x); fprintf(f, "%d\\n", x); }\`

Note the two different destinations: \`scanf\` pulls each number *from stdin* (the
input we feed you), and \`fprintf\` pushes it *into the file*. When the loop ends,
\`fclose(f);\` so every line is safely flushed to disk before you reopen it.`,
      },
      {
        heading: 'Reading until EOF',
        body: `Reopen with \`"r"\` and read in a loop driven by \`fscanf\`'s return value:

\`while (fscanf(f, "%d", &x) == 1) { count++; }\`

Each pass reads one integer and adds one to \`count\`. When \`fscanf\` can't read
another integer — because the file ended — it returns \`EOF\` instead of \`1\`, the
condition is false, and the loop stops. This "read while it keeps succeeding"
pattern is how you consume a file of unknown length. Start \`count\` at \`0\`, and if
the file is empty the loop body never runs, so you correctly print \`0\`.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    FILE *f = fopen("scores.txt", "w");
    fprintf(f, "%d\\n", 90);      // three lines,
    fprintf(f, "%d\\n", 80);      // one number each
    fprintf(f, "%d\\n", 70);
    fclose(f);                    // flush before reopening

    f = fopen("scores.txt", "r");
    int x, count = 0;
    while (fscanf(f, "%d", &x) == 1)  // 1 = read ok; EOF stops the loop
        count++;
    fclose(f);

    printf("%d\\n", count);        // prints 3
    return 0;
}
// The loop didn't know there were 3 — it just read until EOF.`,
    whyItMatters: `"Loop until EOF" is how you process a file whose size you don't know ahead of
time — log files, data dumps, streams of records. Checking a read function's return
value (rather than assuming every read works) is a core habit of robust C: it's the
same idea behind checking \`fgets\`, \`fread\`, and \`getline\`. Master the write-then-
read-back round trip and you can build tools that persist and reload their own data.`,
    commonMistakes: [
      'Looping `while (!feof(f))` — a classic bug. `feof` only becomes true *after* a failed read, so you count one too many. Test `fscanf(...) == 1` directly instead.',
      'Forgetting to `fclose` the writer before reopening to read, so the lines aren\'t flushed and the count comes out `0`.',
      'Starting `count` uninitialized instead of at `0`.',
      'Writing without the `\\n`, so all the numbers run together on one line (harmless for `%d` reads here, but wrong if you ever read whole lines).',
    ],
    hint: 'Two loops. First: a `for` that runs `n` times, `scanf` a value and `fprintf(f, "%d\\n", x)`. Close, reopen `"r"`. Second: `while (fscanf(f, "%d", &x) == 1) count++;`. Then `printf("%d\\n", count);`.',
  },
  cases: [
    { name: 'three numbers', stdin: `3\n10 20 30\n`, expectedStdout: `3\n` },
    { name: 'single number', stdin: `1\n5\n`, expectedStdout: `1\n` },
    { name: 'none (n is zero)', stdin: `0\n`, expectedStdout: `0\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);

    FILE *f = fopen("lines.txt", "w");
    if (f == NULL) return 1;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        fprintf(f, "%d\\n", x);
    }
    fclose(f);

    f = fopen("lines.txt", "r");
    if (f == NULL) return 1;
    int x, count = 0;
    while (fscanf(f, "%d", &x) == 1) {
        count++;
    }
    fclose(f);

    printf("%d\\n", count);
    return 0;
}
`,
};

export default exercise;
