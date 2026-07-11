import type { AlgoDescriptor, AlgoInput, AlgoResult, Cell } from '../types';
import { Tracer } from '../tracer';

// Palette mapping (indexed → RGB).
// Scenario: ROMs almost never store real colours per pixel — that would be
// wasteful. Instead a sprite is a small grid of palette INDICES (here 0..3),
// and a separate 4-entry palette says what colour each index means. Drawing the
// sprite is just "look up each index in the palette." Swap the palette and the
// same index grid recolours instantly — that's how palette-swap enemies and
// day/night tints work without duplicating any graphics.

// A 4×4 indexed image. Every cell is a palette INDEX (0..3), not a colour.
const IMAGE = [
  [0, 1, 1, 0],
  [1, 2, 2, 1],
  [1, 2, 2, 1],
  [3, 1, 1, 3],
];

// The 4-entry palette: index → CSS colour (bg, green, blue, gold).
const PALETTE = ['#0d1117', '#39d353', '#58a6ff', '#f0c000'];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Neutral fill for pixels not yet mapped, so the reveal is visible.
  const UNMAPPED = '#161b22';

  // Build the 4×4 render grid, mapping only the first `rows` rows. Each mapped
  // cell shows its palette INDEX as the value, painted on its mapped colour.
  const renderGrid = (rows: number): Cell[][] =>
    IMAGE.map((row, r) =>
      row.map((idx): Cell =>
        r < rows
          ? { value: idx, fill: PALETTE[idx] }
          : { value: '', fill: UNMAPPED },
      ),
    );

  // Step 1: show the palette itself as a 1×4 strip of swatches.
  t.step({
    view: {
      kind: 'grid',
      rows: [PALETTE.map((colour, idx): Cell => ({ value: idx, fill: colour }))],
      pixel: false,
    },
    state: [
      { label: 'palette size', value: PALETTE.length },
      { label: 'pixels mapped', value: 0 },
      { label: 'distinct colours', value: 0 },
    ],
    note: 'The palette: 4 entries, index 0..3 → a CSS colour. The image stores only these indices, never full colours.',
  });

  // Map the 16 pixels one row at a time, tracking totals as we go.
  const seen = new Set<number>();
  let mapped = 0;

  for (let r = 0; r < IMAGE.length; r++) {
    const row = IMAGE[r];
    for (const idx of row) seen.add(idx);
    mapped += row.length;

    t.step({
      view: { kind: 'grid', rows: renderGrid(r + 1), pixel: false },
      state: [
        { label: 'row', value: r },
        { label: 'row indices', value: row.join(' ') },
        { label: 'pixels mapped', value: mapped, highlight: true },
        { label: 'distinct colours', value: seen.size, highlight: true },
      ],
      note: `Row ${r}: indices [${row.join(', ')}] → each painted with PALETTE[index]. ${mapped}/16 pixels mapped, ${seen.size} distinct colours so far.`,
    });
  }

  const distinct = seen.size;

  // Final: the whole sprite is rendered and the distinct-colour count settled.
  t.step({
    view: { kind: 'grid', rows: renderGrid(IMAGE.length), pixel: false },
    state: [
      { label: 'pixels mapped', value: mapped },
      { label: 'distinct colours', value: distinct, highlight: true },
    ],
    note: `Done. The sprite uses ${distinct} distinct palette indices. Swap the 4-entry palette and this same index grid recolours — no pixels touched.`,
  });

  return { steps: t.steps, answer: distinct };
}

const descriptor: AlgoDescriptor = {
  id: 'palette-map',
  title: 'Palette mapping (indexed → RGB)',
  category: 'ROM Hacking',
  difficulty: 'Easy',
  scenario:
    'A ROM stores a sprite as a grid of palette INDICES (0..3), not real colours, plus a tiny 4-entry palette that says what each index means. Rendering is one lookup per pixel: colour = palette[index]. The payoff is palette swapping — recolour an enemy or apply a day/night tint by editing one small table, with the pixel data untouched.',
  pattern:
    'Indirection through a lookup table. Store compact indices, keep the expensive values (colours) in a shared table, and resolve index → value at draw time. Counting the distinct indices used tells you how many palette entries the image actually needs.',
  complexity: 'O(n) — one lookup per pixel',
  defaultInput: {},
  expected: 4,
  run,
  code: `const IMAGE = [
  [0, 1, 1, 0],
  [1, 2, 2, 1],
  [1, 2, 2, 1],
  [3, 1, 1, 3],
];
const PALETTE = ['#0d1117', '#39d353', '#58a6ff', '#f0c000'];

// Render = one palette lookup per pixel; count the indices actually used.
function paletteMap(image, palette) {
  const seen = new Set();
  const pixels = image.map((row) =>
    row.map((index) => {
      seen.add(index);
      return palette[index];   // indexed → RGB
    }),
  );
  return { pixels, distinct: seen.size };
}`,
  eli5: `## Everyday analogy

Think of a paint-by-numbers page. The page only prints numbers — 1, 2, 3 — in each little region. A separate legend tells you "1 = green, 2 = blue, 3 = gold." The picture is stored as numbers; the legend turns them into colours. Change the legend and the exact same page paints a totally different picture.

## What problem it solves

Storing a real colour for every pixel is expensive, and old cartridges had very little room. So a ROM keeps a grid of small INDICES (here 0..3) plus one tiny palette. Each index is only a couple of bits, and the picture recolours for free by swapping the palette.

## How it works step by step

- Read the image as a grid of indices — every cell is a number 0..3, not a colour.
- For each pixel, look its index up in the palette: \`colour = palette[index]\`.
- Paint that colour into the cell.
- Keep a set of the indices you actually used; its size is how many palette entries the sprite needs.

## Why ROMs separate pixels from the palette

Because it makes recolouring almost free. Palette-swap enemies (the red Goomba vs. the blue one) are the SAME index grid drawn through a DIFFERENT palette. Day/night tints, damage flashes, and team colours all work by editing one small table instead of rewriting every pixel.

## How a ROM hacker uses this

- Find the index grid (the tile/sprite data) and, separately, the palette table — they live at different offsets.
- To recolour, edit the palette entries, not the pixels: change \`palette[1]\` from green to purple and every pixel using index 1 changes at once.
- To add a colour, you may need a free palette slot — if all 4 are used you must repurpose one or the sprite can't show a new shade.

## Common pitfalls

- Editing pixels when you meant to edit the palette (or vice-versa): a recolour is a palette job, a shape change is a pixel job.
- Assuming a fixed palette size — different systems allow 4, 16, or 256 entries; index them wrong and colours smear.
- Forgetting index 0 is often the transparent/background colour, so "recolouring" it can punch holes in the sprite.`,
};

export default descriptor;
