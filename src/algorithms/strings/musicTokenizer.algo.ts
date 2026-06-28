import type { AlgoDescriptor, AlgoInput, AlgoResult, Token } from '../types';
import { Tracer } from '../tracer';

// Single-pass lexer / tokenizer for a tiny musical-notation language.
// Scenario: turn a raw string into a stream of typed tokens, classifying each
// one and flagging anything that does not fit the grammar.
//
// Grammar (one token per space-separated chunk):
//   NOTE = A–G followed by an octave digit 0–9   (e.g. C4, G5)  → role 'match'
//   REST = 'r' followed by a duration digit       (e.g. r2)     → role 'plain'
//   BAR  = '|'                                                   → role 'plain'
//   else                                                         → role 'invalid'

type Kind = 'note' | 'rest' | 'bar' | 'invalid';

function classify(tok: string): Kind {
  if (/^[A-G][0-9]$/.test(tok)) return 'note';
  if (/^r[0-9]$/.test(tok)) return 'rest';
  if (tok === '|') return 'bar';
  return 'invalid';
}

const roleOf: Record<Kind, NonNullable<Token['role']>> = {
  note: 'match',
  rest: 'plain',
  bar: 'plain',
  invalid: 'invalid',
};

function run(input: AlgoInput): AlgoResult {
  const text = input.text ?? '';
  const t = new Tracer();

  const raw = text.split(' ').filter((s) => s.length > 0);

  // Build the token list incrementally so each step can render every token,
  // with the one being scanned shown as 'active' until it is classified.
  const tokens: Token[] = raw.map((text) => ({ text, role: 'plain' as const }));

  let notes = 0;
  let rests = 0;
  let bars = 0;
  let invalid = 0;

  const counts = () => [
    { label: 'notes', value: notes },
    { label: 'rests', value: rests },
    { label: 'bars', value: bars },
    { label: 'invalid', value: invalid },
  ];

  for (let i = 0; i < raw.length; i++) {
    // Mark the current token as actively being scanned.
    tokens[i] = { text: raw[i], role: 'active', label: '?' };
    t.step({
      view: { kind: 'tokens', tokens: tokens.map((tk) => ({ ...tk })) },
      state: counts(),
      note: `Scanning token ${i}: "${raw[i]}". Matching it against the grammar...`,
    });

    // Classify it.
    const kind = classify(raw[i]);
    if (kind === 'note') notes++;
    else if (kind === 'rest') rests++;
    else if (kind === 'bar') bars++;
    else invalid++;

    tokens[i] = { text: raw[i], role: roleOf[kind], label: kind };

    const why: Record<Kind, string> = {
      note: `"${raw[i]}" is a NOTE (pitch A–G + octave 0–9). Valid note count is now ${notes}.`,
      rest: `"${raw[i]}" is a REST ('r' + duration digit).`,
      bar: `"${raw[i]}" is a BAR line.`,
      invalid: `"${raw[i]}" matches no rule — flagged INVALID.`,
    };

    t.step({
      view: { kind: 'tokens', tokens: tokens.map((tk) => ({ ...tk })) },
      state: counts(),
      note: why[kind],
    });
  }

  // Final answer: the number of valid notes.
  t.step({
    view: { kind: 'tokens', tokens: tokens.map((tk) => ({ ...tk })) },
    state: [...counts(), { label: 'answer', value: notes, highlight: true }],
    note: `Done. Classified ${raw.length} tokens; ${notes} are valid notes.`,
  });

  return { steps: t.steps, answer: notes };
}

const descriptor: AlgoDescriptor = {
  id: 'music-tokenizer',
  title: 'Tokenize musical notation',
  category: 'Strings',
  scenario:
    'You are given a raw musical-notation string. Lex it into typed tokens — notes (pitch + octave), rests, and bar lines — while flagging anything that does not fit the grammar. The answer is how many valid notes were found.',
  pattern:
    'Single-pass lexer / tokenization: split into chunks, then classify each token against a small grammar with a clear fall-through to an "invalid" bucket so malformed input is handled gracefully. Each token is examined exactly once.',
  complexity: 'O(n) time',
  difficulty: 'Easy',
  eli5: `## Everyday analogy

Imagine a postal sorter standing at a conveyor belt. Each envelope (a chunk of text) slides past, and the sorter glances at it and drops it into one of four bins: "notes", "rests", "bars", or "junk". They never go back; one glance per envelope is enough.

## What problem it solves

Raw text like \`C4 E4 G4 | A4 r2 G4 X9\` has no meaning to a program yet — it's just characters. *Tokenizing* (lexing) turns it into a stream of labelled pieces so later stages can reason about structure. Here the final \`answer\` is simply how many valid notes appeared.

## How it works step by step

- Split the text on spaces and drop empty chunks: \`text.split(' ').filter(Boolean)\`.
- For each chunk, \`classify\` tries the rules in order: a NOTE matches \`/^[A-G][0-9]$/\` (pitch + octave), a REST matches \`/^r[0-9]$/\`, a BAR is exactly \`'|'\`, and anything else falls through to \`'invalid'\`.
- A counter for each kind is bumped; \`notes\` is the one we return.

## Why it's correct and efficient

The rules are mutually exclusive and the \`else\` branch is a catch-all, so every token lands in exactly one bin — malformed input like \`X9\` can't crash anything, it's just flagged invalid. Each token is examined once.

## Complexity in plain terms

One pass over \`n\` tokens, constant work each, so O(n) time.

## Common pitfalls

Forgetting the fall-through "invalid" bucket (then bad input slips through silently), or anchoring the regex loosely so \`C44\` wrongly counts as a note — the \`^...$\` anchors prevent that.`,
  defaultInput: { text: 'C4 E4 G4 | A4 r2 G4 X9' },
  expected: 5,
  run,
  code: `function tokenizeMusic(text) {
  const tokens = text.split(' ').filter(Boolean);
  let notes = 0;
  for (const tok of tokens) {
    let kind;
    if (/^[A-G][0-9]$/.test(tok)) { kind = 'note'; notes++; }
    else if (/^r[0-9]$/.test(tok)) kind = 'rest';
    else if (tok === '|') kind = 'bar';
    else kind = 'invalid';
    // ...record { text: tok, kind }...
  }
  return notes; // number of valid notes
}`,
};

export default descriptor;
