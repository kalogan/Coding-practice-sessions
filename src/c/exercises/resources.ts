// "Go deeper" links surfaced at the bottom of each session's teacher panel.
//
// Kept central (not per-*.cx.ts) so a session inherits its whole module's reading
// list for free — no duplication across the ~6 sessions in a module. A handful of
// standout sessions add their own extra links on top (see sessionResources).
//
// All links are free, well-established resources, verified 2026-07-11. See
// docs/c-track-resources.md for the full annotated list and provenance.

export interface CResource {
  label: string;
  url: string;
}

// Whole-track anchors, shown on every session under the module-specific links.
export const generalResources: CResource[] = [
  { label: 'Programiz — Learn C (tutorials + runnable examples)', url: 'https://www.programiz.com/c-programming' },
  { label: 'learn-c.org — free interactive exercises', url: 'https://www.learn-c.org/' },
  { label: 'cppreference — the authoritative C reference', url: 'https://en.cppreference.com/w/c' },
];

// Keyed by the exact `module` string on each exercise.
export const moduleResources: Record<string, CResource[]> = {
  '1 · Values & Operators': [
    { label: 'Programiz — C Operators', url: 'https://www.programiz.com/c-programming/c-operators' },
    { label: 'W3Schools — C Data Types', url: 'https://www.w3schools.com/c/c_data_types.php' },
  ],
  '2 · Making Decisions': [
    { label: 'Programiz — if…else', url: 'https://www.programiz.com/c-programming/c-if-else-statement' },
    { label: 'Programiz — switch', url: 'https://www.programiz.com/c-programming/switch-statement' },
  ],
  '3 · Loops': [
    { label: 'Programiz — for loop', url: 'https://www.programiz.com/c-programming/c-for-loop' },
    { label: 'Programiz — while / do…while', url: 'https://www.programiz.com/c-programming/c-do-while-loops' },
  ],
  '4 · Functions & Recursion': [
    { label: 'mycodeschool — Recursion (video playlist)', url: 'https://www.youtube.com/playlist?list=PL2_aWCzGMAwLz3g66WrxFGSXvSsvyfzCO' },
    { label: 'Programiz — C Recursion', url: 'https://www.programiz.com/c-programming/c-recursion' },
    { label: 'freeCodeCamp — How Recursion Works (flowcharts + video)', url: 'https://www.freecodecamp.org/news/how-recursion-works-explained-with-flowcharts-and-a-video-de61f40cb7f9' },
  ],
  '5 · Arrays': [
    { label: 'Programiz — C Arrays', url: 'https://www.programiz.com/c-programming/c-arrays' },
    { label: 'cppreference — Arrays', url: 'https://en.cppreference.com/w/c/language/array' },
  ],
  '6 · Text & Characters': [
    { label: 'Programiz — C Strings', url: 'https://www.programiz.com/c-programming/c-strings' },
    { label: 'cppreference — Null-terminated byte strings', url: 'https://en.cppreference.com/w/c/string/byte' },
  ],
  '7 · Pointers & Memory': [
    { label: 'mycodeschool — Pointers in C/C++ (video playlist)', url: 'https://www.youtube.com/playlist?list=PL2_aWCzGMAwLZp6LMUKI3cc7pgGsasm2_' },
    { label: 'CS50 — Week 4, Memory (pointers, malloc, stack & heap)', url: 'https://cs50.harvard.edu/x/weeks/4/' },
    { label: 'Jacob Sorber — malloc / calloc / realloc / free (video)', url: 'https://www.youtube.com/watch?v=lQP4X3odvHE' },
  ],
  '8 · Structs & Enums': [
    { label: 'Programiz — C Structures', url: 'https://www.programiz.com/c-programming/c-structures' },
    { label: 'Programiz — C Enums', url: 'https://www.programiz.com/c-programming/c-enumeration' },
  ],
  '9 · Reading Input': [
    { label: 'Programiz — C Input/Output (printf & scanf)', url: 'https://www.programiz.com/c-programming/c-input-output' },
    { label: 'cppreference — scanf family', url: 'https://en.cppreference.com/w/c/io/fscanf' },
  ],
  '10 · Bit Manipulation': [
    { label: 'HackerEarth — Basics of Bit Manipulation', url: 'https://www.hackerearth.com/practice/basic-programming/bit-manipulation/basics-of-bit-manipulation/tutorial/' },
    { label: 'GeeksforGeeks — All about Bit Manipulation', url: 'https://www.geeksforgeeks.org/dsa/all-about-bit-manipulation/' },
  ],
  '11 · Data Structures in C': [
    { label: 'mycodeschool — Linked List, implementation in C/C++ (video)', url: 'https://www.youtube.com/watch?v=vcQIFT79_50' },
    { label: 'CS50 — Week 5, Data Structures (lists, trees, hash tables)', url: 'https://cs50.harvard.edu/x/weeks/5/' },
  ],
  '12 · Matrices': [
    { label: '3Blue1Brown — Matrix multiplication as composition (video)', url: 'https://www.youtube.com/watch?v=XkY2DOUCWMU' },
    { label: '3Blue1Brown — Essence of Linear Algebra (playlist)', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
  ],
  '13 · The Matmul Ladder': [
    { label: 'MIT 6.172 — Lecture 1: Introduction & Matrix Multiplication (Leiserson)', url: 'https://www.youtube.com/watch?v=o7h_sYMk_oc' },
    { label: 'MIT 6.172 — full playlist (Lec 8 = Cache-Efficient Algorithms / tiling)', url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP63VIBQVWguXxZZi0566y7Wf' },
  ],
};

// Extra links for specific standout sessions, keyed by exercise id. Merged on top
// of the session's module links.
export const sessionResources: Record<string, CResource[]> = {
  'celsius-to-fahrenheit': [
    { label: 'Programiz — Type Conversion (int vs double)', url: 'https://www.programiz.com/c-programming/c-type-casting' },
  ],
  'make-range': [
    { label: 'cppreference — malloc', url: 'https://en.cppreference.com/w/c/memory/malloc' },
  ],
  'duplicate-array': [
    { label: 'cppreference — malloc', url: 'https://en.cppreference.com/w/c/memory/malloc' },
  ],
  'alloc-filled': [
    { label: 'cppreference — malloc', url: 'https://en.cppreference.com/w/c/memory/malloc' },
  ],
  'matmul-strassen': [
    { label: 'Inside code — Strassen algorithm (divide & conquer, video)', url: 'https://www.youtube.com/watch?v=OSelhO6Qnlc' },
    { label: "TutorialsPoint — Strassen's Matrix Multiplication", url: 'https://www.tutorialspoint.com/data_structures_algorithms/strassens_matrix_multiplication_algorithm.htm' },
  ],
};

/** The full "Go deeper" list for a session: module links + any session standouts +
 *  the whole-track anchors, de-duplicated by URL (first occurrence wins). */
export function resourcesFor(module: string, id: string): CResource[] {
  const merged = [
    ...(moduleResources[module] ?? []),
    ...(sessionResources[id] ?? []),
    ...generalResources,
  ];
  const seen = new Set<string>();
  return merged.filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)));
}
