import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'oldest-person',
  title: 'Find the oldest person in an array of structs',
  module: '8 · Structs & Enums',
  order: 740,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Now combine structs with arrays: a crowd of people, each with a name and an
age. Find the oldest.

Define \`struct Person { char name[20]; int age; };\` at the top of your code, then
implement \`oldest(people, n)\` so it returns the INDEX (0-based) of the oldest person
in the array of \`n\` people. On a tie, return the *first* such index. You may assume
\`n >= 1\`.

A hidden harness builds a few crowds and prints the winning index.`,
  starter: `struct Person { char name[20]; int age; };

int oldest(const struct Person* people, int n) {
    // return the index of the person with the greatest age (first on ties)
    return 0;
}
`,
  lesson: {
    intro: `You can have an **array of structs** — a run of \`struct Person\` values laid
out one after another. Element \`people[i]\` is one whole person, and \`people[i].age\`
reaches into that person's age field.

Finding the oldest is the classic "running maximum" scan: remember the best index seen
so far, walk the rest, and update whenever you find someone older. That pattern —
track-best-as-you-go — is one you'll use for the largest, smallest, closest, or
cheapest of anything.`,
    sections: [
      {
        heading: 'Indexing an array of structs',
        body: `Given \`struct Person people[]\`, the expression \`people[i]\` is the
\`i\`-th person and \`people[i].age\` is that person's age. First index into the
array with \`[i]\`, then reach into the struct with \`.age\` — the \`[]\` binds before
the \`.\`.

Start by assuming person \`0\` is the oldest (\`int best = 0;\`), then loop \`i\` from
\`1\` to \`n - 1\` comparing \`people[i].age\` against \`people[best].age\`.`,
      },
      {
        heading: 'A struct array decays to a pointer',
        body: `The parameter is written \`const struct Person* people\` — a *pointer* to
the first person. When the harness passes an array like \`crowd\`, C automatically
hands over the address of its first element, so \`people\` points at \`crowd[0]\`. You
still index it with \`people[i]\` exactly as if it were an array; that's why the array
length \`n\` is passed separately (a pointer doesn't carry its own length).

The \`const\` is a promise that \`oldest\` only *reads* the people, never modifies
them — good manners for a function that just inspects data. To keep the *first* index
on ties, compare with a strict \`>\`: only switch when you find someone *strictly*
older, so equal ages leave the earlier index in place.`,
      },
    ],
    workedExample: `struct Item { char label[16]; int price; };

// index of the CHEAPEST item (first on ties): track the running minimum
int cheapest(const struct Item* items, int n) {
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (items[i].price < items[best].price) best = i;
    }
    return best;
}`,
    whyItMatters: `An array of records plus a scan to find the max/min is the backbone of
everyday data code: the top scorer, the nearest enemy, the earliest deadline, the
priciest line item. Master indexing into \`arr[i].field\` and the running-best loop and
you can answer a huge class of "which one is the …?" questions.`,
    commonMistakes: [
      'Returning the age itself instead of its *index* — the task asks for the position, not the value.',
      'Starting the loop at `i = 0` and comparing an element against itself; start `best = 0` and loop from `i = 1`.',
      'Using `>=` instead of `>`, which would jump to the *last* tied person rather than the first.',
      'Writing `people.age[i]` — it is `people[i].age`: index the array first, then take the field.',
    ],
    hint: 'Keep an index `best` starting at 0. Loop `i` from 1 to `n-1`; if `people[i].age > people[best].age`, set `best = i`. Return `best`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Person crowd[] = { {"Ann", 30}, {"Bo", 25}, {"Cy", 42} };
    printf("%d\\n", oldest(crowd, 3));
    struct Person solo[] = { {"Zed", 50} };
    printf("%d\\n", oldest(solo, 1));
    struct Person head[] = { {"Max", 99}, {"Al", 10}, {"Jo", 50} };
    printf("%d\\n", oldest(head, 3));
    return 0;
}`,
  expectedStdout: `2
0
0
`,
  reference: `struct Person { char name[20]; int age; };

int oldest(const struct Person* people, int n) {
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (people[i].age > people[best].age) best = i;
    }
    return best;
}
`,
};

export default exercise;
