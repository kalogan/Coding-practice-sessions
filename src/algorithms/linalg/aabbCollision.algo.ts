import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// AABB overlap — the cheapest collision test in any game engine.
// An Axis-Aligned Bounding Box is just its min/max on each axis: x∈[minX,maxX],
// y∈[minY,maxY]. Two AABBs collide iff their intervals overlap on EVERY axis.
// Overlap on one axis = [max(minA,minB), min(maxA,maxB)]; if that interval has
// positive length on x AND y, the boxes intersect and the overlap area is the
// product of the two interval lengths.
// Box A = x[0,4] y[0,3], Box B = x[2,6] y[1,5]  →  overlap 2×2 = area 4.

interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// closed polyline for a box: bottom-left → bottom-right → top-right → top-left → back
const boxPolyline = (b: Box): Array<[number, number]> => [
  [b.minX, b.minY],
  [b.maxX, b.minY],
  [b.maxX, b.maxY],
  [b.minX, b.maxY],
  [b.minX, b.minY],
];

function run(_input: AlgoInput): AlgoResult {
  const A: Box = { minX: 0, maxX: 4, minY: 0, maxY: 3 };
  const B: Box = { minX: 2, maxX: 6, minY: 1, maxY: 5 };
  const t = new Tracer();

  const xRange: [number, number] = [-1, 7];
  const yRange: [number, number] = [-1, 7];

  const draw = (
    note: string,
    state: { label: string; value: string | number; highlight?: boolean }[],
    opts: { overlap?: Box | null } = {},
  ) => {
    const lines: ChartLine[] = [
      { points: boxPolyline(A), role: 'plain' },
      { points: boxPolyline(B), role: 'active' },
    ];
    if (opts.overlap) {
      lines.push({ points: boxPolyline(opts.overlap), role: 'plain' });
    }
    const points: ChartPoint[] = [
      { x: A.minX, y: A.minY, role: 'plain', label: 'A' },
      { x: B.maxX, y: B.maxY, role: 'active', label: 'B' },
    ];
    if (opts.overlap) {
      const cx = (opts.overlap.minX + opts.overlap.maxX) / 2;
      const cy = (opts.overlap.minY + opts.overlap.maxY) / 2;
      points.push({ x: cx, y: cy, role: 'match', label: 'overlap' });
    }
    t.step({
      view: { kind: 'chart', lines, points, xRange, yRange, xLabel: 'x', yLabel: 'y' },
      state,
      note,
    });
  };

  draw(
    `Two hitboxes as axis-aligned bounding boxes (AABBs). A spans x[${A.minX},${A.maxX}] y[${A.minY},${A.maxY}]; B spans x[${B.minX},${B.maxX}] y[${B.minY},${B.maxY}]. Do these two sprites touch? AABB is the cheapest test to find out.`,
    [
      { label: 'A', value: `x[${A.minX},${A.maxX}] y[${A.minY},${A.maxY}]` },
      { label: 'B', value: `x[${B.minX},${B.maxX}] y[${B.minY},${B.maxY}]` },
    ],
  );

  // --- x axis test ---
  const xLo = Math.max(A.minX, B.minX); // 2
  const xHi = Math.min(A.maxX, B.maxX); // 4
  const xWidth = xHi - xLo; // 2
  const xOverlaps = xWidth > 0;
  draw(
    `X-axis test: overlap = [max(${A.minX},${B.minX}), min(${A.maxX},${B.maxX})] = [${xLo},${xHi}], width ${xWidth}. Width > 0, so the boxes are NOT separated horizontally.`,
    [
      { label: 'x overlap', value: `[${xLo}, ${xHi}]`, highlight: true },
      { label: 'x width', value: xWidth, highlight: true },
      { label: 'x separated?', value: xOverlaps ? 'no' : 'yes' },
    ],
  );

  // --- y axis test ---
  const yLo = Math.max(A.minY, B.minY); // 1
  const yHi = Math.min(A.maxY, B.maxY); // 3
  const yHeight = yHi - yLo; // 2
  const yOverlaps = yHeight > 0;
  draw(
    `Y-axis test: overlap = [max(${A.minY},${B.minY}), min(${A.maxY},${B.maxY})] = [${yLo},${yHi}], height ${yHeight}. Height > 0, so no vertical gap either.`,
    [
      { label: 'y overlap', value: `[${yLo}, ${yHi}]`, highlight: true },
      { label: 'y height', value: yHeight, highlight: true },
      { label: 'y separated?', value: yOverlaps ? 'no' : 'yes' },
    ],
  );

  const collide = xOverlaps && yOverlaps;
  const overlapBox: Box = { minX: xLo, maxX: xHi, minY: yLo, maxY: yHi };
  const answer = collide ? xWidth * yHeight : 0; // 4

  draw(
    `Overlap on BOTH axes ⇒ the boxes collide. The shaded intersection rectangle is x[${xLo},${xHi}] × y[${yLo},${yHi}], so overlap area = ${xWidth}·${yHeight} = ${answer}.`,
    [
      { label: 'collision?', value: collide ? 'YES' : 'no', highlight: true },
      { label: 'overlap area', value: answer, highlight: true },
    ],
    { overlap: overlapBox },
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'aabb-collision',
  title: 'AABB overlap test',
  category: 'Linear Algebra',
  difficulty: 'Easy',
  scenario:
    'Every physics engine runs an AABB (axis-aligned bounding box) overlap test as its first, cheapest collision check — the "broad phase". Wrap each sprite in a rectangle described only by its min/max on x and y, then ask whether those intervals overlap on both axes. If any axis has a gap the objects cannot touch, so you skip the expensive per-pixel or per-polygon test entirely.',
  pattern:
    'Two intervals [aLo,aHi] and [bLo,bHi] overlap iff max(aLo,bLo) < min(aHi,bHi). Two AABBs collide iff their intervals overlap on EVERY axis; the overlap region is the product of the per-axis overlaps. This "separating interval per axis" idea generalizes to the Separating Axis Theorem for arbitrary convex shapes.',
  complexity: 'O(1) — a handful of min/max compares per axis',
  defaultInput: {},
  expected: 4,
  run,
  code: `function aabbOverlapArea(A, B) {
  // overlap on each axis = [max of mins, min of maxes]
  const xLo = Math.max(A.minX, B.minX);
  const xHi = Math.min(A.maxX, B.maxX);
  const yLo = Math.max(A.minY, B.minY);
  const yHi = Math.min(A.maxY, B.maxY);

  const w = xHi - xLo;
  const h = yHi - yLo;

  // collide only if BOTH axes overlap (positive width AND height)
  if (w <= 0 || h <= 0) return 0;   // a gap on some axis -> no touch
  return w * h;                     // area of the intersection rectangle
}`,
  eli5: `## The everyday picture

Draw a tight rectangle around each character in your game — a "bounding box" whose sides line up with the screen's x and y axes. To know if two characters bumped into each other, you just check whether their two rectangles overlap. That's an AABB test.

## What problem it solves

Checking every pixel or every polygon of two sprites is slow. Games have hundreds of objects, so they first do a super-cheap test that throws out pairs that obviously can't touch. AABB is that cheap test — the "broad phase".

## How it works step by step

- A box is just four numbers: minX, maxX, minY, maxY.
- On the x-axis, the overlap runs from max(A.minX, B.minX) to min(A.maxX, B.maxX).
- Do the same on the y-axis.
- If the overlap has positive width AND positive height, the boxes touch.

## Our example

- A covers x[0,4] y[0,3]; B covers x[2,6] y[1,5].
- X overlap is [2,4] → width 2. Y overlap is [1,3] → height 2.
- Both are positive, so they collide, and the shared area is 2·2 = 4.

## Why "every axis" matters

- A gap on even ONE axis means the shapes are pushed apart there and cannot touch — you can stop immediately.
- Only when x AND y both overlap do the rectangles actually intersect.

## Where games use it

- Broad-phase collision before the expensive precise test (per-polygon, per-pixel, or SAT).
- Frustum / screen culling: is this object's box even on screen?
- Trigger volumes and hitboxes for damage, pickups, and doors.

## Common pitfalls

- Use "< " vs "<= " deliberately: touching edges (width exactly 0) usually should NOT count as a collision.
- AABB only bounds the shape loosely — a diagonal sword inside a big box can report overlap without the blades actually meeting, which is why a precise second pass exists.`,
};

export default descriptor;
