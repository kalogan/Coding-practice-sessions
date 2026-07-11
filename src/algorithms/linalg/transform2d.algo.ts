import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// 2-D transforms with homogeneous 3x3 matrices — the "model matrix" every game
// object carries. A point (x,y) becomes (x,y,1); a 3x3 matrix can then scale,
// rotate AND translate it with one multiply. We take a unit square and apply, in
// order: Scale by 2, Rotate +90° ((x,y)->(-y,x)), Translate by (+1,+2). All
// numbers stay integers, and the final area (shoelace) is exactly 4.

type Mat = [[number, number, number], [number, number, number], [number, number, number]];
type Pt = [number, number];

const scale = (s: number): Mat => [
  [s, 0, 0],
  [0, s, 0],
  [0, 0, 1],
];

// exact +90° rotation: (x,y) -> (-y, x)
const rot90: Mat = [
  [0, -1, 0],
  [1, 0, 0],
  [0, 0, 1],
];

const translate = (tx: number, ty: number): Mat => [
  [1, 0, tx],
  [0, 1, ty],
  [0, 0, 1],
];

const matMul = (a: Mat, b: Mat): Mat => {
  const out: Mat = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) out[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
  return out;
};

const apply = (m: Mat, p: Pt): Pt => {
  const x = m[0][0] * p[0] + m[0][1] * p[1] + m[0][2];
  const y = m[1][0] * p[0] + m[1][1] * p[1] + m[1][2];
  return [x, y];
};

// signed area * 2 via the shoelace formula (integer in, integer out)
const shoelaceArea = (poly: Pt[]): number => {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
};

const fmtMat = (m: Mat): string => m.map((r) => `[${r.join(', ')}]`).join('  ');

