import type { AlgoDescriptor, AlgoInput, AlgoResult, ListNode, ListPointer } from '../types';
import { Tracer } from '../tracer';

// Floyd's cycle detection — the tortoise & hare.
// Scenario: does this linked list loop forever, or does it end? Two runners walk
// the list: slow takes one step, fast takes two. If the list loops, fast keeps
// lapping the track and eventually lands on the same node as slow. If the list
// ends, fast reaches null first. Constant memory — no "seen" set required.
// A node whose `next` points back to an earlier node draws a curved arc — the loop.

function run(input: AlgoInput): AlgoResult {
  const values = input.array ?? [];
  const n = values.length;
  const cycleTo = input.params?.cycleTo ?? -1;
  const t = new Tracer();

  // next[i] = index this node points at, or null.
  // All nodes point forward; the last node loops back to cycleTo (or null).
  const next: Array<number | null> = values.map((_, i) =>
    i < n - 1 ? i + 1 : cycleTo >= 0 ? cycleTo : null,
  );
  const id = (i: number | null) => (i === null ? null : String(i));

  // nodes we've already touched, for the 'visited' shading
  const seen = new Set<number>();

  let slow: number | null = n > 0 ? 0 : null;
  let fast: number | null = n > 0 ? 0 : null;
  let met = false;

  const nodes = (): ListNode[] =>
    values.map((v, i) => ({
      id: String(i),
      value: v,
      next: id(next[i]),
      role:
        met && i === slow
          ? 'match'
          : i === slow || i === fast
            ? 'active'
            : seen.has(i)
              ? 'visited'
              : 'plain',
    }));
  const cursors = (): ListPointer[] => [
    { label: 'slow', target: id(slow), role: 'slow' },
    { label: 'fast', target: id(fast), role: 'fast' },
  ];
  const stateOf = () => [
    { label: 'slow', value: slow === null ? 'null' : values[slow] },
    { label: 'fast', value: fast === null ? 'null' : values[fast] },
  ];
  const draw = (note: string) =>
    t.step({ view: { kind: 'list', nodes: nodes(), pointers: cursors() }, state: stateOf(), note });

  if (slow !== null) seen.add(slow);

  draw(
    n
      ? `Start: both slow and fast sit on the head (${values[0]}).`
      : 'Empty list — nothing to walk, so there is no cycle.',
  );

  // Tortoise & hare. Each iteration moves slow +1 and fast +2, emitting a step
  // per move. Stop the moment they meet (cycle) or fast falls off the end (no cycle).
  while (fast !== null && next[fast] !== null) {
    // slow advances one step
    slow = next[slow as number];
    if (slow !== null) seen.add(slow);
    draw(`slow steps +1 to ${slow === null ? 'null' : values[slow]}.`);

    // fast advances two steps
    fast = next[next[fast] as number];
    if (fast !== null) seen.add(fast);
    draw(
      fast === null
        ? 'fast steps +2 and runs off the end — no loop to catch.'
        : `fast steps +2 to ${values[fast]}.`,
    );

    if (slow !== null && slow === fast) {
      met = true;
      draw(`slow and fast meet on ${values[slow]} — the list loops here. Cycle detected.`);
      break;
    }
  }

  if (!met) {
    draw('fast reached the end of the list. The two never met — no cycle.');
  }

  return { steps: t.steps, answer: met ? 'cycle detected' : 'no cycle' };
}

const descriptor: AlgoDescriptor = {
  id: 'cycle-detection',
  title: 'Linked-list cycle detection',
  category: 'Linked Lists',
  scenario:
    "Does this linked list end, or does it loop forever? Floyd's tortoise & hare sends two runners down the list — slow one step at a time, fast two. If there's a loop, fast keeps lapping and is guaranteed to collide with slow; if the list ends, fast hits null first. No extra memory, just two pointers.",
  pattern:
    'Two pointers at different speeds. slow = slow.next, fast = fast.next.next each round. If they ever point at the same node, there is a cycle. If fast (or fast.next) reaches null, there is not. O(n) time, O(1) space.',
  complexity: 'O(n) time · O(1) space',
  difficulty: 'Medium',
  eli5: `## The everyday picture

Two runners start together on a track. The tortoise jogs one step at a time; the hare sprints two. If the track is a closed loop, the hare keeps lapping and will eventually catch up to the tortoise from behind — they land on the same spot. If the track is a straight road with a finish line, the hare reaches the end first and the two never meet.

## What problem it solves

It detects whether a linked list loops back on itself (a cycle) or terminates — using no extra memory.

## How it works, step by step

This is Floyd's tortoise & hare:

- \`slow\` and \`fast\` both start on the head.
- Each round: \`slow = next[slow]\` (one step) and \`fast = next[next[fast]]\` (two steps).
- If \`slow === fast\` they collided, so there's a cycle — we set \`met\` and stop.
- The loop guard \`fast !== null && next[fast] !== null\` is what catches the no-cycle case: if \`fast\` can reach \`null\`, the list ends and we exit with no meeting.

## Why it's correct and efficient

Inside a loop the fast pointer gains one position on the slow pointer every round, so the gap between them shrinks by one each time and must eventually hit zero — they're guaranteed to collide. A naive alternative stores every visited node in a "seen" set; the two-pointer trick gets the same answer for free.

## Complexity in plain terms

The pointers traverse at most \`O(n)\` nodes before meeting or hitting the end. Only two pointers are kept regardless of list length — \`O(1)\` space, the headline advantage over a hash-set approach.

## Common pitfalls

- Checking \`next[fast]\` before confirming \`fast\` is non-null dereferences null and crashes — order the guard carefully.
- Starting the pointers on different nodes can produce a false meeting or miss one; both must begin at the head.`,
  defaultInput: { array: [3, 1, 4, 1, 5], params: { cycleTo: 1 } },
  expected: 'cycle detected',
  run,
  code: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;        // tortoise: +1
    fast = fast.next.next;   // hare: +2
    if (slow === fast) return true;  // they collided — there's a loop
  }
  return false;              // fast ran off the end — no loop
}`,
};

export default descriptor;
