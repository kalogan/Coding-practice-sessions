import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// Separating Axis Theorem (SAT) — the standard collision test for convex
// polygons. Claim: two convex shapes are DISJOINT iff there exists a line (an
// "axis") onto which their shadows (projections) don't overlap. You only ever
// have to try a finite set of candidate axes: the normal of every edge of both
// polygons. Project all vertices of both shapes onto an axis, get two 1-D
// intervals, and check if they overlap. If ANY axis gives a gap → separated,
// early-out. If EVERY axis overlaps → they collide.
// T1 = (0,0),(4,0),(0,4)   T2 = (1,1),(5,1),(1,5)  — two overlapping triangles.
// 3 edges + 3 edges = 6 candidate axes, none separates → COLLISION.

type Vec = [number, number];

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1];
// left normal of an edge vector (perpendicular) — the candidate separating axis
const normal = (edge: Vec): Vec => [-edge[1], edge[0]];

// project every vertex of a polygon onto `axis`, return the [min,max] interval
const project = (poly: Vec[], axis: Vec): [number, number] => {
  const ds = poly.map((p) => dot(p, axis));
  return [Math.min(...ds), Math.max(...ds)];
};

// the candidate axes = one edge-normal per edge of the polygon
const edgeNormals = (poly: Vec[]): Vec[] =>
  poly.map((p, i) => normal(sub(poly[(i + 1) % poly.length], p)));

