import type { AlgoDescriptor, AlgoInput, AlgoResult, ListNode, ListPointer } from '../types';
import { Tracer } from '../tracer';

// Build a doubly linked list, then walk it both ways.
// Scenario: every node knows its `next` AND its `prev`, so you can walk
// head→tail following next, then turn around at the tail and walk back
// tail→head following prev. The renderer draws the back-arrows as a second
// dashed lane the moment `prev` is set on the nodes — that's the "doubly".

function run(input: AlgoInput): AlgoResult {
  const values = input.array ?? [];
  const n = values.length;
  const t = new Tracer();

  const id = (i: number | null) => (i === null ? null : String(i));

  // Build the nodes: next = i+1 (null at tail), prev = i-1 (null at head).
  const nextOf = (i: number): number | null => (i < n - 1 ? i + 1 : null);
  const prevOf = (i: number): number | null => (i > 0 ? i - 1 : null);

  let cur: number | null = null; // the node the cursor is on this step

  const nodes = (visited: boolean[]): ListNode[] =>
    values.map((v, i) => ({
      id: String(i),
      value: v,
      next: id(nextOf(i)),
      prev: id(prevOf(i)),
      role: i === cur ? 'active' : visited[i] ? 'visited' : 'plain',
    }));
  const cursors = (): ListPointer[] => [{ label: 'cur', target: id(cur), role: 'cur' }];
  const draw = (note: string, visited: boolean[], extra: Array<{ label: string; value: string | number; highlight?: boolean }> = []) =>
    t.step({
      view: { kind: 'list', nodes: nodes(visited), pointers: cursors() },
      state: [
        { label: 'cur', value: cur === null ? 'null' : values[cur] },
        ...extra,
      ],
      note,
    });

  // ---- Phase 1: walk forward head → tail, following `next`. ----
  const forward: number[] = [];
  const seenF: boolean[] = values.map(() => false);

  if (n === 0) {
    t.step({
      view: { kind: 'list', nodes: [], pointers: [] },
      state: [{ label: 'forward', value: '' }, { label: 'backward', value: '' }],
      note: 'Empty list: nothing to walk. Answer is an empty forward order and backward order.',
    });
    return { steps: t.steps, answer: ' | ' };
  }

  cur = 0; // head
  draw(
    `Phase 1 — forward. Each node knows its next AND prev (see the dashed back-arrows). Start at the head (${values[0]}).`,
    seenF,
  );

  while (cur !== null) {
    seenF[cur] = true;
    forward.push(values[cur]);
    const nxt = nextOf(cur);
    draw(
      nxt === null
        ? `Visit ${values[cur]} and collect it. next is null — we've reached the tail. Forward order so far: ${forward.join(' ')}.`
        : `Visit ${values[cur]} and collect it, then follow next to ${values[nxt]}. Forward so far: ${forward.join(' ')}.`,
      seenF,
      [{ label: 'forward', value: forward.join(' '), highlight: true }],
    );
    cur = nxt;
  }

  // ---- Phase 2: walk backward tail → head, following `prev`. ----
  const backward: number[] = [];
  const seenB: boolean[] = values.map(() => false);

  cur = n - 1; // tail
  draw(
    `Phase 2 — backward. Because each node also stores prev, we can turn around at the tail (${values[n - 1]}) and walk home following prev.`,
    seenB,
    [{ label: 'forward', value: forward.join(' ') }],
  );

  while (cur !== null) {
    seenB[cur] = true;
    backward.push(values[cur]);
    const prv = prevOf(cur);
    draw(
      prv === null
        ? `Visit ${values[cur]} and collect it. prev is null — we're back at the head. Backward order: ${backward.join(' ')}.`
        : `Visit ${values[cur]} and collect it, then follow prev to ${values[prv]}. Backward so far: ${backward.join(' ')}.`,
      seenB,
      [
        { label: 'forward', value: forward.join(' ') },
        { label: 'backward', value: backward.join(' '), highlight: true },
      ],
    );
    cur = prv;
  }

  const answer = `${forward.join(' ')} | ${backward.join(' ')}`;

  cur = null;
  t.step({
    view: {
      kind: 'list',
      nodes: values.map((v, i) => ({
        id: String(i),
        value: v,
        next: id(nextOf(i)),
        prev: id(prevOf(i)),
        role: 'visited' as const,
      })),
      pointers: [],
    },
    state: [
      { label: 'forward', value: forward.join(' ') },
      { label: 'backward', value: backward.join(' ') },
      { label: 'answer', value: answer, highlight: true },
    ],
    note: `Done. Walked forward (${forward.join(' ')}) and backward (${backward.join(' ')}). The prev pointers made the return trip free.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'doubly-linked-list',
  title: 'Doubly linked list: walk both ways',
  category: 'Linked Lists',
  difficulty: 'Easy',
  scenario:
    'A doubly linked list lets you walk forwards AND backwards because every node stores both its next and its prev. We build one, walk head→tail collecting values, then turn around at the tail and walk tail→head following prev.',
  pattern:
    'Give every node a prev pointer alongside next. To traverse forward, start at the head and follow next until null. To traverse backward, start at the tail and follow prev until null. The extra pointer costs one reference per node but buys O(1) backward moves and O(1) deletion given a node. O(n) time, O(1) extra.',
  complexity: 'O(n) time · O(1) extra',
  defaultInput: { array: [1, 2, 3, 4] },
  expected: '1 2 3 4 | 4 3 2 1',
  run,
  code: `function walkBothWays(head, tail) {
  // forward: head -> tail via next
  const forward = [];
  for (let cur = head; cur; cur = cur.next) {
    forward.push(cur.value);
  }
  // backward: tail -> head via prev
  const backward = [];
  for (let cur = tail; cur; cur = cur.prev) {
    backward.push(cur.value);
  }
  return forward.join(' ') + ' | ' + backward.join(' ');
}`,
  eli5: `## A train where cars couple both ways

Think of a train. In a normal (singly linked) train, each car is hooked only to the car in front of it. You can walk from the engine to the caboose, but to go back you'd have to start over. A doubly linked list is a train where every car couples to the car ahead AND the car behind. Now you can walk either direction without ever leaving the train.

The magic is one extra coupling per car: the \`prev\` pointer. A singly linked node only knows \`next\` (the car ahead). A doubly linked node also stores \`prev\` (the car behind). That one extra link is what lets you turn around.

## What it costs, what it buys

It costs one extra pointer of memory per node, and a little extra bookkeeping: whenever you insert or delete a car you must hook up (or unhook) BOTH couplings.

In return you get two superpowers:

- Walking backward is O(1) per step — just follow \`prev\`, no restart.
- Deleting a node you already have a handle on is O(1): you can reach its neighbour on the left through \`prev\` and stitch the two sides together. In a singly linked list you'd have to scan from the head to find that left neighbour.

## The walk, step by step

- Build the cars: car \`i\` has \`next\` = car \`i+1\` (null at the tail) and \`prev\` = car \`i-1\` (null at the head).
- Forward: park a \`cur\` cursor on the head and keep following \`next\`, collecting each value, until \`next\` is null.
- Backward: move \`cur\` to the tail and keep following \`prev\`, collecting each value, until \`prev\` is null.
- The answer glues the two orders together with a \` | \`. For \`[1,2,3,4]\` that's \`1 2 3 4 | 4 3 2 1\`.

## The pitfall

The whole structure rests on \`prev\` and \`next\` agreeing with each other. If car B's \`prev\` says A but A's \`next\` doesn't say B, a backward walk and a forward walk will disagree — you'll skip cars or loop forever. On every insert and delete, fix all four couplings (the new node's prev/next and its two neighbours' pointers) before you move on.`,
};

export default descriptor;
