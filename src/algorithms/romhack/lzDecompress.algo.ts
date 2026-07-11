import type { AlgoDescriptor, AlgoInput, AlgoResult, HexPane } from '../types';
import { Tracer } from '../tracer';

// LZ (Lempel-Ziv) is how nearly every ROM after the cartridge era squeezed its
// graphics and text — and it is the same idea behind zip, gzip and PNG. The trick:
// instead of re-storing data you have seen before, store a short BACK-REFERENCE
// that says "copy N bytes from M positions ago" out of what you have already
// decompressed. The decoder keeps a sliding window of recent output and copies
// out of itself.
//
// This is LZSS-style decoding. The compressed stream is a list of tokens:
//   literal            → emit one raw byte
//   reference(off,len) → copy `len` bytes starting `off` positions back
// The copy reads from the GROWING output, so an overlapping copy (off < len)
// naturally repeats a short pattern — that is how "AB" becomes "ABABABAB".

type Token = { kind: 'lit'; value: number } | { kind: 'ref'; offset: number; length: number };

const TOKENS: Token[] = [
  { kind: 'lit', value: 0x41 }, // 'A'
  { kind: 'lit', value: 0x42 }, // 'B'
  { kind: 'ref', offset: 2, length: 8 }, // copy "ABABABAB" from 2 back → output "ABABABABAB"
  { kind: 'lit', value: 0x43 }, // 'C'  → final output "ABABABABABC" (11 bytes)
];

// Flatten tokens into displayable bytes: literal = [0x00, value]; ref = [0x01, offset, length].
// `starts[i]` is the byte offset where token i begins, so the cursor can sit on it.
const COMPRESSED: number[] = [];
const STARTS: number[] = [];
const SPANS: number[][] = []; // byte indices belonging to each token
for (const tok of TOKENS) {
  const start = COMPRESSED.length;
  STARTS.push(start);
  if (tok.kind === 'lit') {
    COMPRESSED.push(0x00, tok.value);
  } else {
    COMPRESSED.push(0x01, tok.offset, tok.length);
  }
  SPANS.push(Array.from({ length: COMPRESSED.length - start }, (_, k) => start + k));
}

const hex = (v: number): string => v.toString(16).toUpperCase().padStart(2, '0');
const chr = (v: number): string => (v >= 0x20 && v < 0x7f ? String.fromCharCode(v) : '.');

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();
  const out: number[] = [];

  const inPane = (tokenIdx: number, caption: string): HexPane => ({
    label: 'compressed tokens',
    bytes: COMPRESSED,
    cursor: STARTS[tokenIdx],
    highlights: SPANS[tokenIdx],
    ascii: false,
    caption,
  });

  const outPane = (cursor: number | undefined, highlights: number[], caption: string): HexPane => ({
    label: 'decompressed output',
    bytes: [...out],
    cursor,
    highlights,
    ascii: true,
    caption,
  });

  t.step({
    view: {
      kind: 'hex',
      panes: [
        inPane(0, `${TOKENS.length} tokens: 00=literal(byte), 01=ref(offset,length)`),
        outPane(undefined, [], 'empty — nothing decoded yet'),
      ],
    },
    state: [{ label: 'output length', value: 0 }],
    note: 'The compressed stream is a token list. A literal token emits one byte; a reference token copies bytes we already produced. Decode left to right, growing the output.',
  });

  for (let i = 0; i < TOKENS.length; i++) {
    const tok = TOKENS[i];

    if (tok.kind === 'lit') {
      out.push(tok.value);
      const idx = out.length - 1;
      t.step({
        view: {
          kind: 'hex',
          panes: [
            inPane(i, `token ${i}: literal 0x${hex(tok.value)} ('${chr(tok.value)}')`),
            outPane(idx, [idx], `wrote '${chr(tok.value)}' — ${out.length} bytes`),
          ],
        },
        state: [
          { label: 'token', value: `${i} of ${TOKENS.length}` },
          { label: 'kind', value: 'literal' },
          { label: 'byte', value: `0x${hex(tok.value)} '${chr(tok.value)}'` },
          { label: 'output length', value: out.length, highlight: true },
        ],
        note: `Literal token: emit the raw byte 0x${hex(tok.value)} ('${chr(tok.value)}'). Output is now ${out.length} bytes.`,
      });
    } else {
      const { offset, length } = tok;
      t.step({
        view: {
          kind: 'hex',
          panes: [
            inPane(i, `token ${i}: reference (offset=${offset}, length=${length})`),
            outPane(undefined, [], `about to copy ${length} bytes from ${offset} back`),
          ],
        },
        state: [
          { label: 'token', value: `${i} of ${TOKENS.length}` },
          { label: 'kind', value: 'reference' },
          { label: 'offset', value: offset },
          { label: 'length', value: length },
        ],
        note: `Reference token: copy ${length} bytes starting ${offset} positions back. Because ${offset} < ${length}, the copy overlaps and repeats the short pattern already in the window.`,
      });

      for (let k = 0; k < length; k++) {
        const srcIdx = out.length - offset; // sliding window reads from the growing output
        const byte = out[srcIdx];
        out.push(byte);
        const dstIdx = out.length - 1;
        t.step({
          view: {
            kind: 'hex',
            panes: [
              inPane(i, `copying byte ${k + 1}/${length}`),
              outPane(dstIdx, [srcIdx], `copied '${chr(byte)}' from offset ${srcIdx} → pos ${dstIdx}`),
            ],
          },
          state: [
            { label: 'copy', value: `${k + 1} of ${length}` },
            { label: 'source offset', value: srcIdx, highlight: true },
            { label: 'remaining', value: length - k - 1, highlight: true },
            { label: 'output length', value: out.length },
          ],
          note: `Copy #${k + 1}: read output[${srcIdx}] = 0x${hex(byte)} ('${chr(byte)}') and append it. ${length - k - 1} byte${length - k - 1 === 1 ? '' : 's'} left in this reference.`,
        });
      }
    }
  }

  t.step({
    view: {
      kind: 'hex',
      panes: [
        inPane(TOKENS.length - 1, 'all tokens consumed'),
        outPane(undefined, [], `"${out.map(chr).join('')}" — ${out.length} bytes`),
      ],
    },
    state: [
      { label: 'compressed size', value: COMPRESSED.length },
      { label: 'decompressed size', value: out.length, highlight: true },
    ],
    note: `Done. ${COMPRESSED.length} compressed bytes expanded into ${out.length} bytes ("${out.map(chr).join('')}"). Reusing earlier data instead of re-storing it is the core idea behind every ROM packer — and behind zip, gzip and PNG.`,
  });

  return { steps: t.steps, answer: out.length };
}

