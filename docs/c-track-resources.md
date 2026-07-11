# C Track — Curated "Go Deeper" Resources

Hand-picked, link-verified supplementary material for the `/c-programming` sessions. Organized by
module (sessions in a module share a topic), with a few session-specific standouts called out. Every
link below was found via web search on 2026-07-11; each is a well-established, free resource.

Intended use: wire one or two of these into each session's `lesson` (see "Wiring it in" at the bottom),
or keep this as a reference sheet. Prefer the module row for a session unless a session-specific link is
listed.

## Start-here (whole track)
- **freeCodeCamp — C Programming Tutorial for Beginners** (video, ~4 h, full language): https://www.youtube.com/watch?v=KJgsSFOSQv0
- **Neso Academy — C Programming** (video playlist, ~169 lectures, exam-grade): https://www.youtube.com/playlist?list=PLBlnK6fEyqRggZZgYpPMUxdY1CYkZtARR
- **Programiz — Learn C Programming** (readable tutorials + runnable examples): https://www.programiz.com/c-programming
- **learn-c.org** (free interactive, in-browser exercises): https://www.learn-c.org/
- **cppreference — C** (the authoritative language/library reference): https://en.cppreference.com/w/c
- **W3Schools — C** (beginner-friendly with "Try it yourself"): https://www.w3schools.com/c/

## Per-module

### 1 · Values & Operators
- Programiz — C Operators: https://www.programiz.com/c-programming/c-operators
- W3Schools — C Data Types & Operators: https://www.w3schools.com/c/c_data_types.php
- (video) Neso Academy C playlist, "Operators" lectures: https://www.youtube.com/playlist?list=PLBlnK6fEyqRggZZgYpPMUxdY1CYkZtARR
- Standout — `celsius-to-fahrenheit` (int vs double division): Programiz — Type Conversion: https://www.programiz.com/c-programming/c-type-casting

### 2 · Making Decisions
- Programiz — if…else: https://www.programiz.com/c-programming/c-if-else-statement
- Programiz — switch: https://www.programiz.com/c-programming/switch-statement
- W3Schools — C Conditions: https://www.w3schools.com/c/c_conditions.php

### 3 · Loops
- Programiz — for loop: https://www.programiz.com/c-programming/c-for-loop
- Programiz — while / do…while: https://www.programiz.com/c-programming/c-do-while-loops
- W3Schools — C Loops: https://www.w3schools.com/c/c_for_loop.php

### 4 · Functions & Recursion
- **mycodeschool — Recursion** (video playlist, the classic visual intro): https://www.youtube.com/playlist?list=PL2_aWCzGMAwLz3g66WrxFGSXvSsvyfzCO
- Programiz — C Recursion: https://www.programiz.com/c-programming/c-recursion
- freeCodeCamp — "How Recursion Works, explained with flowcharts and a video": https://www.freecodecamp.org/news/how-recursion-works-explained-with-flowcharts-and-a-video-de61f40cb7f9

### 5 · Arrays
- Programiz — C Arrays: https://www.programiz.com/c-programming/c-arrays
- W3Schools — C Arrays: https://www.w3schools.com/c/c_arrays.php
- cppreference — Arrays: https://en.cppreference.com/w/c/language/array

### 6 · Text & Characters (strings)
- Programiz — C Strings: https://www.programiz.com/c-programming/c-strings
- cppreference — Null-terminated byte strings: https://en.cppreference.com/w/c/string/byte
- W3Schools — C Strings: https://www.w3schools.com/c/c_strings.php

### 7 · Pointers & Memory
- **mycodeschool — Pointers in C/C++** (video playlist, the definitive intro): https://www.youtube.com/playlist?list=PL2_aWCzGMAwLZp6LMUKI3cc7pgGsasm2_
- **CS50 — Week 4, Memory** (pointers, malloc, the stack & heap): https://cs50.harvard.edu/x/weeks/4/
- **Jacob Sorber — malloc / calloc / realloc / free** (video): https://www.youtube.com/watch?v=lQP4X3odvHE
- Programiz — C Pointers: https://www.programiz.com/c-programming/c-pointers
- Standout — `make-range` / `duplicate-array` / `alloc-filled` (heap ownership): cppreference — malloc: https://en.cppreference.com/w/c/memory/malloc

### 8 · Structs & Enums
- Programiz — C Structures: https://www.programiz.com/c-programming/c-structures
- Programiz — C Enums: https://www.programiz.com/c-programming/c-enumeration
- cppreference — struct: https://en.cppreference.com/w/c/language/struct

### 9 · Reading Input (program mode)
- Programiz — C Input/Output (printf & scanf): https://www.programiz.com/c-programming/c-input-output
- cppreference — scanf family: https://en.cppreference.com/w/c/io/fscanf
- cppreference — printf family: https://en.cppreference.com/w/c/io/fprintf

### 10 · Bit Manipulation
- HackerEarth — Basics of Bit Manipulation (tutorial): https://www.hackerearth.com/practice/basic-programming/bit-manipulation/basics-of-bit-manipulation/tutorial/
- GeeksforGeeks — All about Bit Manipulation: https://www.geeksforgeeks.org/dsa/all-about-bit-manipulation/
- (video) C Bitwise Operators — Mastering Bit Manipulation: https://www.youtube.com/watch?v=amH9oupHnWo

### 11 · Data Structures in C
- **mycodeschool — Linked List, implementation in C/C++** (video): https://www.youtube.com/watch?v=vcQIFT79_50
- **mycodeschool — Data Structures** (all playlists — lists, stacks, trees, BSTs): https://www.youtube.com/@mycodeschool/playlists
- **CS50 — Week 5, Data Structures** (linked lists, trees, hash tables): https://cs50.harvard.edu/x/weeks/5/

### 12 · Matrices
- **3Blue1Brown — Matrix multiplication as composition** (video, chapter 4): https://www.youtube.com/watch?v=XkY2DOUCWMU
- 3Blue1Brown — Essence of Linear Algebra (full visual series): https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab

### 13 · The Matmul Ladder (capstone)
- **MIT 6.172 — Lecture 1: Introduction and Matrix Multiplication** (Leiserson; the naive→optimized story in C): https://www.youtube.com/watch?v=o7h_sYMk_oc
  - OCW page (slides + notes): https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/
  - Full 6.172 playlist (incl. Lecture 8, "Cache-Efficient Algorithms" — the tiling lecture): https://www.youtube.com/playlist?list=PLUl4u3cNGP63VIBQVWguXxZZi0566y7Wf
- Standout — `matmul-strassen`:
  - Inside code — Strassen algorithm (divide & conquer), video: https://www.youtube.com/watch?v=OSelhO6Qnlc
  - TutorialsPoint — Strassen's Matrix Multiplication (article + code): https://www.tutorialspoint.com/data_structures_algorithms/strassens_matrix_multiplication_algorithm.htm

## Wiring it in (optional)
To surface these in the teacher panel, add an optional field to `Lesson` in
[`src/c/exercises/types.ts`](../src/c/exercises/types.ts):

```ts
/** further-reading links shown at the bottom of the lesson panel. */
resources?: { label: string; url: string }[];
```

then render a "Go deeper" `<section>` of external links in
[`src/c/LessonPanel.tsx`](../src/c/LessonPanel.tsx) (open in a new tab, `rel="noopener noreferrer"`).
Populate per session, falling back to the module row above when a session has no specific standout.
