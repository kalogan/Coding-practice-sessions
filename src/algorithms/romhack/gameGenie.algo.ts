import type { AlgoDescriptor, AlgoInput, AlgoResult, HexPane } from '../types';
import { Tracer } from '../tracer';

// A Game Genie was a pass-through cartridge: the real game plugged into the top,
// the Genie into the console. While the CPU ran, the Genie watched the address
// bus; whenever the program read a specific ROM address, the Genie substituted
// its OWN byte instead of the cartridge's — infinite lives, super jumps, etc.
//
// You told it what to patch with a 6-letter code. Those letters are NOT English:
// they are a scrambled hex encoding of a 15-bit ADDRESS (0x8000..0xFFFF) plus an
// 8-bit VALUE. Each letter is one hex nibble drawn from a fixed 16-letter
// alphabet, and the bits are shuffled across the six nibbles. Here we DECODE a
// real code back into (address, value) and prove the bit layout by re-ENCODING.

// The ordered alphabet: a letter's value is its index here (A=0 .. N=15).
const ALPHABET = 'APZLGITYEOXUKSVN';

// SXIOPO is the classic Super Mario Bros "infinite lives" code → $91D9 : 0xAD.
const CODE = 'SXIOPO';

/** decode 6 letters → { address, value } using the standard NES 6-letter layout */
function decode(code: string): { nibbles: number[]; address: number; value: number } {
  const n = code.split('').map((ch) => ALPHABET.indexOf(ch));
  const address =
    0x8000 +
    (((n[3] & 7) << 12) |
      ((n[5] & 7) << 8) |
      ((n[4] & 8) << 8) |
      ((n[2] & 7) << 4) |
      ((n[1] & 8) << 4) |
      (n[4] & 7) |
      (n[3] & 8));
  const value = ((n[1] & 7) << 4) | ((n[0] & 8) << 4) | (n[0] & 7) | (n[5] & 8);
  return { nibbles: n, address, value };
}

/** inverse of decode: (address, value) → 6 letters (bit3 of nibble 2 is the 6-letter flag = 0) */
function encode(address: number, value: number): string {
  const a = address - 0x8000;
  const ab = (i: number): number => (a >> i) & 1;
  const vb = (i: number): number => (value >> i) & 1;
  const n = [
    vb(0) | (vb(1) << 1) | (vb(2) << 2) | (vb(7) << 3),
    vb(4) | (vb(5) << 1) | (vb(6) << 2) | (ab(7) << 3),
    ab(4) | (ab(5) << 1) | (ab(6) << 2) | (0 << 3),
    ab(12) | (ab(13) << 1) | (ab(14) << 2) | (ab(3) << 3),
    ab(0) | (ab(1) << 1) | (ab(2) << 2) | (ab(11) << 3),
    ab(8) | (ab(9) << 1) | (ab(10) << 2) | (vb(3) << 3),
  ];
  return n.map((v) => ALPHABET[v]).join('');
}

const hex = (v: number, w: number): string => v.toString(16).toUpperCase().padStart(w, '0');

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Render the code letters as their ASCII bytes so the hex gutter spells the code.
  const asciiBytes = CODE.split('').map((ch) => ch.charCodeAt(0));

  const pane = (cursor: number, seen: number, caption: string): HexPane => ({
    label: 'Game Genie code (ASCII)',
    bytes: asciiBytes,
    cursor,
    highlights: Array.from({ length: seen }, (_, k) => k),
    ascii: true,
    caption,
  });

  const { nibbles, address, value } = decode(CODE);

  t.step({
    view: { kind: 'hex', panes: [pane(0, 0, `code "${CODE}" — six letters, one hex nibble each`)] },
    state: [
      { label: 'alphabet', value: ALPHABET },
      { label: 'address', value: '?' },
      { label: 'value', value: '?' },
    ],
    note: `Each letter is a hex nibble: its value is its position in "${ALPHABET}" (A=0 .. N=15). Six nibbles hold a shuffled 15-bit address + 8-bit value.`,
  });

  for (let i = 0; i < CODE.length; i++) {
    const ch = CODE[i];
    const nib = nibbles[i];
    t.step({
      view: {
        kind: 'hex',
        panes: [pane(i, i + 1, `letter ${i}: '${ch}' → nibble 0x${hex(nib, 1)} (${nib})`)],
      },
      state: [
        { label: 'letter', value: `'${ch}'` },
        { label: 'nibble index', value: i, highlight: true },
        { label: 'nibble value', value: `0x${hex(nib, 1)} (${nib})`, highlight: true },
        { label: 'bits', value: nib.toString(2).padStart(4, '0') },
      ],
      note: `Letter '${ch}' is at index ${nib} in the alphabet, so nibble n${i} = 0x${hex(nib, 1)} = ${nib.toString(2).padStart(4, '0')}b. Its bits get scattered into the address and value fields.`,
    });
  }

  t.step({
    view: {
      kind: 'hex',
      panes: [pane(CODE.length - 1, CODE.length, `decoded → $${hex(address, 4)} : 0x${hex(value, 2)}`)],
    },
    state: [
      { label: 'nibbles', value: nibbles.map((n) => hex(n, 1)).join(' ') },
      { label: 'address', value: `$${hex(address, 4)}`, highlight: true },
      { label: 'value', value: `0x${hex(value, 2)} (${value})`, highlight: true },
    ],
    note: `Applying the bit layout: address = $${hex(address, 4)}, value = 0x${hex(value, 2)} (${value}). At runtime the Genie watches for a CPU read of $${hex(address, 4)} and feeds back 0x${hex(value, 2)} instead of the cartridge's byte.`,
  });

  // Self-check: re-encode the decoded (address, value) and assert it reproduces CODE.
  const reencoded = encode(address, value);
  const roundTrips = reencoded === CODE;
  if (!roundTrips) {
    throw new Error(`Game Genie round-trip failed: encode(${hex(address, 4)}, ${hex(value, 2)}) = "${reencoded}" != "${CODE}"`);
  }

  t.step({
    view: {
      kind: 'hex',
      panes: [pane(CODE.length - 1, CODE.length, `re-encoded "${reencoded}" — matches ✓`)],
    },
    state: [
      { label: 'encode(addr,val)', value: reencoded },
      { label: 'original code', value: CODE },
      { label: 'round-trip', value: roundTrips ? 'PASS ✓' : 'FAIL', highlight: true },
    ],
    note: `Proof the bit layout is right: feeding $${hex(address, 4)} : 0x${hex(value, 2)} back through the inverse encoder yields "${reencoded}", exactly the original code. The answer is the substituted VALUE byte: ${value}.`,
  });

  return { steps: t.steps, answer: value };
}

