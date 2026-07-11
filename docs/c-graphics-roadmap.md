# Where to go next — finishing C + a path to graphics-with-matrices

Written for someone newish to C (light Arduino a while back) whose north star is **graphics
programming with matrices**. It has two parts: (1) the C topics still missing from the original 13-module
ladder, and (2) a concrete, staged path from "I can write C" to "I can draw transformed 3D things,"
with verified resources.

> **STATUS: BUILT ✅** — Modules 14–20 below are all shipped and live (120 sessions total, gcc-verified).
> The engine now links `-lm` so the math track works. This doc stays as the map of *why* the modules
> are ordered as they are and where to go once you leave the in-browser sandbox (raylib on your own
> machine). Every resource link here is verified.

## The big picture (how the pieces fit)
Graphics is, underneath, **linear algebra you can see**: every point of a 3D model is a vector, and
you *move / rotate / scale / project* it by multiplying it with a matrix. You already have the two
hardest primitives on the ladder — row-major indexing and matrix multiply. Graphics is mostly:
**vector → matrix → matrix·vector → chain of matrices → pixels.** So the plan is to (a) shore up the
remaining general-C skills, then (b) climb a vectors-and-transforms track, then (c) leave the browser
sandbox and actually draw, using a beginner-friendly library.

---

## Part 1 — C topics still missing (to genuinely "finish" the language)
The current ladder (Modules 1–13) covers values, control flow, functions/recursion, arrays, strings,
pointers, structs/enums, stdin I/O, bits, linked lists/trees, matrices, and the matmul ladder. The
gaps below round it out. All are buildable in the existing single-file, gcc-on-Wandbox sandbox unless
noted.

**Module 14 · The Preprocessor & Declarations** *(the "header" concept, single-file-friendly)*
- `#define` constants; function-like macros and their pitfalls (`#define SQ(x) ((x)*(x))`).
- Declaration vs definition: function *prototypes* at the top, definitions below — this is exactly
  what a `.h` header does, taught inside one file.
- `#include`, header guards (`#ifndef/#define/#endif`), and conditional compilation, explained.
- *Resource:* TutorialsPoint — Header Files in C: https://www.tutorialspoint.com/cprogramming/c_header_files.htm

**Module 15 · Files & Bigger Programs**
- File I/O: `fopen`/`fprintf`/`fscanf`/`fclose` — write a file then read it back in the same program
  (this verifies fine in the sandbox). `fgets` line reading.
- `typedef` (naming your own types), `union` (overlapping storage), `const`/`static` and scope.
- *Resources:* Programiz — Files I/O: https://www.programiz.com/c-programming/c-file-input-output ·
  GeeksforGeeks — File Handling: https://www.geeksforgeeks.org/c/basics-file-handling-c/

**Module 16 · Pointers, Level 2**
- **Function pointers** and callbacks (the idea behind `qsort`), a comparator exercise.
- Pointers-to-pointers, arrays of pointers, `const`-correctness with pointers.
- Fixed-width integer types (`stdint.h`: `uint8_t`, `int32_t`), unsigned overflow/wrap — matters for
  pixels/colors and embedded.
- *Resources:* learn-c.org — Function Pointers: https://www.learn-c.org/en/Function_Pointers ·
  GeeksforGeeks — Function Pointer in C: https://www.geeksforgeeks.org/c/function-pointer-in-c/

---

## Part 2 — The graphics-with-matrices track
This is the part you care about. Each rung is small and builds on the last. **Heads-up (engineering):**
rotations and vector length use `sin`, `cos`, `sqrt` from `<math.h>`, which needs the math library
(`-lm`) linked. The sandbox currently compiles *without* `-lm`, so building this track means a one-line
engine change (have the Wandbox compiler pass `-lm`). Small, but worth knowing.

**Module 17 · Vectors** — represent a 2D/3D vector as a `struct { double x, y, z; }`.
- add, subtract, scale; **dot product** (projection, "how aligned"); **length** & **normalize**
  (needs `sqrt`); **cross product** (a perpendicular / surface normal).
