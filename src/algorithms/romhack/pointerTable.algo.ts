import type { AlgoDescriptor, AlgoInput, AlgoResult, HexPane } from '../types';
import { Tracer } from '../tracer';

// Following a pointer table.
// Scenario: a ROM stores variable-length data (dialogue, item names, level
// layouts) packed somewhere in the file, and keeps a TABLE of fixed-width
// pointers up front — one per entry. Each pointer is a 16-bit LITTLE-ENDIAN
// offset (low byte first) that says where that entry begins. To read entry i:
// jump to slot i in the table, decode its 2-byte offset, seek there, and read
// until the null terminator. This indirection is why text editors have to
// rewrite pointers whenever a string's length changes.

// Three strings to lay out after the table. #1 ("MANA") is the one we follow.
const STRINGS = ['HP', 'MANA', 'GOLD'];
const TARGET = 1; // pointer index to follow

// Build the ROM image: an N-entry table of 16-bit LE offsets, then the strings.
function buildRom(strings: string[]): { bytes: number[]; offsets: number[] } {
  const tableBytes = strings.length * 2; // 2 bytes per pointer

  // Where each string will actually start (after the fixed-size table).
  const offsets: number[] = [];
  let at = tableBytes;
  for (const s of strings) {
    offsets.push(at);
    at += s.length + 1; // +1 for the null terminator
  }

  // First the table (lo, hi per offset), then the null-terminated strings.
  const bytes: number[] = [];
  for (const off of offsets) bytes.push(off & 0xff, (off >> 8) & 0xff);
  for (const s of strings) {
    for (const ch of s) bytes.push(ch.charCodeAt(0));
    bytes.push(0);
  }

  return { bytes, offsets };
}

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  const { bytes } = buildRom(STRINGS);
  const tableBytes = STRINGS.length * 2;

  const pane = (cursor: number, highlights: number[], caption: string): HexPane => ({
    label: 'ROM image — pointer table + strings',
    bytes,
    cursor,
    highlights,
    ascii: true,
    caption,
  });

  const tableRegion = Array.from({ length: tableBytes }, (_v, k) => k);

  // Step 1: the layout — a 6-byte pointer table, then three strings.
  t.step({
    view: { kind: 'hex', panes: [pane(0, tableRegion, 'bytes 0..5 = three 16-bit LE pointers')] },
    state: [
      { label: 'target index', value: TARGET },
      { label: 'decoded offset', value: '—' },
      { label: 'string so far', value: '' },
    ],
    note: `The first ${tableBytes} bytes are a ${STRINGS.length}-entry pointer table (each entry is a 16-bit little-endian offset). The strings follow, each null-terminated. We will follow pointer index ${TARGET}.`,
  });

  // Locate the target pointer's 2 bytes.
  const ptrOff = TARGET * 2;
  const lo = bytes[ptrOff];
  const hi = bytes[ptrOff + 1];
  const ptrBytes = [ptrOff, ptrOff + 1];

  // Step 2: read the low byte.
  t.step({
    view: { kind: 'hex', panes: [pane(ptrOff, ptrBytes, `low byte = 0x${lo.toString(16).padStart(2, '0')} (${lo})`)] },
    state: [
      { label: 'target index', value: TARGET },
      { label: 'lo byte', value: lo, highlight: true },
      { label: 'decoded offset', value: '—' },
    ],
    note: `Pointer ${TARGET} lives at table offset ${ptrOff}. Little-endian: the LOW byte comes first — bytes[${ptrOff}] = ${lo}.`,
  });

  // Step 3: read the high byte and combine.
  const strOff = lo | (hi << 8);
  t.step({
    view: { kind: 'hex', panes: [pane(ptrOff + 1, ptrBytes, `high byte = 0x${hi.toString(16).padStart(2, '0')} (${hi})`)] },
    state: [
      { label: 'lo byte', value: lo },
      { label: 'hi byte', value: hi, highlight: true },
      { label: 'decoded offset', value: strOff, highlight: true },
    ],
    note: `The HIGH byte is bytes[${ptrOff + 1}] = ${hi}. Combine: offset = lo | (hi << 8) = ${lo} | (${hi} << 8) = ${strOff}.`,
  });

  // Step 4: jump to the decoded offset.
  t.step({
    view: { kind: 'hex', panes: [pane(strOff, [strOff], `jumped to offset ${strOff}`)] },
    state: [
      { label: 'decoded offset', value: strOff },
      { label: 'read position', value: strOff, highlight: true },
      { label: 'string so far', value: '' },
    ],
    note: `Seek to offset ${strOff} and start reading the null-terminated string there.`,
  });

  // Step 5+: read the string byte by byte until the null terminator.
  let str = '';
  let p = strOff;
  while (bytes[p] !== 0) {
    const byte = bytes[p];
    const ch = String.fromCharCode(byte);
    str += ch;
    const strBytes = Array.from({ length: p - strOff + 1 }, (_v, k) => strOff + k);

    t.step({
      view: { kind: 'hex', panes: [pane(p, strBytes, `read '${ch}' (0x${byte.toString(16).padStart(2, '0')})`)] },
      state: [
        { label: 'decoded offset', value: strOff },
        { label: 'read position', value: p, highlight: true },
        { label: 'string so far', value: str, highlight: true },
        { label: 'length so far', value: str.length },
      ],
      note: `bytes[${p}] = 0x${byte.toString(16).padStart(2, '0')} = '${ch}'. String so far: "${str}".`,
    });
    p++;
  }

  const length = str.length;
  const strBytes = Array.from({ length: p - strOff }, (_v, k) => strOff + k);

  // Final: hit the null terminator; the length is settled.
  t.step({
    view: { kind: 'hex', panes: [pane(p, strBytes, `null terminator at ${p} — "${str}" is ${length} chars`)] },
    state: [
      { label: 'decoded offset', value: strOff },
      { label: 'string', value: `"${str}"` },
      { label: 'length', value: length, highlight: true },
    ],
    note: `bytes[${p}] = 0x00 ends the string. Entry ${TARGET} is "${str}", ${length} characters (the null terminator is not counted).`,
  });

  return { steps: t.steps, answer: length };
}