function run(_input: AlgoInput): AlgoResult {
  const original: Pt[] = [
    [1, 0],
    [2, 0],
    [2, 1],
    [1, 1],
  ];
  const t = new Tracer();

  const xRange: [number, number] = [-4, 4];
  const yRange: [number, number] = [-4, 4];

  // closed polyline for a chart line (repeat first point)
  const closed = (poly: Pt[]): Pt[] => [...poly, poly[0]];

  const draw = (
    note: string,
    current: Pt[],
    state: { label: string; value: string | number; highlight?: boolean }[],
    done = false,
  ) => {
    const lines: ChartLine[] = [
      { points: closed(original), role: 'plain' },
      { points: closed(current), role: 'active' },
    ];
    const points: ChartPoint[] = current.map((p, i) => ({
      x: p[0],
      y: p[1],
      role: done ? 'match' : 'active',
      label: i === 0 ? `(${p[0]},${p[1]})` : undefined,
    }));
    t.step({
      view: { kind: 'chart', lines, points, xRange, yRange, xLabel: 'x', yLabel: 'y' },
      state,
      note,
    });
  };

  // Stage 0: the original unit square
  draw(
    `Start: a unit square with corners (1,0),(2,0),(2,1),(1,1). Every corner becomes (x,y,1) so a 3×3 matrix can move, spin and resize it with one multiply.`,
    original,
    [{ label: 'corners', value: original.map((p) => `(${p[0]},${p[1]})`).join(' ') }],
  );

  // Stage 1: Scale by 2
  const S = scale(2);
  const afterScale = original.map((p) => apply(S, p));
  draw(
    `Stage 1 — Scale by 2 on both axes. Multiply each corner by S. The square grows to a 2×2 block.`,
    afterScale,
    [
      { label: 'S (scale 2)', value: fmtMat(S), highlight: true },
      { label: 'corners', value: afterScale.map((p) => `(${p[0]},${p[1]})`).join(' ') },
    ],
  );

  // Stage 2: Rotate +90°  (compose R * S so it acts on the ORIGINAL square)
  const RS = matMul(rot90, S);
  const afterRot = original.map((p) => apply(RS, p));
  draw(
    `Stage 2 — Rotate +90° with (x,y)→(−y,x). Compose R·S so the whole thing acts on the original square at once. Rotation preserves area.`,
    afterRot,
    [
      { label: 'R (rotate +90°)', value: fmtMat(rot90), highlight: true },
      { label: 'R·S', value: fmtMat(RS) },
      { label: 'corners', value: afterRot.map((p) => `(${p[0]},${p[1]})`).join(' ') },
    ],
  );

  // Stage 3: Translate by (+1,+2)  (full model matrix M = T * R * S)
  const M = matMul(translate(1, 2), RS);
  const afterAll = original.map((p) => apply(M, p));
  const area = shoelaceArea(afterAll);
  const answer = area; // 4
  draw(
    `Stage 3 — Translate by (+1,+2). The composed model matrix M = T·R·S maps every corner in one multiply. Final square sits at (1,4),(1,6),(−1,6),(−1,4).`,
    afterAll,
    [
      { label: 'T (translate +1,+2)', value: fmtMat(translate(1, 2)), highlight: true },
      { label: 'M = T·R·S', value: fmtMat(M) },
      { label: 'corners', value: afterAll.map((p) => `(${p[0]},${p[1]})`).join(' ') },
    ],
  );

  draw(
    `Shoelace area of the transformed square = ${area}. That checks out: unit area 1 × scale 2 × scale 2 = 4, and rotation + translation don't change area at all.`,
    afterAll,
    [
      { label: 'area (shoelace)', value: area, highlight: true },
      { label: '1 × 2 × 2', value: 4 },
    ],
    true,
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'transform-2d',
  title: 'Transforms: translate · rotate · scale',
  category: 'Linear Algebra',
  difficulty: 'Medium',
  scenario:
    "Every object in a game carries a model matrix: where it is, which way it faces, and how big it is, all packed into one 3×3 (2-D) or 4×4 (3-D) matrix. Homogeneous coordinates — tacking a 1 onto each point — let translation join scale and rotation as a single matrix multiply, so the GPU can transform thousands of vertices with one uniform operation.",
  pattern:
    'Homogeneous coords: (x,y)→(x,y,1). Compose transforms by multiplying matrices; the RIGHTMOST is applied first. Model matrix M = T·R·S (translate ∘ rotate ∘ scale). Scale multiplies area by sx·sy; rotation and translation preserve it.',
  complexity: 'O(1) per point — one 3×3 · vector multiply; O(k) to compose k matrices',
  defaultInput: {},
  expected: 4,
  run,
  code: `// homogeneous point (x, y, 1); matrices are 3x3
const S = [[2,0,0],[0,2,0],[0,0,1]];            // scale 2
const R = [[0,-1,0],[1,0,0],[0,0,1]];           // rotate +90: (x,y)->(-y,x)
const T = [[1,0,1],[0,1,2],[0,0,1]];            // translate (+1,+2)

const M = matMul(T, matMul(R, S));              // model matrix, rightmost applied first
const moved = corners.map((p) => apply(M, p));  // one multiply per corner

// shoelace area of the result == 1 * 2 * 2 == 4 (rotate/translate keep area)`,
  eli5: `## The everyday picture

Think of a sticker (a little square). You can make it bigger, spin it, and slide it somewhere else on the page. A transform matrix is just a rulebook that does all three of those to every corner of the sticker at once.

## What problem it solves

A game has to place, aim and size every object — characters, bullets, trees — many times per frame. Instead of separate code for moving vs spinning vs resizing, we bundle it into ONE matrix per object (the "model matrix") and reuse the same multiply for every corner.

## The homogeneous trick

Scaling and rotating are easy with a 2×2 matrix, but sliding (translation) isn't — you'd have to add, not multiply. The fix: write each point as (x, y, 1) and use a 3×3 matrix. Now translation ALSO becomes a matrix multiply, so everything composes uniformly.

## How it works step by step

- Start with a unit square (area 1).
- Scale by 2: it becomes a 2×2 block (area 4).
- Rotate +90° using (x,y)→(−y,x): it turns a quarter-turn but keeps its size.
- Translate by (+1,+2): it slides over, still the same size.
- We stack these into M = T·R·S. The rightmost matrix (scale) is applied first.

## Why the area stays 4

Only scaling changes area, by sx·sy = 2·2 = 4. Rotation and translation just move points around without stretching, so the shoelace formula on the final corners gives exactly 4.

## Common pitfalls

- Order matters: T·R·S ≠ S·R·T. Rotating then translating is not the same as translating then rotating.
- Reading right-to-left: in M = T·R·S the scale happens first, translate last — the opposite of the writing order.
- Forgetting the homogeneous 1, which quietly drops all translation.`,
};

export default descriptor;
