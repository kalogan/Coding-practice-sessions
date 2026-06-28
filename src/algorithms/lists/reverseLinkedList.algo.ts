import type { AlgoDescriptor, AlgoInput, AlgoResult, ListNode, ListPointer } from '../types';
import { Tracer } from '../tracer';

// Reverse a singly linked list in place.
// Scenario: the classic three-pointer dance. Keep the nodes in their original
// left-to-right positions and watch each `next` arrow FLIP to point backwards as
// `cur` walks the list. prev trails behind; when cur falls off the end, prev is
// the new head.

function run(input: AlgoInput): AlgoResult {
  const values = input.array ?? [];
  const n = values.length;
  const t = new Tracer();

  // next[i] = index this node points at, or null
  const next: Array<number | null> = values.map((_, i) => (i < n - 1 ? i + 1 : null));
  const id = (i: number | null) => (i === null ? null : String(i));

  let prev: number | null = null;
  let cur: number | null = n > 0 ? 0 : null;

  const nodes = (): ListNode[] =>
    values.map((v, i) => ({
      id: String(i),
      value: v,
      next: id(next[i]),
      role: i === cur ? 'active' : i === prev ? 'visited' : 'plain',
    }));
  const cursors = (): ListPointer[] => [
    { label: 'prev', target: id(prev), role: 'prev' },
    { label: 'cur', target: id(cur), role: 'cur' },
  ];
  const draw = (note: string) =>
    t.step({
      view: { kind: 'list', nodes: nodes(), pointers: cursors() },
      state: [
        { label: 'prev', value: prev === null ? 'null' : values[prev] },
        { label: 'cur', value: cur === null ? 'null' : values[cur] },
      ],
      note,
    });

  draw(`Start: prev = null, cur = head${n ? ` (${values[0]})` : ''}.`);

  while (cur !== null) {
    const nxt = next[cur];
    next[cur] = prev; // flip this node's pointer backwards
    draw(`Point ${values[cur]} back to ${prev === null ? 'null' : values[prev]} (reverse this link).`);
    prev = cur;
    cur = nxt;
    draw(
      cur === null
        ? `cur ran off the end. prev (${prev === null ? 'null' : values[prev]}) is the new head.`
        : `Advance: prev = ${values[prev as number]}, cur = ${values[cur]}.`,
    );
  }

  // read the reversed order by following the new pointers from the new head
  const order: number[] = [];
  let p = prev;
  while (p !== null) {
    order.push(values[p]);
    p = next[p];
  }

  t.step({
    view: {
      kind: 'list',
      nodes: values.map((v, i) => ({ id: String(i), value: v, next: id(next[i]), role: 'visited' as const })),
      pointers: [{ label: 'head', target: id(prev), role: 'head' }],
    },
    state: [{ label: 'reversed', value: order.join(' '), highlight: true }],
    note: `Done. Reversed list: ${order.join(' ')}.`,
  });

  return { steps: t.steps, answer: order.join(' ') };
}

const descriptor: AlgoDescriptor = {
  id: 'reverse-linked-list',
  title: 'Reverse a linked list',
  category: 'Linked Lists',
  scenario:
    'Flip a singly linked list so it runs the other way. The trick is three pointers — prev, cur, and a saved next — so you never lose the rest of the list while you rewire one link at a time.',
  pattern:
    'Walk cur from head to null. Each step: save next = cur.next, point cur.next back at prev, then slide prev and cur forward. When cur is null, prev is the new head. O(n) time, O(1) space.',
  complexity: 'O(n) time · O(1) space',
  defaultInput: { array: [1, 2, 3, 4] },
  expected: '4 3 2 1',
  run,
  code: `function reverse(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next;   // save the rest of the list
    cur.next = prev;         // flip this link backwards
    prev = cur;              // slide prev forward
    cur = next;              // slide cur forward
  }
  return prev;               // prev is the new head
}`,
};

export default descriptor;
