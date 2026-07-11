import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// 2-D cross product — a single scalar that packs two hugely useful facts.
// For u=(ux,uy) and v=(vx,vy):  cross = ux*vy - uy*vx.
// Its ABSOLUTE VALUE is the area of the parallelogram u and v span, and its
// SIGN tells you the turn direction: positive means v is a LEFT (counter-
// clockwise) turn from u, negative a right turn, zero means they're parallel.
// Here u=(4,3), v=(1,2): cross = 4*2 - 3*1 = 5.

type Vec = [number, number];

const cross = (a: Vec, b: Vec) => a[0] * b[1] - a[1] * b[0];

function run(_input: AlgoInput): AlgoResult {
  const u: Vec = [4, 3];
  const v: Vec = [1, 2];
  const t = new Tracer();

  const xRange: [number, number] = [-6, 6];
  const yRange: [number, number] = [-6, 6];

  const uv: Vec = [u[0] + v[0], u[1] + v[1]]; // opposite corner of the parallelogram

  const draw = (
    note: string,
    state: { label: string; value: string | number; highlight?: boolean }[],
    opts: { parallelogram?: boolean; done?: boolean } = {},
  ) => {
    const lines: ChartLine[] = [
      { points: [[0, 0], u], role: 'active' },
      { points: [[0, 0], v], role: 'active' },
    ];
    if (opts.parallelogram) {
      // closed polyline 0 -> u -> u+v -> v -> 0
      lines.push({ points: [[0, 0], u, uv, v, [0, 0]], role: 'plain' });
    }
    const points: ChartPoint[] = [
      { x: u[0], y: u[1], role: 'active', label: `u=(${u[0]},${u[1]})` },
      { x: v[0], y: v[1], role: opts.done ? 'match' : 'active', label: `v=(${v[0]},${v[1]})` },
    ];
    t.step({
      view: { kind: 'chart', lines, points, xRange, yRange, xLabel: 'x', yLabel: 'y' },
      state,
      note,
    });
  };

  draw(
    `Two vectors from the origin: u=(${u[0]},${u[1]}) is where an AI is heading, v=(${v[0]},${v[1]}) points at a waypoint. The 2-D cross product will tell us which way to turn — and the area they span.`,
    [
      { label: 'u', value: `(${u[0]}, ${u[1]})` },
      { label: 'v', value: `(${v[0]}, ${v[1]})` },
    ],
  );

  const term0 = u[0] * v[1];
  const term1 = u[1] * v[0];
  draw(
    `Cross (2-D) is a single scalar: ux·vy − uy·vx = ${u[0]}·${v[1]} − ${u[1]}·${v[0]} = ${term0} − ${term1}.`,
    [
      { label: 'ux·vy', value: `${u[0]}·${v[1]} = ${term0}`, highlight: true },
      { label: 'uy·vx', value: `${u[1]}·${v[0]} = ${term1}`, highlight: true },
    ],
  );

  const answer = cross(u, v); // 5
  draw(
    `Draw the parallelogram u and v span (0 → u → u+v → v → 0). Its area is exactly |cross| = ${Math.abs(answer)}.`,
    [
      { label: 'u+v corner', value: `(${uv[0]}, ${uv[1]})` },
      { label: 'cross', value: answer, highlight: true },
      { label: 'area = |cross|', value: Math.abs(answer) },
    ],
    { parallelogram: true },
  );

  draw(
    `cross = ${answer} > 0 → v is a LEFT turn (counter-clockwise) from u. If it were negative the AI would steer right; zero means dead-ahead / parallel.`,
    [
      { label: 'cross', value: answer, highlight: true },
      { label: 'turn', value: answer > 0 ? 'left (CCW)' : answer < 0 ? 'right (CW)' : 'straight' },
    ],
    { parallelogram: true, done: true },
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'cross-product',
  title: 'Cross product (2-D)',
  category: 'Linear Algebra',
  difficulty: 'Easy',
  scenario:
    'The 2-D cross product is a single number that tells a game which way to turn and how big an area two edges enclose. Sign it and you get "is the target to my left or right?" for AI steering; take its size and you get the area of the parallelogram (or, halved, a triangle). In 3-D the same idea produces surface normals.',
  pattern:
    'cross = ux·vy − uy·vx. Sign = turn direction (+ left/CCW, − right/CW, 0 parallel); |cross| = area of the parallelogram u and v span. Used for which-side-of-a-line tests, winding order, and 3-D normals.',
  complexity: 'O(1) — two multiplies and a subtract',
  defaultInput: {},
  expected: 5,
  run,
  code: `function cross2d(u, v) {
  return u[0] * v[1] - u[1] * v[0];   // scalar: ux*vy - uy*vx
}

// sign > 0  -> v is a LEFT (counter-clockwise) turn from u
// sign < 0  -> v is a RIGHT turn;   0 -> parallel
// |cross|   -> area of the parallelogram spanned by u and v`,
  eli5: `## The everyday picture

Hold your steering wheel pointed one way (u) and imagine where you actually want to go (v). The 2-D cross product is one number that says "turn left" (positive), "turn right" (negative), or "you're already lined up" (zero). Bonus: its size is the area of the slanted box the two arrows make.

## What problem it solves

AI characters constantly need "should I turn left or right to face my target?" and geometry code needs "which side of this line is that point on?". The cross product answers both instantly, without any angle math.

## How it works step by step

- Compute one scalar: cross = ux·vy − uy·vx.
- Here u=(4,3), v=(1,2): 4·2 = 8, 3·1 = 3, so cross = 8 − 3 = 5.
- The parallelogram with sides u and v has area exactly |cross| = 5.

## Why the sign matters

- Positive (like our 5): v is a LEFT / counter-clockwise turn from u.
- Negative: v is a right / clockwise turn.
- Zero: u and v are parallel — no turn needed (or they're on the same line).

## Why the size matters

- |cross| is the parallelogram's area; half of it is the triangle's area.
- That's how engines compute polygon areas, and (in 3-D) the length of a surface normal.

## Where games use it

- Which-side-of-a-line tests for collision and navmesh edges.
- Winding order / back-face culling: a polygon's signed area tells you if it faces the camera.
- Steering: sign of cross(facing, toTarget) picks the turn direction for a chasing enemy.

## Common pitfalls

- Swapping u and v flips the sign — cross(u,v) = −cross(v,u).
- The 2-D "cross" is a scalar, not a vector; that's really the z-component of the 3-D cross with z=0.`,
};

export default descriptor;