const descriptor: AlgoDescriptor = {
  id: 'game-genie',
  title: 'Decoding a Game Genie code',
  category: 'ROM Hacking',
  difficulty: 'Hard',
  scenario:
    'A Game Genie was a pass-through cartridge that intercepted the NES CPU\'s reads: when the program fetched a byte from a specific ROM address, the Genie substituted its own byte, turning "3 lives" into "infinite lives". You configured it with a 6-letter code — which is really a scrambled hex encoding of a 15-bit address and an 8-bit value. Decoding one means mapping each letter to a nibble and un-shuffling the bits.',
  pattern:
    'Bit-field packing / unpacking: a fixed alphabet maps letters to nibbles, and named bit-fields are scattered across those nibbles by a known layout. Decode by masking/shifting bits into place; prove correctness by implementing the exact inverse and checking encode(decode(x)) == x.',
  complexity: 'O(1) time · O(1) space (fixed 6 letters)',
  defaultInput: {},
  expected: 173,
  run,
  code: `const ALPHABET = 'APZLGITYEOXUKSVN';   // letter → nibble = indexOf

function decode(code) {
  const n = [...code].map(ch => ALPHABET.indexOf(ch));
  const address = 0x8000 + (
      ((n[3] & 7) << 12)
    | ((n[5] & 7) << 8) | ((n[4] & 8) << 8)
    | ((n[2] & 7) << 4) | ((n[1] & 8) << 4)
    |  (n[4] & 7)       |  (n[3] & 8));
  const value =
      ((n[1] & 7) << 4) | ((n[0] & 8) << 4)
    |  (n[0] & 7)       |  (n[5] & 8);
  return { address, value };
}

// inverse: scatter address/value bits back into six nibbles (n2 bit3 = 6-letter flag = 0)
function encode(address, value) {
  const a = address - 0x8000;
  const ab = i => (a >> i) & 1, vb = i => (value >> i) & 1;
  const n = [
    vb(0) | vb(1)<<1 | vb(2)<<2  | vb(7)<<3,
    vb(4) | vb(5)<<1 | vb(6)<<2  | ab(7)<<3,
    ab(4) | ab(5)<<1 | ab(6)<<2  | 0<<3,
    ab(12)| ab(13)<<1| ab(14)<<2 | ab(3)<<3,
    ab(0) | ab(1)<<1 | ab(2)<<2  | ab(11)<<3,
    ab(8) | ab(9)<<1 | ab(10)<<2 | vb(3)<<3,
  ];
  return n.map(v => ALPHABET[v]).join('');
}

const { address, value } = decode('SXIOPO');   // → $91D9 : 0xAD
console.assert(encode(address, value) === 'SXIOPO');  // round-trips
return value;                                   // 0xAD = 173`,
  eli5: `## The everyday picture

A Game Genie is like a sticky note taped over one number in a rulebook. The game says "you have 3 lives"; the Genie covers that "3" with its own "128" every time the console looks. It never rewrites the cartridge — it just lies about one byte, over and over, as the game reads it.

## What problem it solves

You want to cheat in a game whose code is locked inside a chip you can't rewrite. Instead of editing the ROM, the Genie sits between the cartridge and the console and swaps a chosen byte on the fly. The 6-letter code tells it WHICH address to watch and WHAT byte to hand back.

## Why the code is letters, not numbers

An address ($8000–$FFFF) plus a value is just hex, but hex ("91D9AD") is easy to mistype. So the Genie uses a 16-letter alphabet — "APZLGITYEOXUKSVN" — where each letter is one hex nibble (A=0 … N=15). Six letters carry six nibbles = 24 bits.

## How it works step by step

- Turn each of the 6 letters into a 4-bit nibble via its position in the alphabet.
- The bits of the address and value are deliberately SHUFFLED across those nibbles, so un-shuffle them: mask and shift each nibble's bits into the right address/value position.
- That yields a 15-bit address (added to $8000) and an 8-bit value.
- The console then intercepts every read of that address and returns the value.

## The round-trip proof

Bit-shuffling is easy to get subtly wrong, so we also write the INVERSE — turn (address, value) back into 6 letters — and check it reproduces the original code. "SXIOPO" → $91D9 : 0xAD, and encoding $91D9 : 0xAD gives "SXIOPO" again. If it didn't match, a bit is in the wrong slot.

## Common pitfalls

- Off-by-one in the alphabet: it is "APZLGITYEOXUKSVN", not alphabetical — index IS the value.
- Forgetting the +$8000: NES program ROM lives in the upper half of the address space.
- The third letter's high bit is a 6-vs-8-letter flag (8-letter codes add a "compare" byte); a plain 6-letter decode ignores it, so set it to 0 when encoding.`,
};

export default descriptor;
