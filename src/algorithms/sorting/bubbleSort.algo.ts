import type { AlgoDescriptor, AlgoInput, AlgoResult, BarRole } from '../types';
import { Tracer } from '../tracer';

// Bubble sort.
// Scenario: repeatedly compare adjacent elements and swap them when out of
// order. On every pass the largest remaining value "bubbles" up to the end, so
// the sorted tail grows by one each pass until the whole array is ordered.

function run(input: AlgoInput): AlgoResult {
  const values = (input.array ?? []).slice(); // copy: we reorder this in place
  const n = values.length;
  const t = new Tracer();
  let comparisons = 0;
  let swaps = 0;

  // `sortedFrom` is the first index of the settled tail (everything >= it is sorted).
  let sortedFrom = n;

  // Build a fresh per-bar colour array for a step. The settled tail is 'sorted';
  // everything else is 'plain' unless the caller highlights specific indices.
  const paint = (highlight: Record<number, BarRole> = {}): BarRole[] =>
    values.map((_, i) => {
      if (highlight[i]) return highlight[i];
      return i >= sortedFrom ? 'sorted' : 'plain';
    });

  for (let pass = 0; pass < n - 1; pass++) {
    let swappedThisPass = false;

    for (let i = 0; i < sortedFrom - 1; i++) {
      comparisons++;
      // Show the two adjacent bars we are comparing.
      t.step({
        view: {
          kind: 'array',
          values: values.slice(),
          markers: [],
          bars: paint({ [i]: 'compare', [i + 1]: 'compare' }),
        },
        state: [
          { label: 'pass', value: pass + 1 },
          { label: 'comparisons', value: comparisons, highlight: true },
          { label: 'swaps', value: swaps },
        ],
        note: `Compare bars ${i} (${values[i]}) and ${i + 1} (${values[i + 1]}).`,
      });

      if (values[i] > values[i + 1]) {
        // Out of order: swap the REAL values, then show them recoloured 'swap'.
        const tmp = values[i];
        values[i] = values[i + 1];
        values[i + 1] = tmp;
        swaps++;
        swappedThisPass = true;

        t.step({
          view: {
            kind: 'array',
            values: values.slice(),
            markers: [],
            bars: paint({ [i]: 'swap', [i + 1]: 'swap' }),
          },
          state: [
            { label: 'pass', value: pass + 1 },
            { label: 'comparisons', value: comparisons },
            { label: 'swaps', value: swaps, highlight: true },
          ],
          note: `${values[i + 1]} > ${values[i]}, so swap them. Now ${values[i]} sits before ${values[i + 1]}.`,
        });
      }
    }

    // The largest unsorted element has bubbled to position sortedFrom-1: settle it.
    sortedFrom--;
    t.step({
      view: {
        kind: 'array',
        values: values.slice(),
        markers: [],
        bars: paint(),
      },
      state: [
        { label: 'pass', value: pass + 1 },
        { label: 'comparisons', value: comparisons },
        { label: 'swaps', value: swaps },
      ],
      note: `End of pass ${pass + 1}: ${values[sortedFrom]} is the largest unsorted value and is now settled at index ${sortedFrom}.`,
    });

    // Optimisation: if a pass made no swaps the array is already sorted.
    if (!swappedThisPass) {
      sortedFrom = 0; // everything is settled
      break;
    }
  }

  // Whatever remains at index 0 is also in place once the loop ends.
  sortedFrom = 0;
  t.step({
    view: {
      kind: 'array',
      values: values.slice(),
      markers: [],
      bars: values.map(() => 'sorted' as BarRole),
    },
    state: [
      { label: 'comparisons', value: comparisons },
      { label: 'swaps', value: swaps },
      { label: 'answer', value: values.join(' '), highlight: true },
    ],
    note: `Sorted. ${comparisons} comparisons and ${swaps} swaps total.`,
  });

  return { steps: t.steps, answer: values.join(' ') };
}

const descriptor: AlgoDescriptor = {
  id: 'bubble-sort',
  title: 'Bubble sort',
  category: 'Sorting',
  scenario:
    'Repeatedly walk the list comparing each pair of adjacent items and swapping any that are out of order. Each full pass floats the largest remaining value up to the end, so the sorted tail grows by one until nothing is left to move.',
  pattern:
    'Adjacent-swap sort with a shrinking boundary: after pass p the last p elements are final, so each pass scans one fewer element. A pass with zero swaps means the array is already sorted — stop early.',
  complexity: 'O(n²) time · O(1) space',
  difficulty: 'Easy',
  eli5: `## The everyday picture

Imagine a line of people sorted by height, but they're standing in random order. You walk down the line looking at each neighbouring PAIR. Whenever the taller person is on the left, you ask them to swap places. By the time you reach the end of the line, the very tallest person has been "pushed" all the way to the right edge — they bubbled up to the top. Repeat the walk, and the second-tallest settles next to them, and so on.

## What problem it solves

It puts a list of numbers into order from smallest to largest, using nothing but comparisons of neighbours and swaps.

## How it works, step by step

- We work on a copy \`values\` so we don't mutate the caller's array.
- \`sortedFrom\` marks where the already-settled tail begins; everything at or past it is final.
- The outer \`pass\` loop walks the list repeatedly. The inner loop compares \`values[i]\` with \`values[i + 1]\`; if the left one is bigger, we swap them and set \`swappedThisPass\`.
- After each pass the biggest unsorted value has reached position \`sortedFrom - 1\`, so we shrink \`sortedFrom\` by one — the next pass can skip that settled tail.

## Why it's correct and efficient

Each pass guarantees the largest remaining value reaches its final slot, so after \`n - 1\` passes everything is in place. The \`swappedThisPass\` flag is the clever bit: if a whole pass swaps nothing, the list is already ordered and we \`break\` early.

## Complexity in plain terms

In the worst case (reverse-sorted) we do about n×n comparisons — \`O(n²)\`. We only ever swap in place, so extra memory is \`O(1)\`.

## Common pitfalls

- Forgetting to shrink the inner-loop bound (\`sortedFrom - 1\`) re-checks already-sorted elements — correct but wasteful.
- Dropping the early-exit flag makes a nearly-sorted list still cost the full O(n²).`,
  defaultInput: { array: [5, 2, 8, 1, 4] },
  expected: '1 2 4 5 8',
  run,
  code: `function bubbleSort(values) {
  const a = values.slice();
  for (let pass = 0; pass < a.length - 1; pass++) {
    let swapped = false;
    for (let i = 0; i < a.length - 1 - pass; i++) {
      if (a[i] > a[i + 1]) {            // out of order?
        [a[i], a[i + 1]] = [a[i + 1], a[i]]; // swap
        swapped = true;
      }
    }
    if (!swapped) break;               // already sorted
  }
  return a.join(' ');
}`,
};

export default descriptor;
