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
    { label: 'Programiz — switch…case', url: 'https://www.programiz.com/c-programming/c-switch-case-statement' },
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
  '14 · The Preprocessor & Declarations': [
    { label: 'TutorialsPoint — Header Files in C', url: 'https://www.tutorialspoint.com/cprogramming/c_header_files.htm' },
    { label: 'GeeksforGeeks — C Preprocessors & Macros', url: 'https://www.geeksforgeeks.org/c/cc-preprocessors/' },
  ],
  '15 · Files & Program Structure': [
    { label: 'Programiz — C Files I/O (fopen/fprintf/fscanf)', url: 'https://www.programiz.com/c-programming/c-file-input-output' },
    { label: 'GeeksforGeeks — File Handling in C', url: 'https://www.geeksforgeeks.org/c/basics-file-handling-c/' },
  ],
  '16 · Pointers, Level 2': [
    { label: 'learn-c.org — Function Pointers', url: 'https://www.learn-c.org/en/Function_Pointers' },
    { label: 'GeeksforGeeks — Function Pointer in C', url: 'https://www.geeksforgeeks.org/c/function-pointer-in-c/' },
  ],
  '17 · Vectors': [
    { label: 'Freya Holmér — Vectors & Dot Product (Math for Game Devs, video)', url: 'https://www.youtube.com/watch?v=MOYiVLEnhrw' },
    { label: '3Blue1Brown — Essence of Linear Algebra (playlist)', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
  ],
  '18 · 2D Transform Matrices': [
    { label: '3Blue1Brown — Matrix multiplication as composition (video)', url: 'https://www.youtube.com/watch?v=XkY2DOUCWMU' },
    { label: 'Scratchapixel — Geometry: Matrices', url: 'https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/matrices.html' },
  ],
  '19 · 3D & the Camera': [
    { label: 'LearnOpenGL — Coordinate Systems (Model→View→Projection)', url: 'https://learnopengl.com/Getting-started/Coordinate-Systems' },
    { label: 'Scratchapixel — Building a Perspective Projection Matrix', url: 'https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html' },
  ],
  '20 · Software Rasterizer': [
    { label: 'Scratchapixel — A Gentle Introduction to Computer Graphics', url: 'https://www.scratchapixel.com/lessons/3d-basic-rendering/get-started/gentle-introduction-to-computer-graphics-programming.html' },
    { label: 'raylib — a simple C library to actually draw (window + pixels)', url: 'https://www.raylib.com/' },
  ],
  '21 · Tooling & Debugging': [
    { label: "Beej's Quick Guide to GDB (beginner-friendly debugger tutorial)", url: 'https://beej.us/guide/bggdb/' },
    { label: 'Valgrind — Quick Start Guide (find memory bugs)', url: 'https://valgrind.org/docs/manual/quick-start.html' },
    { label: 'AddressSanitizer — the fast memory error detector', url: 'https://github.com/google/sanitizers/wiki/AddressSanitizer' },
  ],
  '22 · Your First Real Project': [
    { label: 'ssloy/tinyrenderer — build a software renderer from scratch (~500 lines)', url: 'https://github.com/ssloy/tinyrenderer' },
    { label: 'Wavefront .obj file format (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Wavefront_.obj_file' },
    { label: 'raylib — examples gallery (draw for real on your machine)', url: 'https://www.raylib.com/examples.html' },
  ],
};

// Extra links for specific standout sessions, keyed by exercise id. Merged on top
// of the session's module links.
export const sessionResources: Record<string, CResource[]> = {
  'add-two-ints': [
    { label: 'Programiz — Getting Started with C', url: 'https://www.programiz.com/c-programming/getting-started' },
    { label: 'freeCodeCamp — C Programming Tutorial for Beginners (full video)', url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0' },
  ],
  'celsius-to-fahrenheit': [
    { label: 'Programiz — Type Conversion (int vs double)', url: 'https://www.programiz.com/c-programming/type-conversion' },
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
  'matmul-naive': [
    { label: '3Blue1Brown — Matrix multiplication as composition (intuition)', url: 'https://www.youtube.com/watch?v=XkY2DOUCWMU' },
  ],
  'matmul-strassen': [
    { label: 'Inside code — Strassen algorithm (divide & conquer, video)', url: 'https://www.youtube.com/watch?v=OSelhO6Qnlc' },
    { label: "TutorialsPoint — Strassen's Matrix Multiplication", url: 'https://www.tutorialspoint.com/data_structures_algorithms/strassens_matrix_multiplication_algorithm.htm' },
  ],
  // The bridge to graphics: applying a matrix to a vector IS a transform.
  'matrix-vector-mul': [
    { label: 'LearnOpenGL — Transformations (matrices move points)', url: 'https://learnopengl.com/Getting-started/Transformations' },
    { label: 'Scratchapixel — Geometry: Matrices', url: 'https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/matrices.html' },
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
