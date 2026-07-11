# C Track — Curriculum Audit (2026-07-11)

An honest assessment of the `/c-programming` track (121 sessions, 20 modules): can a working
professional learn C from it, how long the basics take, what college courses it maps to, and the
adjacent gaps worth picking up. Written to be candid — where it's thin, it says so.

## 1. Can a working professional learn C from this?

**Yes for the language and its mental models — with two honest caveats.**

What it does genuinely well:
- **Pointers & memory are taught properly and incrementally** (Modules 7 & 16 + Data Structures). This
  is the #1 thing that stops people learning C, and it's handled with care (address-of/deref, out-params,
  malloc/free ownership, function pointers, `stdint`).
- **"Implement it by hand" pedagogy** — you write your own string length, your own matmul, your own
  Bresenham line — which builds real understanding instead of API memorization.
- **Every exercise compiles on real gcc with a verified expected output.** No hand-waved answers; if the
  lesson says the code prints `58 64`, it was compiled and checked.
- **An applied spine** (matrices → matmul performance → vectors → transforms → a software rasterizer that
  draws a 3-D cube) gives a real reason to care and a satisfying capstone.
- **Rich lessons**: concept → worked example → why it matters → the mistakes people actually make → a hint.

The two caveats (what it is *not*):
- **It teaches you to *write and reason about* C, not yet to *build, debug, and ship* C.** There's no
  debugger, no build system, no multi-file project, no memory-bug tooling — because the in-browser sandbox
  compiles a single file. Module 14 teaches the *concept* of headers/prototypes, but you never link two
  `.c` files for real.
- **It's exercise-scale, not project-scale.** Each session is one focused function/program. The graphics
  track is the closest thing to an applied project, but there's no 500-line multi-file program to sink into.

**Bottom line:** excellent for becoming *fluent in the C language and its memory model*. To be
*job-ready in C*, pair it with (a) the tooling/debugging gap below and (b) one or two real multi-file
projects on your own machine.

## 2. How long to learn the basics?

Assuming a **working professional who already codes in another language** (so control flow, loops, and
functions are familiar concepts — the real C-specific learning is pointers, memory, strings, and the
compile/declare model):

| Milestone | Modules | Sessions | Focused hours | Part-time (≈1 hr/day) |
|---|---|---|---|---|
| **The basics** | 1–9 (values → program I/O) | ~46 | **15–25 h** | **1–2 weeks** |
| **Solid C** (adds pointers depth, structs, bits, linked lists/trees) | 1–13 | ~82 | 35–50 h | 3–5 weeks |
| **Everything** (adds preprocessor, files, function pointers, and the full graphics track) | 1–20 | 121 | 70–100 h | 6–10 weeks |

Per-session budget: ~15–35 min (read the lesson, do the exercise, let it sink in); the pointer, string,
and transform sessions run longer. These are "understand it + pass the exercise" hours — true fluency
needs writing your own programs *beyond* the exercises. A complete beginner (not this profile) should
roughly double these.

## 3. College-course equivalence

- **Modules 1–11** ≈ a first-semester **"Introduction to Programming in C" / CS1**, plus the C-language
  and linked-list/tree parts of a **CS2 / intro Data Structures** course. The overlap with **Harvard
  CS50's C weeks** (types, functions, arrays, memory & pointers, data structures) is strong.
- **Modules 12–13** (matrices + the naive→transpose→tiled→Strassen matmul ladder) ≈ the gentle on-ramp of
  an **intro performance-engineering** course — the same opening example as **MIT 6.172**, at a friendlier
  level.
- **Modules 17–20** (vectors → 2D/3D transforms → software rasterizer) ≈ the **math foundations of an
  intro Computer Graphics course** and **linear algebra for games** (the first third of a CG course /
  LearnOpenGL / Scratchapixel).

**Net:** roughly **CS1 + the C/linked-list half of CS2 + a taste of graphics math and performance** —
about **one-and-a-bit semesters of intro CS taught specifically in C**, minus the exams, theory proofs,
and project reports.

**What it is deliberately NOT equivalent to:**
- A full **Data Structures & Algorithms** course — no hash tables, heaps, graphs, balanced trees, or
  big-O analysis depth. *(Note: the sibling algo-harness track in this same repo — 205 algorithm traces —
  is effectively that missing DS&A course. Together they cover far more.)*
- A **Systems Programming** course (**CMU 15-213 / CS:APP**) — no assembly, no cache/memory-hierarchy
  depth, no linking internals, no OS interface.
- **Operating Systems**, **Networking**, or **Compilers**.

## 4. Adjacent gaps to pick up (ranked by ROI for a working pro)

1. **Tooling & debugging** *(highest ROI, biggest gap the sandbox hides)* — compiler flags
   (`-Wall -Wextra -Werror -g -O2`), **gdb** (breakpoints, backtraces, inspecting memory), and
   **valgrind** + **AddressSanitizer/UBSan** for memory bugs. Learning to *debug* C is as important as
   writing it.
2. **Build systems & multi-file projects** — actually splitting `.h`/`.c`, compiling and linking multiple
   translation units, and **make**/**CMake**. Module 14 gives the concept; do it for real on your machine.
3. **Dynamic / real data structures** — growable arrays via `realloc`, **hash tables**, stacks/queues/heaps
   as reusable ADTs, and generic (`void *`) containers. (Lists and trees are covered; these are thin.)
4. **Memory-safety discipline** — leaks, use-after-free, double-free, buffer overflows, and ownership
   conventions, beyond "call `free` once." Pairs with valgrind/ASan above.
5. **The C standard library** — `string.h` (`memcpy`/`memmove`/`strncpy`/`strtok`), `stdlib.h`
   (`qsort`/`bsearch`/`strtol`), `<assert.h>`, and `<errno.h>` + return-code error handling. You
   *implemented these ideas by hand* (great for understanding) but should know the library exists and its
   footguns (e.g. `strncpy` non-termination).
6. **Undefined behavior & portability** — the UB minefield (signed overflow, strict aliasing,
   uninitialized reads, sequence points) and integer-promotion rules. This is what makes C dangerous;
   the track touches it (endianness, unsigned wrap) but not systematically.
7. **Testing your own C** — assert-based checks or a tiny framework (Unity, Check), plus reading other
   people's C.
8. **Concurrency & systems** *(role-dependent)* — `pthreads`, atomics, sockets, `mmap`/syscalls. Only if
   you're heading toward systems, embedded, or backend-in-C work.

**For the graphics goal specifically**, the adjacent picks are already in
[`c-graphics-roadmap.md`](c-graphics-roadmap.md): **raylib** (draw for real on your machine) → **LearnOpenGL**
(the GPU pipeline) → deeper **linear algebra** (3Blue1Brown's full series, Freya Holmér's Math for Game Devs).

## One-line summary
A polished, verified, genuinely-teaches-you **"Programming in C" course (CS1 + half of CS2) with a
standout applied graphics-math spine** — outstanding for learning the *language and its memory model*, best
paired with real tooling (gdb/valgrind), a multi-file project, and a DS&A source (the repo's own algo track)
to reach professional depth.
