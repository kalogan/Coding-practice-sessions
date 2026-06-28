import type { AlgoDescriptor, AlgoInput, AlgoResult, HashBucket } from '../types';
import { Tracer } from '../tracer';

// Hash table with separate chaining.
// Scenario: a hash table spreads keys across a fixed number of buckets so a
// lookup only has to scan one bucket, not the whole collection — that's the
// ~O(1) average promise. Each key is hashed to a bucket index; when two keys
// land in the same bucket that's a COLLISION, and the bucket's chain grows.
//
// Keys come from input.words; the bucket count from input.params.buckets.
// Hash (deterministic): h(key) = (sum of charCodes) % buckets.

interface BucketData {
  entries: { key: string; isNew: boolean }[];
}

function hash(key: string, buckets: number): number {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return sum % buckets;
}

function run(input: AlgoInput): AlgoResult {
  const keys = input.array ? input.array.map(String) : (input.words ?? []);
  const bucketCount = Math.max(1, Math.floor(input.params?.buckets ?? 4));
  const t = new Tracer();

  const table: BucketData[] = Array.from({ length: bucketCount }, () => ({ entries: [] }));
  let collisions = 0;

  // Rebuild the whole table view each step. `activeIndex` is the bucket we just
  // touched (drawn 'active'); the freshly-inserted entry is also 'active'.
  const draw = (activeIndex?: number): HashBucket[] =>
    table.map((bucket, index) => ({
      index,
      role: index === activeIndex ? 'active' : 'plain',
      entries: bucket.entries.map((e) => ({
        key: e.key,
        role: index === activeIndex && e.isNew ? 'active' : 'plain',
      })),
    }));

  t.step({
    view: { kind: 'hashtable', buckets: draw() },
    state: [
      { label: 'buckets', value: bucketCount },
      { label: 'keys left', value: keys.length },
      { label: 'collisions', value: collisions },
    ],
    note: `Empty table with ${bucketCount} buckets. We'll hash each key to a bucket with h(key) = (sum of char codes) % ${bucketCount}, then chain it there.`,
  });

  keys.forEach((key, i) => {
    // Clear the "new" flag from the previous insert so only the current one glows.
    for (const b of table) for (const e of b.entries) e.isNew = false;

    const idx = hash(key, bucketCount);
    const codes = key.split('').map((c) => c.charCodeAt(0));
    const sum = codes.reduce((a, b) => a + b, 0);
    const wasOccupied = table[idx].entries.length > 0;

    if (wasOccupied) collisions += 1;
    table[idx].entries.push({ key, isNew: true });

    const note = wasOccupied
      ? `Insert "${key}": h = (${codes.join('+')}) % ${bucketCount} = ${sum} % ${bucketCount} = ${idx}. Bucket ${idx} is already occupied — COLLISION. Chain "${key}" onto the end of that bucket. (collisions = ${collisions})`
      : `Insert "${key}": h = (${codes.join('+')}) % ${bucketCount} = ${sum} % ${bucketCount} = ${idx}. Bucket ${idx} was empty — drop "${key}" straight in.`;

    t.step({
      view: { kind: 'hashtable', buckets: draw(idx) },
      state: [
        { label: 'inserting', value: key },
        { label: 'bucket', value: idx },
        { label: 'keys left', value: keys.length - i - 1 },
        { label: 'collisions', value: collisions, highlight: wasOccupied },
      ],
      note,
    });
  });

  // Final snapshot with nothing highlighted.
  for (const b of table) for (const e of b.entries) e.isNew = false;
  t.step({
    view: { kind: 'hashtable', buckets: draw() },
    state: [
      { label: 'keys inserted', value: keys.length },
      { label: 'collisions', value: collisions, highlight: true },
    ],
    note: `All ${keys.length} keys placed. ${collisions} of them landed in an already-occupied bucket — that's the collision count.`,
  });

  return { steps: t.steps, answer: collisions };
}

const descriptor: AlgoDescriptor = {
  id: 'hash-table',
  title: 'Hash table: buckets & collisions',
  category: 'Hashing',
  difficulty: 'Medium',
  scenario:
    'A hash table spreads keys across a fixed set of buckets using a hash function, so a lookup only scans one bucket instead of the whole collection. Insert keys one at a time; when two hash to the same bucket, they chain together — a collision.',
  pattern:
    'Hashing + separate chaining: compute h(key) % buckets to pick a slot, then store the key in a list (chain) at that slot. Average O(1) insert/lookup when keys spread evenly; collisions (and a high load factor) degrade it toward O(n) per bucket.',
  complexity: 'O(1) average insert/lookup',
  defaultInput: { words: ['cat', 'dog', 'bird', 'fish', 'ant'], params: { buckets: 4 } },
  expected: 1,
  run,
  code: `function countCollisions(keys, buckets) {
  const table = Array.from({ length: buckets }, () => []);
  let collisions = 0;
  for (const key of keys) {
    let sum = 0;
    for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
    const idx = sum % buckets;          // the hash function
    if (table[idx].length > 0) collisions++; // bucket already used
    table[idx].push(key);               // chain it on
  }
  return collisions;
}`,
  eli5: `## Mailboxes with a naming rule

Imagine an apartment with a wall of numbered mailboxes. Instead of searching every box for your mail, there's a rule: add up the letters of your name and that tells you exactly which box is yours. Now anyone can find your mail in one look — they just run the rule and go straight to that box.

A hash table works the same way. The "rule" is the **hash function**. Here it's \`h(key) = (sum of the letter codes) % numberOfBuckets\`. It turns a key like \`"cat"\` into a bucket number, and you store the key there.

## Why collisions happen

There are way more possible names than there are mailboxes, so sometimes two different names get the same box number. That's a **collision**. We can't throw the second name away, so we use **chaining**: each bucket holds a little list, and a colliding key just gets added to the end of that list. Looking it up means checking the few items in that one bucket.

## Fast on average, slow at worst

- If keys spread out evenly, each bucket holds about one item, so insert and lookup are about \`O(1)\` — one step.
- If a bad hash crams everything into one bucket, that bucket becomes a long list and lookup degrades to \`O(n)\` — you scan everything.

The **load factor** is \`items / buckets\`. Keep it low (add more buckets as it fills) and chains stay short. Pitfall: a clustering hash function (e.g. one that ignores most of the key) piles keys onto a few buckets, and you lose the whole speed advantage.`,
};

export default descriptor;
