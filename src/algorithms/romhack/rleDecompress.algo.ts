import type { AlgoDescriptor, AlgoInput, AlgoResult, HexPane } from '../types';
import { Tracer } from '../tracer';

// Run-Length Encoding was everywhere in cartridge-era games: tile maps, level
// layouts and palettes are full of long repeats, so storing "this byte, N times"
// instead of N copies buys back precious ROM space. Here we DECODE such a stream.
//
// The stream is a sequence of (count, value) pairs. Each pair means: emit `value`
// exactly `count` times. Walk the pairs, expand each run, done.

const COMPRESSED = [0x03, 0xaa, 0x01, 0xbb, 0x04, 0xcc, 0x02, 0x11];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();
  const decompressed: number[] = [];

  const compressedPane = (countIdx: number, caption: string): HexPane => ({
    label: 'compressed (count,value)',
    bytes: COMPRESSED,
    cursor: countIdx,
    highlights: [countIdx + 1], // the value byte that pairs with this count
    ascii: false,
    caption,
  });

  const outputPane = (caption: string): HexPane => ({
    label: 'decompressed',
    bytes: [...decompressed],
    ascii: false,
    caption,
  });

  t.step({
    view: {
      kind: 'hex',
      panes: [
        compressedPane(0, '8 bytes = four (count,value) pairs'),
        outputPane('empty — nothing emitted yet'),
      ],
    },
    state: [{ label: 'bytes written', value: 0 }],
    note: 'The compressed stream is four (count, value) pairs. Read a count, then its value, and write the value that many times.',
  });

  for (let i = 0; i < COMPRESSED.length; i += 2) {
    const count = COMPRESSED[i];
    const value = COMPRESSED[i + 1];

    for (let n = 0; n < count; n++) {
      decompressed.push(value);
    }

    const hex = value.toString(16).toUpperCase().padStart(2, '0');
    t.step({
      view: {
        kind: 'hex',
        panes: [
          compressedPane(i, `pair ${i / 2 + 1}: count=${count}, value=0x${hex}`),
          outputPane(`${decompressed.length} bytes so far`),
        ],
      },
      state: [
        { label: 'pair', value: `${i / 2 + 1} of 4` },
        { label: 'count', value: count },
        { label: 'value', value: `0x${hex}` },
        { label: 'bytes written', value: decompressed.length, highlight: true },
      ],
      note: `count=${count}, value=0x${hex} → write 0x${hex} ${count} time${count === 1 ? '' : 's'}. Output is now ${decompressed.length} bytes.`,
    });
  }

  t.step({
    view: {
      kind: 'hex',
      panes: [
        compressedPane(COMPRESSED.length - 2, 'all four pairs consumed'),
        outputPane(`${decompressed.length} bytes fully expanded`),
      ],
    },
    state: [
      { label: 'compressed size', value: COMPRESSED.length },
      { label: 'decompressed size', value: decompressed.length, highlight: true },
    ],
    note: `Done. 8 compressed bytes expanded into ${decompressed.length} decompressed bytes — that shrink is exactly why cartridges used RLE.`,
  });

  return { steps: t.steps, answer: decompressed.length };
}

const descriptor: AlgoDescriptor = {
  id: 'rle-decompress',
  title: 'RLE decompression',
  category: 'ROM Hacking',
  difficulty: 'Easy',
  scenario:
    "Old cartridges were tiny, so game data was packed with Run-Length Encoding: instead of storing a tile 40 times, the ROM stores \"tile, x40\". To edit a level you first have to DECOMPRESS it — walk the (count, value) pairs and expand each run back into the raw bytes the game actually draws.",
  pattern:
    'Run-length decoding: read fixed-size (count, value) pairs and emit `value` exactly `count` times. A single linear pass over the packed stream reconstructs the original buffer; total output length is the sum of the counts.',
  complexity: 'O(output) time · O(output) space',
  defaultInput: {},
  expected: 10,
  run,
  code: `function rleDecompress(stream) {
  const out = [];
  for (let i = 0; i < stream.length; i += 2) {
    const count = stream[i];
    const value = stream[i + 1];
    for (let n = 0; n < count; n++) {
      out.push(value);              // emit value 'count' times
    }
  }
  return out;                       // reconstructed raw bytes
}`,
  eli5: `## The everyday picture

Imagine texting a friend "I'm boooooored". You could instead write "b + o×6 + red" to save typing. Run-Length Encoding is that trick: store a byte and how many times it repeats, not the repeats themselves. Decompressing just does the repeats for real.

## What problem it solves

Cartridge ROM was measured in kilobytes. Tile maps, backgrounds and palettes have long stretches of the same byte, so storing "value, count" instead of every copy frees up huge amounts of space for actual game content.

## How it works step by step

- Read two bytes at a time: a \`count\` and a \`value\`.
- Write \`value\` into the output \`count\` times.
- Move to the next pair and repeat until the stream ends.
- The final output length is just the sum of all the counts.

## Why cartridges loved it

RLE is cheap to decode (a tight loop the console can run every frame) and it shines on repetitive data — exactly what tile-based graphics and maps are made of. Tiny code, tiny data, big win.

## Where it breaks

RLE only helps when data repeats. Feed it already-varied bytes (noise, compressed audio, encrypted blobs) and every byte becomes its OWN pair — the "compressed" stream is nearly twice the size of the original. That's why later consoles moved to smarter schemes like LZ.

## Common pitfalls

- A \`count\` of 0 (some formats use it as an escape / end marker) — decide what it means before decoding.
- Odd-length streams: a dangling count with no value means you misaligned the pairs somewhere upstream.
- Assuming compression: if you re-compress edited data, verify it still FITS in the original ROM slot.`,
};

export default descriptor;
