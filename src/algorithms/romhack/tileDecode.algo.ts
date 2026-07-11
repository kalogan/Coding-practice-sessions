import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// 2bpp tile decoding (Game Boy).
// Scenario: a ROM hacker cracks open a Game Boy cartridge dump and wants to see
// the actual graphics. The console stores each 8×8 tile as 16 bytes = 2 bytes
// per row. For row r, `lo = data[2r]` is the LOW bit-plane and `hi = data[2r+1]`
// is the HIGH bit-plane. The pixel at column c (c=0 is the leftmost = bit 7) has
// a 2-bit colour index `(bit(hi,7−c) << 1) | bit(lo,7−c)`, a value 0..3, which
// we push through a 4-colour palette. Decode all 64 pixels and count the lit
// ones (colour index ≠ 0).

// The 16 tile bytes, interleaved lo,hi per row. The low plane draws the main
// diagonal (colour 1) and the high plane draws the anti-diagonal (colour 2),
// so the decoded tile is an "X".
const TILE = [
  0x80, 0x01, 0x40, 0x02, 0x20, 0x04, 0x10, 0x08, 0x08, 0x10, 0x04, 0x20, 0x02, 0x40, 0x01, 0x80,
];

// index → CSS colour
const PALETTE = ['#0d1117', '#39d353', '#58a6ff', '#f0f6fc'];

// bit n (0..7) of a byte, as 0 or 1
const bit = (byte: number, n: number) => (byte >> n) & 1;

// Decode 16 bytes into an 8×8 array of colour indices (0..3).
function decodeTile(data: number[]): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < 8; r++) {
    const lo = data[2 * r];
    const hi = data[2 * r + 1];
    const row: number[] = [];
    for (let c = 0; c < 8; c++) {
      row.push((bit(hi, 7 - c) << 1) | bit(lo, 7 - c));
    }
    out.push(row);
  }
  return out;
}

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // The fully decoded tile — computed up front so we can reveal it row by row.
  const decoded = decodeTile(TILE);

  // Build the 8×8 render grid, revealing only the first `revealed` rows. Rows
  // not yet decoded stay at the background colour (index 0). In pixel mode the
  // value text is hidden, but we keep the colour index as the value for
  // correctness / inspection.
  const renderGrid = (revealed: number): Cell[][] =>
    Array.from({ length: 8 }, (_row, r) =>
      Array.from({ length: 8 }, (_col, c): Cell => {
        const idx = r < revealed ? decoded[r][c] : 0;
        return { value: idx, fill: PALETTE[idx] };
      }),
    );

  let lit = 0;

  // One step per row: show the two source bytes and reveal that row's pixels.
  for (let r = 0; r < 8; r++) {
    const lo = TILE[2 * r];
    const hi = TILE[2 * r + 1];
    const colours = decoded[r];
    lit += colours.filter((idx) => idx !== 0).length;

    const hex = (b: number) => `0x${b.toString(16).padStart(2, '0')}`;
    t.step({
      view: { kind: 'grid', rows: renderGrid(r + 1), pixel: true },
      state: [
        { label: 'row', value: r },
        { label: 'lit pixels', value: lit, highlight: true },
      ],
      note: `row ${r}: lo=${hex(lo)} hi=${hex(hi)} → colours ${colours.join(',')}`,
    });
  }

  // Final step: the whole X is drawn and the lit-pixel count is settled.
  t.step({
    view: { kind: 'grid', rows: renderGrid(8), pixel: true },
    state: [{ label: 'lit pixels', value: lit, highlight: true }],
    note: `Done. ${lit} lit pixels — the two diagonals of the X.`,
  });

  return { steps: t.steps, answer: lit };
}

