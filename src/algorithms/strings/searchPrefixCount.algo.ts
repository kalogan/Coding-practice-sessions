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