- *Resources:* Freya Holmér — Vectors & Dot Product (Math for Game Devs, video):
  https://www.youtube.com/watch?v=MOYiVLEnhrw · 3Blue1Brown — Vectors (chapter 1):
  https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab

**Module 18 · 2D Transform Matrices** — the payoff of matmul.
- Apply a 2×2 / 3×3 matrix to a point (this is `matrix-vector-mul` you already did).
- Build **scale**, **rotation** (`cos/sin`), and — via **homogeneous coordinates** (add a `1`) —
  **translation** as a 3×3 matrix. Why translation needs the extra dimension.
- **Compose** transforms by multiplying matrices; order matters (non-commutative).
- *Resources:* 3Blue1Brown — Matrix multiplication as composition:
  https://www.youtube.com/watch?v=XkY2DOUCWMU · Scratchapixel — Geometry: Matrices:
  https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/matrices.html

**Module 19 · 3D & the Camera** — the rendering pipeline in miniature.
- 4×4 matrices; homogeneous 3D points; translate/scale/rotate in 3D.
- The **Model → View → Projection** chain; what a perspective projection matrix does (divide by depth).
- *Resources:* LearnOpenGL — Transformations: https://learnopengl.com/Getting-started/Transformations ·
  LearnOpenGL — Coordinate Systems: https://learnopengl.com/Getting-started/Coordinate-Systems ·
  Scratchapixel — Perspective/Orthographic Projection Matrix:
  https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

**Module 20 · Software Rasterizer (capstone, optional)** — no GPU, pure C.
- A pixel buffer (2D array of colors); draw a line; fill a triangle; project 3D triangles to 2D and
  render a spinning wireframe/solid cube — using your Module 17–19 code.
- In the sandbox this can output a small PPM image as text (verifiable); on your own machine it can
  open a window (see Part 3).

---

## Part 3 — Actually drawing (leaving the sandbox)
The in-browser IDE can compute and print, but it can't open a graphics window. To *see* pixels, code on
your own machine. The gentlest on-ramp for a beginner in C:

- **raylib** — a simple, friendly C graphics library ("open a window and draw in ~5 lines"). Best first
  step for interactive graphics. https://www.raylib.com/ · examples: https://www.raylib.com/examples.html ·
  intro course: https://github.com/raysan5/raylib-intro-course
- **LearnOpenGL** — when you want to understand the real GPU pipeline (shaders, MVP matrices). The gold
  standard, in C++/C. https://learnopengl.com/
- **Scratchapixel** — computer graphics *from scratch*, matrix-heavy, first principles.
  https://www.scratchapixel.com/
- **Freya Holmér — Math for Game Devs** (full playlist): the visual math behind all of it.
  https://www.youtube.com/@Acegikmo
- **Handmade Hero** (Casey Muratori) — advanced, builds a game engine in C from zero; great once you're
  comfortable. https://handmadehero.org/

### Set up your own machine (so you can run everything above)
1. Install a compiler: on Windows, **MSYS2 + gcc** or **w64devkit**; on Mac, `xcode-select --install`;
   on Linux, `sudo apt install build-essential`.
2. Compile with the math library when you use `<math.h>`: `gcc prog.c -o prog -lm`.
3. For raylib, follow its "Getting Started" (a one-time install), then build its examples.

---

## Suggested order
1. **Finish core C:** Modules 14 → 15 → 16 (no engine change needed).
2. **Graphics math:** Modules 17 → 18 → 19 (needs the `-lm` engine tweak).
3. **Draw for real:** Module 20 in the sandbox (PPM output) *and* raylib on your own machine.

Everything in Parts 1–2 fits the existing zero-wiring `*.cx.ts` + verified-reference model, so it can be
built and shipped the same gate-green, one-batch-at-a-time way as Modules 1–13.
