import type { AlgoDescriptor, AlgoInput, AlgoResult, Token } from '../types';
import { Tracer } from '../tracer';

// Prefix matching over a list.
// Scenario: a search box autocompletes from the user's past queries. Given the
// text typed so far (a prefix), count how many past queries start with it.
// We scan the list one query at a time and highlight the matches.

function run(input: AlgoInput): AlgoResult {
  const queries = input.words ?? [];
  const prefix = input.text ?? '';
  const t = new Tracer();

  // tokens for a frame: `confirmed` matches are 'match', the query under the
  // cursor is 'active', everything else is 'plain'.
  const frame = (cursor: number, matched: boolean[]): Token[] =>
    queries.map((q, i) => ({
      text: q,
      role: i === cursor ? 'active' : matched[i] ? 'match' : 'plain',
    }));

  const matched: boolean[] = queries.map(() => false);
  let count = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const isMatch = query.startsWith(prefix);
    if (isMatch) {
      matched[i] = true;
      count++;
    }
    t.step({
      view: { kind: 'tokens', tokens: frame(i, matched) },
      state: [
        { label: 'prefix', value: prefix },
        { label: 'count', value: count, highlight: isMatch },
      ],
      note: isMatch
        ? `'${query}' starts with '${prefix}' → match (count ${count})`
        : `'${query}' does not start with '${prefix}' → skip (count ${count})`,
    });
  }

  // final answer: only the matches stay lit.
  t.step({
    view: { kind: 'tokens', tokens: frame(-1, matched) },
    state: [
      { label: 'prefix', value: prefix },
      { label: 'answer', value: count, highlight: true },
    ],
    note: `Done. ${count} past quer${count === 1 ? 'y starts' : 'ies start'} with '${prefix}'.`,
  });

  return { steps: t.steps, answer: count };
}

const descriptor: AlgoDescriptor = {
  id: 'search-prefix-count',
  title: 'Search autocomplete: prefix count',
  category: 'Strings',
  scenario:
    'A search box autocompletes from the user\'s past queries. Given the text typed so far, count how many past queries start with that prefix.',
  pattern:
    'Prefix matching: scan the list and test query.startsWith(prefix) on each. Simple and O(n·m), but production autocomplete uses a TRIE so a lookup costs O(prefix) instead of re-scanning every query.',
  complexity: 'O(n·m) time',
  difficulty: 'Easy',
  eli5: `Think of flipping through a stack of old index cards looking for every card that begins with the letters you just typed. You check each card one by one: does it start with "car"? Tally it if yes, move on if no. At the end your tally is the answer.

## What problem it solves
A search box autocompletes from the user's past \`queries\`. Given the \`prefix\` typed so far, count how many past queries begin with it.

## How it works step by step
- Start \`count\` at \`0\`.
- Walk the list with index \`i\`; for each \`query\`, test \`query.startsWith(prefix)\`.
- If it matches, mark \`matched[i] = true\` and increment \`count\`.
- The visualization lights the current card as \`active\`, confirmed matches as \`match\`, and the rest as \`plain\`.

## Why it works
\`startsWith\` compares the prefix character by character against the front of each query and stops at the first mismatch, so a query is counted exactly when its opening characters equal \`prefix\`. Scanning every query guarantees none is missed.

## Complexity in plain terms
With \`n\` queries each up to \`m\` characters long, every \`startsWith\` can cost up to \`m\` comparisons, so it's O(n·m): you re-examine the whole list on every keystroke. Fine for a handful of queries, slow for millions.

## The smarter alternative
Real autocomplete uses a TRIE (prefix tree): you walk down one branch following the prefix's characters, then the matches are everything beneath that node. A lookup costs about O(length of prefix) instead of re-scanning every query.

## Common pitfalls
- Using \`includes\` instead of \`startsWith\` — that matches the prefix anywhere, not just at the start.
- Case sensitivity: "Car" won't match prefix "car" unless you normalize case first.
- Treating an empty \`prefix\` specially — note every query "starts with" the empty string, so it would match all of them.`,
  defaultInput: { words: ['cat', 'car', 'card', 'dog', 'can', 'cart'], text: 'car' },
  expected: 3,
  run,
  code: `function prefixCount(queries, prefix) {
  let count = 0;
  for (const query of queries) {
    if (query.startsWith(prefix)) {   // does this past query autocomplete?
      count++;
    }
  }
  return count;                       // how many queries start with the prefix
}`,
};

export default descriptor;
