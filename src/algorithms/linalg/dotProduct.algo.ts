import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartLine, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// Dot product — the single most-used number in game math.
// For two vectors u and v, u·v = ux*vx + uy*vy. Its SIGN tells you whether v
// points roughly the same way as u (in front) or the opposite way (behind), and
// its MAGNITUDE tells you how aligned they are. Divide by the two lengths and you
// get cos(angle) directly. Here u=(4,3) and v=(3,4), both length 5.

type Vec = [number, number];

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
const len = (a: Vec) => Math.sqrt(dot(a, a));

function run(_input: AlgoInput): AlgoResult {
  const u: Vec = [4, 3];
  const v: Vec = [3, 4];
  const t = new Tracer();

  const xRange: [number, number] = [-6, 6];
  const yRange: [number, number] = [-6, 6];

  const draw = (
    note: string,
    state: { label: string; value: string | number; highlight?: boolean }[],
    done = false,
  ) => {
    const lines: ChartLine[] = [
      { points: [[0, 0], u], role: 'active' },
      { points: [[0, 0], v], role: 'active' },
    ];
    const points: ChartPoint[] = [
      { x: u[0], y: u[1], role: 'active', label: `u=(${u[0]},${u[1]})` },
      { x: v[0], y: v[1], role: done ? 'match' : 'active', label: `v=(${v[0]},${v[1]})` },
    ];
    t.step({
      view: { kind: 'chart', lines, points, xRange, yRange, xLabel: 'x', yLabel: 'y' },
      state,
      note,
    });
  };

  draw(
    `Two vectors from the origin: u=(${u[0]},${u[1]}) is (say) where an enemy is facing, v=(${v[0]},${v[1]}) points at the player. We want u·v to tell us how aligned they are.`,
    [
      { label: 'u', value: `(${u[0]}, ${u[1]})` },
      { label: 'v', value: `(${v[0]}, ${v[1]})` },
      { label: 'dot so far', value: 0 },
    ],
  );

  // accumulate the products one component at a time
  const p0 = u[0] * v[0];
  draw(
    `First term: multiply the x-components — ux·vx = ${u[0]}·${v[0]} = ${p0}.`,
    [
      { label: 'ux·vx', value: `${u[0]}·${v[0]} = ${p0}`, highlight: true },
      { label: 'dot so far', value: p0 },
    ],
  );

  const p1 = u[1] * v[1];
  const total = p0 + p1;
  draw(
    `Second term: multiply the y-components — uy·vy = ${u[1]}·${v[1]} = ${p1}. Add them: ${p0} + ${p1} = ${total}.`,
    [
      { label: 'uy·vy', value: `${u[1]}·${v[1]} = ${p1}`, highlight: true },
      { label: 'dot so far', value: total, highlight: true },
    ],
  );

  const answer = total; // 24
  const lu = len(u); // 5
  const lv = len(v); // 5
  const cos = answer / (lu * lv); // 24/25 = 0.96

  draw(
    `Dot = ${answer}. Both vectors have length ${lu}, so cosθ = ${answer}/(${lu}·${lv}) = ${answer}/${lu * lv} ≈ ${cos.toFixed(2)}. Nearly 1 → the two directions almost line up: the enemy is essentially "facing" the player.`,
    [
      { label: '|u|', value: lu },
      { label: '|v|', value: lv },
      { label: 'dot', value: answer, highlight: true },
      { label: 'cosθ', value: cos.toFixed(2) },
    ],
    true,
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'dot-product',
  title: 'Dot product',
  category: 'Linear Algebra',
  difficulty: 'Easy',
  scenario:
    'The dot product is how a game answers "is that thing in front of me, and how aligned are we?". Point u where an enemy faces, point v at the player: u·v > 0 means the player is in front, u·v < 0 means behind, and dividing by the lengths gives cos of the angle between them — an instant field-of-view / "can it see me" test.',
  pattern:
    'u·v = ux·vx + uy·vy. Sign = in-front (+) vs behind (−); u·v / (|u||v|) = cos(angle). Used for FOV cones, lighting (N·L), and projecting one vector onto another.',
  complexity: 'O(n) in the dimension — two multiplies and an add in 2-D',
  defaultInput: {},
  expected: 24,
  run,
  code: `function dot(u, v) {
  let sum = 0;
  for (let i = 0; i < u.length; i++) {
    sum += u[i] * v[i];          // ux*vx + uy*vy + ...
  }
  return sum;                     // sign = in-front/behind, size = alignment
}

// angle:  cosTheta = dot(u, v) / (length(u) * length(v))`,
  eli5: `## The everyday picture

Point one arrow the way you're facing and another arrow at your friend. The dot product is a single number that says how much the two arrows "agree". Big positive number: they point almost the same way. Zero: they're at a right angle. Negative: they point opposite ways — your friend is behind you.

## What problem it solves

Games constantly ask "is that thing in front of me?" and "how straight-on am I looking at it?". The dot product answers both with one cheap formula, so you don't need slow trig everywhere.

## How it works step by step

- Multiply the matching parts and add: u·v = ux·vx + uy·vy.
- Here u=(4,3), v=(3,4): 4·3 = 12, then 3·4 = 12, total 24.
- Both arrows happen to be length 5, so cosθ = 24 / (5·5) = 24/25 ≈ 0.96 — almost 1, meaning they nearly line up.

## Why the sign and size matter

- Sign: positive = the other thing is in front of you, negative = behind. That alone powers field-of-view "can the guard see me" checks.
- Size (after dividing by the lengths) = cos of the angle: 1 is dead-on, 0 is sideways, −1 is directly behind.

## Where games use it

- Lighting: surface-normal · light-direction (N·L) decides how bright a face is.
- Projection: how much of one vector lies along another (shadow length, closing speed).
- FOV cones: compare the dot against cos(halfAngle) to see if a target is inside the view cone.

## Common pitfalls

- Forgetting to normalize: u·v mixes angle AND lengths together; divide by |u||v| when you only want the angle.
- Sign confusion: which vector you call "facing" flips what positive means — be consistent.`,
};

export default descriptor;