function run(_input: AlgoInput): AlgoResult {
  const T1: Vec[] = [
    [0, 0],
    [4, 0],
    [0, 4],
  ];
  const T2: Vec[] = [
    [1, 1],
    [5, 1],
    [1, 5],
  ];
  const t = new Tracer();

  const xRange: [number, number] = [-2, 7];
  const yRange: [number, number] = [-2, 7];

  const closed = (poly: Vec[]): Vec[] => [...poly, poly[0]]; // repeat first vertex

  const draw = (
    note: string,
    state: { label: string; value: string | number; highlight?: boolean }[],
    opts: { axis?: Vec; done?: boolean } = {},
  ) => {
    const lines: ChartLine[] = [
      { points: closed(T1), role: 'plain' },
      { points: closed(T2), role: 'active' },
    ];
    const points: ChartPoint[] = [
      { x: T1[0][0], y: T1[0][1], role: 'plain', label: 'T1' },
      { x: T2[1][0], y: T2[1][1], role: opts.done ? 'match' : 'active', label: 'T2' },
    ];
    if (opts.axis) {
      // draw the projection axis as a line through the origin, normalized & scaled to fit
      const len = Math.hypot(opts.axis[0], opts.axis[1]) || 1;
      const s = 6 / len;
      lines.push({
        points: [
          [-opts.axis[0] * s, -opts.axis[1] * s],
          [opts.axis[0] * s, opts.axis[1] * s],
        ],
        role: 'active',
      });
    }
    t.step({
      view: { kind: 'chart', lines, points, xRange, yRange, xLabel: 'x', yLabel: 'y' },
      state,
      note,
    });
  };

  draw(
    `Two convex polygons: triangle T1=(0,0),(4,0),(0,4) and triangle T2=(1,1),(5,1),(1,5). Do they collide? SAT says: try to find one axis whose two shadows have a gap. If none exists, they overlap.`,
    [
      { label: 'T1', value: '(0,0),(4,0),(0,4)' },
      { label: 'T2', value: '(1,1),(5,1),(1,5)' },
    ],
  );

  // gather every candidate axis: edge-normals of BOTH polygons
  const axes: Vec[] = [...edgeNormals(T1), ...edgeNormals(T2)];
  const axesTested = axes.length; // 6

  let separated = false;
  let separatingAxisIndex = -1;

  // a couple of representative axes to visualize (first edge of each triangle)
  const showcaseAxes = new Set<number>([0, edgeNormals(T1).length]); // T1 edge0, T2 edge0

  for (let i = 0; i < axes.length; i++) {
    const axis = axes[i];
    const [aLo, aHi] = project(T1, axis);
    const [bLo, bHi] = project(T2, axis);
    // 1-D intervals overlap unless one is entirely past the other
    const gap = aHi < bLo || bHi < aLo;

    if (showcaseAxes.has(i)) {
      draw(
        `Axis ${i + 1} of ${axesTested} (normal of an edge). Project both triangles onto it: T1 shadow ≈ [${aLo.toFixed(1)}, ${aHi.toFixed(1)}], T2 shadow ≈ [${bLo.toFixed(1)}, ${bHi.toFixed(1)}]. They overlap, so this axis does NOT separate the shapes.`,
        [
          { label: 'axis', value: `(${axis[0]}, ${axis[1]})` },
          { label: 'T1 shadow', value: `[${aLo.toFixed(1)}, ${aHi.toFixed(1)}]`, highlight: true },
          { label: 'T2 shadow', value: `[${bLo.toFixed(1)}, ${bHi.toFixed(1)}]`, highlight: true },
          { label: 'gap?', value: gap ? 'YES (separated)' : 'no (overlap)' },
        ],
        { axis },
      );
    }

    if (gap) {
      separated = true;
      separatingAxisIndex = i;
      break; // early-out: one gap is enough to prove they're apart
    }
  }

  // code returns 1 when NO separating axis was found (collision), 0 otherwise
  const answer = separated ? 0 : 1;

  draw(
    separated
      ? `Axis ${separatingAxisIndex + 1} separates the shadows — a gap exists, so the triangles do NOT collide. SAT stops the moment it finds one.`
      : `No separating axis among all ${axesTested} candidates — every projection overlapped. By SAT the two convex triangles must COLLIDE.`,
    [
      { label: 'axes tested', value: axesTested, highlight: true },
      { label: 'separating axis?', value: separated ? `#${separatingAxisIndex + 1}` : 'none' },
      { label: 'collision?', value: answer === 1 ? 'YES' : 'no', highlight: true },
    ],
    { done: answer === 1 },
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'sat-collision',
  title: 'Separating Axis Theorem',
  category: 'Linear Algebra',
  difficulty: 'Hard',
  scenario:
    'The Separating Axis Theorem is how game engines do exact collision between convex polygons (and, in 3-D, convex polyhedra). Two convex shapes miss each other iff you can slip a line between them; equivalently, some axis exists on which their 1-D shadows have a gap. The only axes worth testing are the edge normals of both shapes, so the whole test is a small, bounded loop — and it early-outs the instant it finds a gap.',
  pattern:
    'For each edge-normal axis of both convex shapes, project every vertex of both shapes onto the axis to get two intervals; if the intervals are disjoint on ANY axis the shapes are separated (early-out). If they overlap on EVERY axis the shapes collide. Convexity is essential — it guarantees a single edge-normal set suffices. The minimum overlap across axes also gives the push-out (MTV) vector to resolve the collision.',
  complexity: 'O(n·m) — project m vertices across n candidate axes',
  defaultInput: {},
  expected: 1,
  run,
  code: `function satCollide(A, B) {
  // candidate axes = the edge normals of BOTH convex polygons
  const axes = [...edgeNormals(A), ...edgeNormals(B)];

  for (const axis of axes) {
    const [aLo, aHi] = project(A, axis);   // shadow of A onto axis
    const [bLo, bHi] = project(B, axis);   // shadow of B onto axis

    // if the two shadows have a gap, this axis SEPARATES them
    if (aHi < bLo || bHi < aLo) return 0;  // early-out: no collision
  }
  return 1;   // no separating axis found -> the shapes overlap
}

function project(poly, axis) {
  const ds = poly.map(p => p[0] * axis[0] + p[1] * axis[1]);
  return [Math.min(...ds), Math.max(...ds)];
}

function edgeNormals(poly) {
  return poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const e = [q[0] - p[0], q[1] - p[1]];  // edge vector
    return [-e[1], e[0]];                  // its perpendicular (the axis)
  });
}`,
  eli5: `## The everyday picture

Shine a flashlight at two cardboard shapes and look at the shadows they cast on the wall. If you can find one direction where the two shadows don't touch, the shapes aren't touching either. Try enough directions; if the shadows always overlap, the shapes overlap. That flashlight game is the Separating Axis Theorem.

## What problem it solves

AABB boxes are cheap but sloppy — they say "maybe touching" for lots of near misses. SAT gives the EXACT yes/no for real convex polygons (rotated crates, ship hulls, shields), which is what you need once the cheap broad-phase says two things are close.

## How it works step by step

- Collect candidate directions: the perpendicular (normal) of every edge of both polygons.
- For each direction, flatten both polygons onto it — dot each vertex with the axis to get a low..high interval (its shadow).
- Compare the two intervals. A gap between them means that axis separates the shapes.
- Found a gap? Stop — they're apart. Checked them all with no gap? They collide.

## Our example

- T1=(0,0),(4,0),(0,4) and T2=(1,1),(5,1),(1,5): 3 + 3 = 6 candidate axes.
- On every one of the 6 axes the shadows overlap.
- No separating axis exists, so the two triangles COLLIDE (the code returns 1).

## Why convexity matters

- For a convex shape, the edge normals are the ONLY directions that can ever separate it — a finite, small set.
- A concave (dented) shape can hide a gap that no edge normal reveals, so SAT would lie. Fix: split concave shapes into convex pieces first.

## Where games use it

- Exact collision between rotated boxes, polygons, and convex hulls after the AABB broad phase.
- The smallest overlap across all axes is the Minimum Translation Vector — the direction and distance to push objects apart so they stop interpenetrating.
- 3-D versions add face normals and edge-edge cross products as candidate axes.

## Common pitfalls

- Don't forget the early-out: the first separating axis proves "no collision" — testing the rest is wasted work.
- Both polygons must be convex and share a consistent winding, or the projections mislead you.
- Touching exactly (shadows meeting at a point) is a boundary case — decide up front whether that counts as a hit.`,
};

export default descriptor;