const descriptor: AlgoDescriptor = {
  id: 'tile-decode',
  title: 'Decode a 2bpp tile (Game Boy)',
  category: 'ROM Hacking',
  scenario:
    'A ROM hacker dumps a Game Boy cartridge and wants to see its graphics. Each 8×8 tile is stored as 16 bytes — two interleaved bit-planes per row. Decode the bytes back into an 8×8 grid of 4-colour palette pixels.',
  pattern:
    'Two-bit-plane unpacking. For each of the 8 rows, take the low byte (data[2r]) and high byte (data[2r+1]). The pixel at column c reads bit 7−c from each plane and combines them as (hiBit << 1) | loBit into a 0..3 colour index, which indexes a palette. Left-most pixel is the most-significant bit.',
  complexity: 'O(1) — 64 pixels, 16 bytes',
  difficulty: 'Medium',
  eli5: `## Everyday analogy

Imagine two see-through transparencies, each with an 8×8 grid of dots, one dot per cell either inked or blank. Stack them on top of each other. A cell that is blank on both is "colour 0"; inked only on the bottom sheet is "colour 1"; inked only on the top sheet is "colour 2"; inked on both is "colour 3". The Game Boy stores those two sheets as two rows of 8 bits — and stacking them back up is how you recover the picture.

## What problem it solves

A ROM only contains raw bytes. To edit a game's graphics you first have to turn those bytes back into pixels. Game Boy tiles are "2bpp" — 2 bits per pixel — so each pixel is one of 4 shades. This decodes the 16 bytes of one 8×8 tile into a grid of colour indices you can actually look at (and, if you're hacking, repaint).

## How it works step by step

- Walk the 16 bytes two at a time: \`lo = data[2r]\`, \`hi = data[2r+1]\` are the low and high bit-planes of row \`r\`.
- For column \`c\` from left to right, the pixel uses bit \`7 − c\` of each byte (the left-most pixel is the top bit, bit 7).
- Combine them: \`index = (bit(hi, 7−c) << 1) | bit(lo, 7−c)\` — a number 0..3.
- Look that index up in a 4-colour palette to get the shade to draw.

## Why old hardware packed graphics this way

Bit-planes are cheap for hardware. The Game Boy's picture unit fetches two bytes and shifts out one 2-bit pixel per clock — no division, no multiply, just bit selects. Packing 8 pixels into 2 bytes (16 bytes per tile) also keeps cartridge ROM tiny, which mattered when storage was measured in kilobytes.

## How a ROM hacker finds and edits a tile

- Open the ROM in a tile editor (or a hex editor with a 2bpp viewer). You scroll until recognisable shapes — letters, a sprite — snap into focus at the right byte offset.
- Once you find a tile, editing a pixel means flipping the matching bit in BOTH planes: the low plane sets bit 0 of the colour, the high plane sets bit 1. Draw with a new palette index and the editor rewrites those two bytes.
- Save the patched bytes back at the same offset (often distributed as an IPS/BPS patch so nobody has to ship the whole ROM).

## Common pitfalls

Getting the pixel order backwards — column 0 is bit 7, not bit 0, so a mirror-image tile means you indexed \`c\` instead of \`7 − c\`. Swapping the planes (using \`hi\` where \`lo\` belongs) turns colour 1 into colour 2. And forgetting that the two bytes are *interleaved* per row — lo,hi,lo,hi… — rather than all low bytes then all high bytes, which is a different (SNES-style) layout.`,
  defaultInput: {},
  expected: 16,
  run,
  code: `const bit = (byte, n) => (byte >> n) & 1;

// 16 bytes (lo,hi interleaved per row) → 8×8 colour indices (0..3)
function decodeTile(data) {
  const out = [];
  for (let r = 0; r < 8; r++) {
    const lo = data[2 * r];       // low bit-plane
    const hi = data[2 * r + 1];   // high bit-plane
    const row = [];
    for (let c = 0; c < 8; c++) {
      // column 0 is the left-most pixel = bit 7
      row.push((bit(hi, 7 - c) << 1) | bit(lo, 7 - c));
    }
    out.push(row);
  }
  return out;
}`,
};

export default descriptor;
