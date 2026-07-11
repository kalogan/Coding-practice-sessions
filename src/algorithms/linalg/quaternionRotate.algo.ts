import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// Quaternion rotation — how modern engines turn a direction without gimbal lock.
// A rotation is packed into FOUR numbers q = (w, x, y, z). To rotate a vector v
// you treat v as a "pure" quaternion (0, vx, vy, vz) and compute the sandwich
// product v' = q · v · q⁻¹. Here q = (0.5, 0.5, 0.5, 0.5) is the unit quaternion
// for a 120° turn about the (1,1,1) diagonal, which cyclically permutes the axes
// x → y → z → x. Rotating v = (1,0,0) therefore lands exactly on (0,1,0).

type Quat = [number, number, number, number]; // [w, x, y, z]

// Hamilton product a · b (order matters — quaternions do not commute).
const mul = (a: Quat, b: Quat): Quat => {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
};

// For a UNIT quaternion the inverse is just the conjugate (negate x, y, z).
const conjugate = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];

const norm = (q: Quat) => Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  const q: Quat = [0.5, 0.5, 0.5, 0.5]; // 120° about the (1,1,1) axis
  const v: [number, number, number] = [1, 0, 0]; // the basis vector to rotate

  const qLen = norm(q); // exactly 1 → q is a unit quaternion

  const xRange: [number, number] = [-1.5, 1.5];
  const yRange: [number, number] = [-1.5, 1.5];

  // Draw v and (optionally) v' projected onto the XY plane as arrows from origin.
  const draw = (
    note: string,
    state: { label: string; value: string | number; highlight?: boolean }[],
    after?: [number, number, number],
  ) => {
    const lines: ChartLine[] = [{ points: [[0, 0], [v[0], v[1]]], role: 'plain' }];
    const points: ChartPoint[] = [
      { x: v[0], y: v[1], role: 'plain', label: `v=(${v[0]},${v[1]},${v[2]})` },
    ];
    if (after) {
      lines.push({ points: [[0, 0], [after[0], after[1]]], role: 'active' });
      points.push({
        x: after[0],
        y: after[1],
        role: 'match',
        label: `v'=(${after[0]},${after[1]},${after[2]})`,
      });
    }
    t.step({
      view: { kind: 'chart', lines, points, xRange, yRange, xLabel: 'x', yLabel: 'y' },
      state,
      note,
    });
  };

  draw(
    `Our rotation lives in four numbers q=(w,x,y,z)=(${q.join(',')}). Because |q|=${qLen}, q is a UNIT quaternion — it encodes a pure rotation: a 120° turn about the (1,1,1) diagonal.`,
    [
      { label: 'q (w,x,y,z)', value: `(${q.join(', ')})` },
      { label: '|q|', value: qLen },
      { label: 'v (before)', value: `(${v.join(', ')})` },
    ],
  );

  // Promote v to a pure quaternion (0, vx, vy, vz).
  const vq: Quat = [0, v[0], v[1], v[2]];
  draw(
    `To rotate v=(${v.join(',')}) we first write it as a "pure" quaternion with zero real part: (0, ${v[0]}, ${v[1]}, ${v[2]}).`,
    [
      { label: 'v as quat', value: `(0, ${v.join(', ')})`, highlight: true },
      { label: 'q (w,x,y,z)', value: `(${q.join(', ')})` },
    ],
  );

  // First half of the sandwich: q · v.
  const qv = mul(q, vq);
  draw(
    `First multiply q · v using the Hamilton product (quaternions don't commute, so order matters): q · v = (${qv.map((n) => +n.toFixed(2)).join(', ')}).`,
    [
      { label: 'q · v', value: `(${qv.map((n) => +n.toFixed(2)).join(', ')})`, highlight: true },
    ],
  );

  // Second half: (q · v) · q⁻¹. For a unit quaternion, q⁻¹ = conjugate(q).
  const qInv = conjugate(q);
  const result = mul(qv, qInv); // the rotated pure quaternion (0, vx', vy', vz')
  const after: [number, number, number] = [result[1], result[2], result[3]];

  draw(
    `Then multiply by the inverse. Since |q|=1, q⁻¹ is just the conjugate (${qInv.join(',')}). The sandwich (q · v) · q⁻¹ = (${result.map((n) => +n.toFixed(2)).join(', ')}) — the real part is 0, so it's a pure quaternion again, and its vector part is v'=(${after.join(',')}).`,
    [
      { label: "q⁻¹ (conj)", value: `(${qInv.join(', ')})` },
      { label: "v' (after)", value: `(${after.map((n) => +n.toFixed(2)).join(', ')})`, highlight: true },
    ],
    after,
  );

  // Rotation preserves length: |v'| must equal |v| = 1.
  const lenBefore = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  const lenAfter = Math.sqrt(after[0] * after[0] + after[1] * after[1] + after[2] * after[2]);
  draw(
    `Sanity check: a rotation can never stretch a vector, so |v'| must equal |v|. Here |v|=${lenBefore} and |v'|=${+lenAfter.toFixed(2)} — length preserved. The 120° twist cyclically permuted the axes, sending x → y exactly. A quaternion pulls this off with just 4 numbers and never suffers gimbal lock, unlike a full 3×3 rotation matrix (9 numbers) or Euler angles.`,
    [
      { label: '|v|', value: lenBefore },
      { label: "|v'|", value: +lenAfter.toFixed(2) },
      { label: "v' (after)", value: `(${after.map((n) => +n.toFixed(2)).join(', ')})`, highlight: true },
    ],
    after,
  );

  // Score the result vector against the weights (1, 2, 3).
  const answer = Math.round(after[0] * 1 + after[1] * 2 + after[2] * 3); // 0·1 + 1·2 + 0·3 = 2

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'quaternion-rotate',
  title: 'Quaternion rotation (3-D)',
  category: 'Linear Algebra',
  difficulty: 'Hard',
  scenario:
    'Every 3-D game needs to rotate cameras, bones, and projectiles smoothly and without the dreaded "gimbal lock" that plagues Euler angles. Engines store orientation as a unit quaternion — four numbers — and rotate a vector v with the sandwich product v\' = q · v · q⁻¹. Here q=(0.5,0.5,0.5,0.5) is a 120° turn about the (1,1,1) axis, and it sends the basis vector (1,0,0) exactly to (0,1,0).',
  pattern:
    "Treat the vector as a pure quaternion (0, vx, vy, vz), then compute v' = q · v · q⁻¹ with the Hamilton product. For a unit quaternion q⁻¹ is the conjugate (negate x,y,z). Rotation preserves length, and quaternions compose and interpolate (slerp) without gimbal lock — the reason they beat matrices and Euler angles for orientation.",
  complexity: 'O(1) — two 16-multiply quaternion products per rotated vector',
  defaultInput: {},
  expected: 2,
  run,
  code: `// [w, x, y, z]
function mul(a, b) {
  return [
    a[0]*b[0] - a[1]*b[1] - a[2]*b[2] - a[3]*b[3],
    a[0]*b[1] + a[1]*b[0] + a[2]*b[3] - a[3]*b[2],
    a[0]*b[2] - a[1]*b[3] + a[2]*b[0] + a[3]*b[1],
    a[0]*b[3] + a[1]*b[2] - a[2]*b[1] + a[3]*b[0],
  ];
}
const conj = (q) => [q[0], -q[1], -q[2], -q[3]];   // = inverse when |q| = 1

function rotate(q, v) {
  const vq = [0, v[0], v[1], v[2]];                // v as a pure quaternion
  const r = mul(mul(q, vq), conj(q));              // sandwich: q · v · q⁻¹
  return [r[1], r[2], r[3]];                        // vector part = rotated v
}

// q = (0.5,0.5,0.5,0.5) rotates (1,0,0) -> (0,1,0)`,
  eli5: `## The everyday picture

Imagine describing which way a spaceship points. You could list three separate turn angles (yaw, pitch, roll), but those can jam up in a bad way called "gimbal lock" — two of your controls suddenly do the same thing. A quaternion is a smarter way to store the same turn as just four numbers, and it never jams.

## What problem it solves

Games rotate things constantly: the camera, character joints, bullets, planets. They need rotations that combine cleanly, blend smoothly between two orientations, and never gimbal-lock. Quaternions do all three, which is why every serious 3-D engine uses them under the hood.

## How it works step by step

- Store the rotation as q = (w, x, y, z). Ours is (0.5, 0.5, 0.5, 0.5), a 120° turn about the (1,1,1) diagonal.
- Write the vector v = (1,0,0) as a "pure" quaternion (0, 1, 0, 0).
- Sandwich it: v' = q · v · q⁻¹, using the Hamilton product to multiply quaternions.
- Because q is a unit quaternion, q⁻¹ is just its conjugate — flip the sign of x, y, z.
- The result comes out pure again, (0, 0, 1, 0), so the rotated vector is (0, 1, 0): x got spun onto y.

## Why length is preserved

A rotation only turns things, it never stretches them. So |v'| must equal |v|. We start and end at length 1 — a quick, reassuring check that the math didn't corrupt the vector.

## Where games use it

- Camera and character orientation, blended smoothly with "slerp" between two quaternions.
- Skeletal animation: every bone's rotation is a quaternion.
- Physics: tumbling rigid bodies integrate their spin as a quaternion to stay stable.

## Common pitfalls

- Order matters: q · v · q⁻¹ is not the same as q⁻¹ · v · q — quaternion multiplication doesn't commute.
- Only unit quaternions are pure rotations; if q drifts off length 1 (from accumulated rounding) you must renormalize.
- q and −q represent the *same* rotation, which can trip up naive interpolation if you don't pick the shorter path.`,
};

export default descriptor;