const descriptor: AlgoDescriptor = {
  id: 'lz-decompress',
  title: 'LZ decompression (back-references)',
  category: 'ROM Hacking',
  difficulty: 'Medium',
  scenario:
    "Later cartridges packed their graphics and text with LZ-style compression: instead of storing repeated data twice, the stream stores a short back-reference — \"copy N bytes from M positions ago\" — pointing into what has already been decompressed. To edit that data you must first decode the tokens, expanding literals and replaying each back-reference out of a sliding window of recent output.",
  pattern:
    'LZ77 / LZSS decoding with a sliding window: walk a token stream, emit literals directly and resolve each (offset, length) reference by copying from the already-produced output. Copies read from the growing buffer, so an overlapping reference (offset < length) cheaply repeats a pattern.',
  complexity: 'O(output) time · O(output) space',
  defaultInput: {},
  expected: 11,
  run,
  code: `// tokens: {lit, value} | {ref, offset, length}
function lzDecompress(tokens) {
  const out = [];
  for (const tok of tokens) {
    if (tok.kind === 'lit') {
      out.push(tok.value);                 // raw byte
    } else {
      for (let k = 0; k < tok.length; k++) {
        const src = out.length - tok.offset; // read from the sliding window
        out.push(out[src]);                  // overlap ⇒ pattern repeats
      }
    }
  }
  return out;                              // "ABABABABABC" → length 11
}`,
  eli5: `## The everyday picture

Imagine copying a recipe and hitting "stir, stir, stir, stir". Instead of writing "stir" four times, you write "stir" once and then "repeat the last word ×3". LZ compression is that shortcut for bytes: don't re-store data you already wrote — point back at it and say "copy it again".

## What problem it solves

Game art and text are full of repetition: the same tile, the same phrase, the same run of pixels. Storing each copy wastes precious ROM. A back-reference replaces a whole repeated chunk with a tiny "offset, length" pair, so the cartridge holds far more content.

## How it works step by step

- Read the stream token by token.
- A literal token means "here is one raw byte" — just append it.
- A reference token means "copy \`length\` bytes starting \`offset\` positions back" out of what you have already decoded.
- Keep going; the output grows and later references can point at anything already produced.

## The overlapping-copy trick

If the offset is smaller than the length, the copy catches up with itself: you start copying "AB", and by the time you have written a few bytes you are copying the bytes you JUST wrote. That is how "AB" plus a reference of (offset 2, length 8) unrolls into "ABABABABAB" — a repeating pattern stored in only a couple of bytes.

## Why it is everywhere

This is LZ77 / LZSS, and it is the beating heart of zip, gzip, PNG and countless ROM formats. Decoding is a tight, fast loop — perfect for a console unpacking a level on load — while encoding (finding the best matches) is where the cleverness lives.

## Common pitfalls

- Reading the source from a FIXED snapshot instead of the growing output breaks overlapping copies — always read \`out[out.length - offset]\` live.
- Off-by-one offsets: "1 back" vs "0 back" conventions differ between formats.
- A reference that points before the start of the output (offset too large) means a corrupt stream or a wrong window size.`,
};

export default descriptor;
