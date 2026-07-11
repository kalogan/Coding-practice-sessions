import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'write-then-read-file',
  title: 'Write to a file, then read it back',
  module: '15 · Files & Program Structure',
  order: 1500,
  difficulty: 'medium',
  mode: 'program',
  prompt: `Read two integers from standard input. Write them into a file called
\`nums.txt\`, then close it, reopen it for reading, read the two numbers back out of
the file, and print their sum followed by a newline.

The point is the round trip: your program is the only thing that touches the file,
so whatever you \`fprintf\` into it is exactly what you \`fscanf\` back out.

Input:  two integers (on one line or separate lines).
Output: a single integer (their sum) and a newline.`,
  starter: `#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);

    // 1. fopen "nums.txt" for writing ("w"), fprintf a and b, fclose
    // 2. fopen "nums.txt" for reading ("r"), fscanf them back, fclose
    // 3. print the sum

    return 0;
}
`,
  lesson: {
    intro: `So far your programs have talked to *stdin* and *stdout* — the keyboard and the
screen. A file is just another place to read and write bytes, and C reaches it
through a \`FILE *\` (pronounced "file pointer" or "file handle").

You don't touch the file directly. Instead you ask the operating system to open it,
and it hands you back a \`FILE *\` — a little ticket that stands for "this open file".
Every read or write you do goes through that ticket, and when you're done you hand
it back with \`fclose\`.`,
    sections: [
      {
        heading: 'fopen gives you a handle — and it can fail',
        body: `\`FILE *f = fopen("nums.txt", "w");\` opens the file \`nums.txt\` for writing and
returns a handle. The second argument is the *mode*: \`"w"\` means "open for writing,
create it if missing, and erase whatever was there". \`"r"\` means "open for reading".
(There's also \`"a"\` for append, but you won't need it here.)

Opening can fail — the disk could be full, the name could be bad. When it fails,
\`fopen\` returns \`NULL\`. Real code always checks: \`if (f == NULL) { /* give up */ }\`.
In this sandbox the open will succeed, but checking is the habit worth building.`,
      },
      {
        heading: 'fprintf and fscanf: printf and scanf aimed at a file',
        body: `Writing to a file looks exactly like \`printf\`, with one extra first argument —
the handle: \`fprintf(f, "%d %d\\n", a, b);\` writes the two numbers into the file.
Reading back is \`fscanf\`, the file twin of \`scanf\`: \`fscanf(f, "%d %d", &x, &y);\`.
Same \`&\`-the-address rule as \`scanf\`.

The golden rule: **always \`fclose(f);\` when you're done** with a handle. Writes may
sit in a buffer until you close (or flush), so if you reopen for reading *before*
closing the write handle, the data might not be there yet. Close the writer first,
then open the reader.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    FILE *f = fopen("greeting.txt", "w");   // open for writing
    if (f == NULL) return 1;                 // always check for NULL
    fprintf(f, "%d\\n", 100);                // write like printf, but to f
    fclose(f);                               // flush + release the handle

    f = fopen("greeting.txt", "r");          // reopen, this time to read
    int n;
    fscanf(f, "%d", &n);                     // read it back: n becomes 100
    fclose(f);

    printf("%d\\n", n);                       // prints 100
    return 0;
}
// One program wrote the file and then read its own writing back.`,
    whyItMatters: `Files are how programs remember things after they exit and how they exchange
data — configs, logs, save games, CSV exports, caches. The \`fopen\` / \`fprintf\` /
\`fscanf\` / \`fclose\` cycle (and its cousins \`fgets\`/\`fwrite\`) is the backbone of
almost every program that persists data. Learning to check the handle and always
close it is what separates code that "works on my machine" from code that doesn't
leak or lose data.`,
    commonMistakes: [
      'Forgetting to `fclose` the write handle before reopening for reading — buffered writes may not be on disk yet, so the reader sees nothing.',
      'Not checking `fopen` for `NULL`. A failed open returns `NULL`, and using it (e.g. `fprintf(NULL, ...)`) crashes.',
      'Passing the values instead of their addresses to `fscanf` — it needs `&x`, `&y`, just like `scanf`.',
      'Mixing up the modes: opening with `"r"` to write, or `"w"` to read. `"w"` also *erases* the file, so never open your only copy of data with `"w"` by accident.',
    ],
    hint: 'Open with `"w"`, `fprintf(f, "%d %d\\n", a, b);`, then `fclose(f)`. Reopen with `"r"`, `fscanf(f, "%d %d", &a, &b);`, `fclose(f)`, then `printf("%d\\n", a + b);`.',
  },
  cases: [
    { name: 'two positives', stdin: `42 7\n`, expectedStdout: `49\n` },
    { name: 'both zero', stdin: `0 0\n`, expectedStdout: `0\n` },
    { name: 'cancel to zero', stdin: `-5 5\n`, expectedStdout: `0\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);

    FILE *f = fopen("nums.txt", "w");
    if (f == NULL) return 1;
    fprintf(f, "%d %d\\n", a, b);
    fclose(f);

    f = fopen("nums.txt", "r");
    if (f == NULL) return 1;
    int x, y;
    fscanf(f, "%d %d", &x, &y);
    fclose(f);

    printf("%d\\n", x + y);
    return 0;
}
`,
};

export default exercise;
