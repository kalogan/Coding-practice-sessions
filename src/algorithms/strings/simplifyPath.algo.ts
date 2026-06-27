import type { AlgoDescriptor, AlgoInput, AlgoResult, Token } from '../types';
import { Tracer } from '../tracer';

// Stack-based path normalization.
// Scenario: turn a messy Unix path into its canonical form. The whole job is
// the edge cases — empty segments ('//' or trailing '/'), '.' (current dir),
// and '..' (parent dir, which pops). Everything else is a real dir we keep.

function run(input: AlgoInput): AlgoResult {
  const text = input.text ?? '';
  const t = new Tracer();

  // Split on '/'. This yields '' for leading/double/trailing slashes.
  const segments = text.split('/');

  // Track each segment's render role as we go, so every step shows the full
  // input with the segment under consideration and the decision made.
  const roles: Token['role'][] = segments.map(() => 'plain');

  const stack: string[] = [];
  const canonical = () => '/' + stack.join('/');

  const view = (activeIndex: number): { kind: 'tokens'; tokens: Token[] } => ({
    kind: 'tokens',
    tokens: segments.map((seg, i) => ({
      text: seg === '' ? '∅' : seg,
      role: i === activeIndex ? 'active' : roles[i],
      label: i === activeIndex ? 'this' : undefined,
    })),
  });

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (seg === '' || seg === '.') {
      // Empty (from // or a trailing/leading slash) or '.' (current dir):
      // contributes nothing to the path. Skip it.
      roles[i] = 'dropped';
      t.step({
        view: view(i),
        state: [{ label: 'canonical path', value: canonical() }],
        note:
          seg === ''
            ? `Empty segment (from a '//' or a leading/trailing '/'). It means nothing — skip it.`
            : `'.' means "current directory" — it doesn't move anywhere. Skip it.`,
      });
    } else if (seg === '..') {
      // Parent directory: step up by popping the stack, if there's anything
      // to pop. At the root, '..' has nowhere to go, so it's a no-op.
      roles[i] = 'dropped';
      const popped = stack.length > 0 ? stack.pop() : undefined;
      t.step({
        view: view(i),
        state: [{ label: 'canonical path', value: canonical(), highlight: true }],
        note:
          popped !== undefined
            ? `'..' means "go up one level" — pop '${popped}' off the stack.`
            : `'..' at the root has nowhere to go up to — it's a no-op.`,
      });
    } else {
      // A real directory name: descend into it by pushing onto the stack.
      roles[i] = 'kept';
      stack.push(seg);
      t.step({
        view: view(i),
        state: [{ label: 'canonical path', value: canonical(), highlight: true }],
        note: `'${seg}' is a real directory name — push it onto the stack.`,
      });
    }
  }

  const answer = canonical();

  // Final frame: every kept segment shown, the canonical path assembled.
  t.step({
    view: {
      kind: 'tokens',
      tokens: segments.map((seg, i) => ({
        text: seg === '' ? '∅' : seg,
        role: roles[i],
      })),
    },
    state: [{ label: 'answer', value: answer, highlight: true }],
    note: `Done. Canonical path = '/' + kept dirs joined by '/' = '${answer}'.`,
  });

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'simplify-path',
  title: 'Simplify a file path',
  category: 'Strings',
  scenario:
    'Normalize a messy Unix file path into its canonical form. The path is full of edge cases — double slashes, a trailing slash, "." for the current directory, and ".." for the parent — and tidying them up correctly is the entire task.',
  pattern:
    'Stack-based path normalization: split on "/", then walk the segments. Skip "" and "."; on ".." pop the stack (if non-empty); otherwise push the real directory name. The canonical path is "/" + stack joined by "/". The edge cases are the whole point.',
  complexity: 'O(n) time · O(n) space',
  defaultInput: { text: '/home/../usr//bin/./test/' },
  expected: '/usr/bin/test',
  run,
  code: `function simplifyPath(path) {
  const stack = [];
  for (const seg of path.split('/')) {
    if (seg === '' || seg === '.') {
      continue;                 // '' (// or trailing /) and '.' contribute nothing
    } else if (seg === '..') {
      if (stack.length) stack.pop();  // go up a level, if possible
    } else {
      stack.push(seg);          // a real directory name
    }
  }
  return '/' + stack.join('/'); // canonical path
}`,
};

export default descriptor;