const descriptor: AlgoDescriptor = {
  id: 'pointer-table',
  title: 'Following a pointer table',
  category: 'ROM Hacking',
  difficulty: 'Medium',
  scenario:
    'A ROM keeps variable-length data (text, level layouts) elsewhere in the file and stores a table of fixed-width pointers up front — one 16-bit little-endian offset per entry. To read entry i you decode its 2-byte offset (low byte first), seek there, and read to the null terminator. Here we follow pointer index 1 to reach its string and measure its length.',
  pattern:
    'Indexed indirection with little-endian decoding. A fixed-stride table of pointers lets you random-access variable-length records: offset = lo | (hi << 8), then a linear scan to the terminator. The same shape underlies jump tables, string tables, and file-format directories.',
  complexity: 'O(1) lookup + O(len) scan',
  defaultInput: {},
  expected: 4,
  run,
  code: `const STRINGS = ['HP', 'MANA', 'GOLD'];

// Follow pointer index i in a 16-bit little-endian pointer table.
function followPointer(bytes, i) {
  const ptrOff = i * 2;                       // fixed 2-byte stride
  const lo = bytes[ptrOff];                    // low byte first
  const hi = bytes[ptrOff + 1];
  const offset = lo | (hi << 8);               // little-endian decode

  let str = '', p = offset;
  while (bytes[p] !== 0) {                      // read to null terminator
    str += String.fromCharCode(bytes[p]);
    p++;
  }
  return str.length;                           // excludes the terminator
}`,
  eli5: `## Everyday analogy

A pointer table is the table of contents in a book. The contents page doesn't hold the chapters — it holds PAGE NUMBERS. To read chapter 2 you look up its page number, flip to that page, and read until the chapter ends. A ROM does the same: a list of "page numbers" (offsets) up front, and the real data further in.

## What problem it solves

Strings and records have different lengths, so you can't just stride through them at a fixed size. A table of fixed-width pointers fixes that: every entry in the table is the same 2 bytes, so entry i is always at table + i×2, even though the data it points to varies wildly in length.

## How it works step by step

- Compute the table slot: \`ptrOff = i * 2\` (each pointer is 2 bytes).
- Read the two bytes there. They're little-endian, so the LOW byte comes first.
- Combine them into an offset: \`offset = lo | (hi << 8)\`.
- Seek to that offset and read bytes until you hit \`0x00\`, the null terminator.

## Why little-endian

Many consoles (6502, x86, ARM by default) store the least-significant byte first. So the 16-bit value 0x0009 is written as \`09 00\`, not \`00 09\`. Read it the wrong way round and you jump to offset 0x0900 instead of 9 — landing in the middle of nowhere and printing garbage.

## Why editors must fix pointers

Because pointers are absolute positions. If you translate "HP" into a longer word, every string AFTER it shifts to a higher offset — and every pointer to those strings is now wrong. A text editor has to recompute and rewrite the whole pointer table after any length change, or the game reads the wrong bytes.

## Common pitfalls

- Reversing the byte order (big-endian vs little-endian) and jumping to a bogus offset.
- Forgetting the null terminator — counting it in the length, or running off the end because a string was never terminated.
- Editing text without repointing: longer/shorter strings desync every following pointer, corrupting later entries.`,
};

export default descriptor;
