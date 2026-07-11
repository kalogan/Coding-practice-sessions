import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'parse-obj-vertex',
  title: 'Parse a model vertex line',
  module: '22 · Your First Real Project',
  order: 2210,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Milestone 1 of your renderer: read the model. 3-D models ship as text files, and
the classic teaching format is Wavefront OBJ — one thing per line. A vertex line looks
like "v 1.0 2.0 3.0"; a face line like "f 1 2 3"; a normal like "vn 0 1 0".

Implement parse_vertex(line, x, y, z): if line is a vertex line ("v" followed by three
numbers), read those three numbers into *x, *y, *z and return 1. Otherwise return 0 and
leave the outputs alone. Use sscanf and check how many values it actually read.`,
  starter: `#include <stdio.h>

int parse_vertex(const char* line, double* x, double* y, double* z) {
    // if line is "v <x> <y> <z>", read the 3 numbers and return 1; else return 0
    return 0;
}
`,
  lesson: {
    intro: `This is where your renderer stops being a toy: it starts by *loading real data
from disk*. A 3-D model is just a list of points (vertices) and the triangles that connect
them (faces), and the simplest way to store that is a plain-text file. The **Wavefront OBJ**
format does exactly this — every line begins with a short tag that says what it is: \`v\`
for a vertex position, \`f\` for a face, \`vn\` for a surface normal, \`vt\` for a texture
coordinate. Your loader walks the file line by line and handles each tag.

For this milestone you write the piece that recognizes and decodes a *vertex* line. Given
one line of text, decide "is this a vertex?" and if so pull out its three coordinates.`,
    sections: [
      {
        heading: 'sscanf reads structured text and counts what it got',
        body: `\`sscanf\` is \`scanf\` that reads from a string instead of the keyboard. You
give it a *format* describing the shape you expect and pointers to store the pieces:
\`sscanf(line, "v %lf %lf %lf", x, y, z)\`. The literal \`v\` must match a \`v\` in the
input, each \`%lf\` reads one \`double\` (the \`l\` means "long float" = \`double\`; plain
\`%f\` is for \`float\` and would corrupt a \`double\`), and the spaces skip any whitespace.

The magic is the *return value*: \`sscanf\` returns **how many items it successfully
converted**. If all three numbers parse you get \`3\`; if the line doesn't start the right
way — like \`vn 0 1 0\`, where after the \`v\` the next character is \`n\`, not a number —
the first \`%lf\` fails and you get fewer than 3. So \`return sscanf(...) == 3;\` is your
whole answer: 1 when it's a real vertex, 0 otherwise.`,
      },
      {
        heading: 'Where this fits in the whole program',
        body: `In the finished project this function lives in \`obj.c\` (with its declaration
in \`obj.h\`). The caller is a loader that opens the file and runs an \`fgets\` loop over it
— the same file-reading pattern you met back in Module 15:

\`while (fgets(line, sizeof line, fp)) { ... }\`

For each line it calls \`parse_vertex\`; on a 1 it pushes the new point onto a *growable
array* of vertices (a \`malloc\`'d buffer it \`realloc\`s as it fills — Module 7). By the
end of the file you're holding every point of the model in memory, ready for the next
milestone. Keeping the "decode one line" logic in its own small, testable function is what
makes the loader easy to reason about — which is exactly why you can verify it here in
isolation.`,
      },
    ],
    workedExample: `// recognizing a face line instead: "f 1 2 3"
int parse_face(const char* line, int* a, int* b, int* c) {
    // %d reads an int; three of them after the 'f' tag
    return sscanf(line, "f %d %d %d", a, b, c) == 3;
}
// parse_face("f 7 8 9", &a, &b, &c) -> returns 1, a=7 b=8 c=9
// parse_face("v 1 2 3", &a, &b, &c) -> returns 0 (the 'f' doesn't match 'v')`,
    whyItMatters: `Almost every real program has to ingest data someone else wrote — config
files, CSV, JSON, log lines, network packets. "Read a line, figure out what it is, pull out
the fields" is the everyday shape of that work, and \`sscanf\` with a checked return count
is one of the oldest and most direct tools for it in C. Learn to trust that return value and
you get robust parsing almost for free: malformed input simply fails the count and you skip
it instead of crashing. Build this and compile the module with
\`gcc -Wall -Wextra -g -c obj.c\` to see it cleanly on its own.`,
    commonMistakes: [
      'Using `%f` instead of `%lf` for a `double`. `%f` is for `float`; feeding a `double*` to `%f` reads the wrong number of bytes and gives garbage. Doubles always use `%lf` in `scanf`/`sscanf`.',
      'Not checking the return value — assuming the parse succeeded and using `*x`, `*y`, `*z` even when the line was a face or a comment. Always compare against the expected count.',
      'Passing `x` instead of the address. Here `x` is already an `int*`/`double*` (a pointer parameter), so you pass it straight to `sscanf` — but with a plain local you would need `&x`.',
      'Forgetting the space or the literal `v` in the format string, so `f` and `vn` lines get misread as vertices.',
    ],
    hint: 'One line: `return sscanf(line, "v %lf %lf %lf", x, y, z) == 3;`. The `== 3` turns "did it read all three numbers?" into the 1/0 you return.',
  },
  harness: `#include <stdio.h>
int main(void) {
    const char* lines[4] = {
        "v 1.0 2.0 3.0",
        "v -0.5 4 2.25",
        "f 1 2 3",
        "vn 0 1 0"
    };
    for (int i = 0; i < 4; i++) {
        double x, y, z;
        if (parse_vertex(lines[i], &x, &y, &z))
            printf("%g %g %g\\n", x, y, z);
        else
            printf("skip\\n");
    }
    return 0;
}`,
  expectedStdout: `1 2 3
-0.5 4 2.25
skip
skip
`,
  reference: `#include <stdio.h>

int parse_vertex(const char* line, double* x, double* y, double* z) {
    return sscanf(line, "v %lf %lf %lf", x, y, z) == 3;
}
`,
};

export default exercise;
