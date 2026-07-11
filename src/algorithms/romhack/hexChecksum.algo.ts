import type { AlgoDescriptor, AlgoInput, AlgoResult, HexPane } from '../types';
import { Tracer } from '../tracer';

// Cartridge headers carry a checksum so the console can tell a good ROM from a
// corrupted or tampered one. The simplest form is an 8-bit additive checksum:
// add up every header byte and keep the low 8 bits (sum mod 256).
//
// Here the "header" is a fake game title in ASCII — "GAMEBOY!" — and we walk it
// byte by byte, accumulating the sum and reducing it mod 256 as we go.

const HEADER = [0x47, 0x41, 0x4d, 0x45, 0x42, 0x4f, 0x59, 0x21]; // "GAMEBOY!"

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();
  let sum = 0;

  const pane = (cursor: number, seen: number, caption: string): HexPane => ({
    label: 'cartridge title header',
    bytes: HEADER,
    cursor,
    // tint every byte we've already folded into the checksum
    highlights: Array.from({ length: seen }, (_, k) => k),
    ascii: true,
    caption,
  });

  t.step({
    view: { kind: 'hex', panes: [pane(0, 0, 'ASCII gutter reads "GAMEBOY!"')] },
    state: [
      { label: 'sum', value: 0 },
      { label: 'sum mod 256', value: 0 },
    ],
    note: 'An 8-bit additive checksum: add every header byte, keep the low 8 bits (mod 256). Start the running sum at 0.',
  });

  for (let i = 0; i < HEADER.length; i++) {
    const byte = HEADER[i];
    sum += byte;
    const mod = sum % 256;
    const ch = String.fromCharCode(byte);
    const hex = byte.toString(16).toUpperCase().padStart(2, '0');

    t.step({
      view: { kind: 'hex', panes: [pane(i, i + 1, `+0x${hex} ('${ch}') = ${byte}`)] },
      state: [
        { label: 'byte', value: `0x${hex} '${ch}'` },
        { label: 'byte value', value: byte },
        { label: 'sum', value: sum, highlight: true },
        { label: 'sum mod 256', value: mod, highlight: true },
      ],
      note: `Byte ${i}: 0x${hex} ('${ch}') = ${byte}. Running sum = ${sum}, sum mod 256 = ${mod}.`,
    });
  }

  const checksum = sum % 256;

  t.step({
    view: { kind: 'hex', panes: [pane(HEADER.length - 1, HEADER.length, `checksum = ${checksum}`)] },
    state: [
      { label: 'sum', value: sum },
      { label: 'checksum', value: checksum, highlight: true },
    ],
    note: `checksum = ${sum} mod 256 = ${checksum} — store it so the console can detect a corrupted/edited ROM.`,
  });

  return { steps: t.steps, answer: checksum };
}

const descriptor: AlgoDescriptor = {
  id: 'hex-checksum',
  title: 'Hex dump + checksum',
  category: 'ROM Hacking',
  difficulty: 'Easy',
  scenario:
    "Every cartridge header stores a checksum the console verifies at boot. The simplest is an 8-bit additive checksum: sum all the header bytes and keep the low 8 bits. Here we read a fake title header — the ASCII bytes spell \"GAMEBOY!\" — and fold each byte into a running sum to produce the value the hardware expects.",
  pattern:
    'Additive checksum / rolling accumulation: one linear pass adds each byte into an accumulator, then reduce mod 2^k (here 256) to a fixed-width digest. Cheap to compute, cheap to verify, and any single-byte edit changes the result.',
  complexity: 'O(n) time · O(1) space',
  defaultInput: {},
  expected: 37,
  run,
  code: `function checksum8(header) {
  let sum = 0;
  for (const byte of header) {
    sum += byte;                 // fold each byte in
  }
  return sum % 256;              // keep the low 8 bits
}`,
  eli5: `## The everyday picture

A checksum is like counting the cash in a till and writing the total on a sticky note. Later you recount: if the total doesn't match the note, someone touched the drawer. A ROM checksum is that sticky note for a cartridge's bytes.

## What problem it solves

Cartridges get old, contacts corrode, and hackers edit bytes. The console needs a quick way to ask "are these bytes still the ones the game shipped with?" A checksum answers that in a single pass — no need to store a second full copy.

## How it works step by step

- Start a running total at 0.
- Walk the header one byte at a time, adding each byte's value to the total.
- Keep only the low 8 bits (take the total mod 256) so the result is a single byte.
- Store that byte in the header; at boot the console recomputes it and compares.

## Why mod 256

The result must fit in one byte, and one byte holds 0..255. Taking the sum mod 256 throws away everything above the low 8 bits, giving a compact fixed-size fingerprint the hardware can check instantly.

## The ROM-hacker gotcha

If you edit ANY byte in a checksummed region — change a name, tweak a stat, translate a menu — the sum changes, so the stored checksum no longer matches. Many games refuse to boot, show a corruption screen, or fail validation. After every edit you must RECOMPUTE and rewrite the checksum, or your hack won't run.

## Common pitfalls

- Forgetting the checksum lives INSIDE the header — some formats exclude the checksum bytes themselves from the sum; know your format's rules.
- Byte order / width: an additive 8-bit sum is weak (two offsetting edits can cancel out). Real hardware sometimes uses 16-bit sums or CRCs for that reason.
- Editing the ROM but patching the wrong checksum region, so validation still fails.`,
};

export default descriptor;
