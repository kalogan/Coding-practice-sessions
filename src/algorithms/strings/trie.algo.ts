import type { AlgoDescriptor, AlgoInput, AlgoResult, GraphNode, GraphEdge } from '../types';
import { Tracer } from '../tracer';

// Trie (prefix tree) for autocomplete.
// Scenario: a search box that, given a typed prefix, counts how many known words
// start with it. We build a tree where each node is ONE character and every word
// is a root-to-node path; words that share a prefix share that path. End-of-word
// nodes are marked. A prefix query walks the path for input.text, then counts the
// end-of-word markers in that subtree.
//
// Words come from input.words; the query prefix is input.text.

interface TrieNode {
  /** the path string from root to this node = its unique id; '' is the root */
  id: string;
  /** the single character this node represents ('' for the root) */
  char: string;
  depth: number;
  children: Map<string, TrieNode>;
  /** true when some inserted word ends exactly here */
  isWord: boolean;
}

function newNode(id: string, char: string, depth: number): TrieNode {
  return { id, char, depth, children: new Map(), isWord: false };
}

function run(input: AlgoInput): AlgoResult {
  const words = input.words ?? [];
  const prefix = input.text ?? '';
  const t = new Tracer();

  const root = newNode('', '', 0);
  let maxDepth = 0;

  // role per node id, recomputed into GraphNode.role at draw time
  const roles = new Map<string, GraphNode['role']>();
  roles.set('', 'plain');

  // --- layout: DFS that hands each LEAF the next x-slot; internal nodes get the
  // average of their children; then normalize x into 0..1 by leaf count. ---
  function computeLayout(): Map<string, { x: number; y: number }> {
    const pos = new Map<string, { x: number; y: number }>();
    let nextLeaf = 0;
    let leafCount = 0;
    // first pass to count leaves so we can normalize (root counts as a leaf if no children)
    const countLeaves = (n: TrieNode): void => {
      if (n.children.size === 0) {
        leafCount++;
        return;
      }
      for (const c of sortedChildren(n)) countLeaves(c);
    };
    countLeaves(root);
    const denomLeaf = Math.max(1, leafCount - 1);
    const denomDepth = Math.max(1, maxDepth);

    const dfs = (n: TrieNode): number => {
      let x: number;
      if (n.children.size === 0) {
        x = nextLeaf;
        nextLeaf++;
      } else {
        const xs = sortedChildren(n).map((c) => dfs(c));
        x = xs.reduce((a, b) => a + b, 0) / xs.length;
      }
      pos.set(n.id, { x: x / denomLeaf, y: n.depth / denomDepth });
      return x;
    };
    dfs(root);
    return pos;
  }

  const sortedChildren = (n: TrieNode): TrieNode[] =>
    [...n.children.values()].sort((a, b) => a.char.localeCompare(b.char));

  // collect every node + edge for the graph view
  function collect(): { nodes: TrieNode[]; edges: Array<[string, string]> } {
    const nodes: TrieNode[] = [];
    const edges: Array<[string, string]> = [];
    const walk = (n: TrieNode): void => {
      nodes.push(n);
      for (const c of sortedChildren(n)) {
        edges.push([n.id, c.id]);
        walk(c);
      }
    };
    walk(root);
    return { nodes, edges };
  }

  const drawNodes = (): GraphNode[] => {
    const pos = computeLayout();
    const { nodes } = collect();
    return nodes.map((n) => {
      const p = pos.get(n.id)!;
      return {
        id: n.id || 'root',
        label: n.id === '' ? 'root' : n.char,
        x: p.x,
        y: p.y,
        role: roles.get(n.id) ?? 'plain',
      };
    });
  };
  const drawEdges = (): GraphEdge[] => {
    const { edges } = collect();
    return edges.map(([a, b]) => ({
      from: a || 'root',
      to: b || 'root',
      directed: true,
      role: roles.get(b) === 'active' || roles.get(b) === 'match' ? 'active' : 'plain',
    }));
  };

  // --- BUILD: insert each word character by character ---
  for (const word of words) {
    let cur = root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const childId = word.slice(0, i + 1);
      if (!cur.children.has(ch)) {
        const node = newNode(childId, ch, cur.depth + 1);
        cur.children.set(ch, node);
        roles.set(childId, 'plain');
        maxDepth = Math.max(maxDepth, node.depth);
        t.step({
          view: { kind: 'graph', nodes: drawNodes(), edges: drawEdges() },
          state: [
            { label: 'inserting', value: word, highlight: true },
            { label: 'char', value: ch },
          ],
          note: `Insert '${ch}' of "${word}" — new node for prefix "${childId}".`,
        });
      }
      cur = cur.children.get(ch)!;
    }
    cur.isWord = true;
    roles.set(cur.id, 'done');
    t.step({
      view: { kind: 'graph', nodes: drawNodes(), edges: drawEdges() },
      state: [{ label: 'inserted', value: word, highlight: true }],
      note: `"${word}" fully inserted — mark its last node as end-of-word.`,
    });
  }

  // --- QUERY: walk the prefix path, then count end-of-word nodes in the subtree ---
  let cur: TrieNode | null = root;
  let pathBroken = false;
  for (let i = 0; i < prefix.length && cur; i++) {
    const ch = prefix[i];
    const next: TrieNode | undefined = cur.children.get(ch);
    if (!next) {
      pathBroken = true;
      cur = null;
      t.step({
        view: { kind: 'graph', nodes: drawNodes(), edges: drawEdges() },
        state: [
          { label: 'prefix', value: prefix },
          { label: 'count', value: 0, highlight: true },
        ],
        note: `No child '${ch}' — no word starts with "${prefix}". Count is 0.`,
      });
      break;
    }
    roles.set(next.id, 'active');
    cur = next;
    t.step({
      view: { kind: 'graph', nodes: drawNodes(), edges: drawEdges() },
      state: [
        { label: 'prefix', value: prefix },
        { label: 'walked', value: prefix.slice(0, i + 1), highlight: true },
      ],
      note: `Follow '${ch}' along the prefix path "${prefix.slice(0, i + 1)}".`,
    });
  }

  // count end-of-word markers in the subtree rooted at the prefix node
  let count = 0;
  if (cur && !pathBroken) {
    const matchNodes: TrieNode[] = [];
    const countSubtree = (n: TrieNode): void => {
      if (n.isWord) {
        count++;
        matchNodes.push(n);
      }
      for (const c of sortedChildren(n)) countSubtree(c);
    };
    countSubtree(cur);
    for (const m of matchNodes) roles.set(m.id, 'match');
    t.step({
      view: { kind: 'graph', nodes: drawNodes(), edges: drawEdges() },
      state: [
        { label: 'prefix', value: prefix || '(empty)' },
        { label: 'count', value: count, highlight: true },
      ],
      note:
        count > 0
          ? `${count} word${count === 1 ? '' : 's'} start with "${prefix}" — highlighted as matches.`
          : `Prefix "${prefix}" exists but no word ends in its subtree. Count is 0.`,
    });
  }

  return { steps: t.steps, answer: count };
}

const descriptor: AlgoDescriptor = {
  id: 'trie-prefix',
  title: 'Trie: prefix tree',
  category: 'Trie',
  scenario:
    'An autocomplete / spellcheck box. Insert a dictionary into a prefix tree, then for a typed prefix count how many known words start with it — the basis of suggestion ranking and spell-check membership.',
  pattern:
    'Trie: each node is one character; every word is a root-to-node path, and words sharing a prefix share that path. Mark end-of-word nodes. Insert is O(word length); a prefix query walks the prefix path in O(prefix length), then a subtree scan counts the end-of-word markers below it.',
  complexity: 'O(total chars) build · O(prefix) query',
  difficulty: 'Medium',
  eli5: `## Everyday analogy

A trie is a tree of shared word-starts — like the tabbed index at the side of a dictionary, but for every prefix, not just the first letter. Every word is a path of single letters from the root downward, and any words that begin the same way ("cat", "car", "card") walk the same branches until they differ. It's the data structure behind autocomplete and spellcheck.

## Insert vs. prefix-search

- **Insert**: spell the word out one character at a time. At each letter, reuse the existing child node if it's there, otherwise create one. Mark the final node as an *end-of-word* so we remember a real word stops here.
- **Prefix-search**: walk down the path for the typed prefix. If the path breaks, nothing matches. If it survives, everything in the subtree beneath that point is a word that starts with the prefix — count the end-of-word markers to get how many.

## Why shared prefixes help

Because "cat", "car", and "card" share the branch \`c → a\`, we store those letters once instead of three times — less space. And lookup cost depends only on the prefix length, not on how many words are in the dictionary: O(prefix), even with millions of entries.

## Common pitfalls

- Forgetting to mark word-ends: then "car" looks like just a prefix of "card" and isn't counted as its own word.
- The empty string / root: the root holds no character; an empty prefix matches every word.
- Case sensitivity: "Cat" and "cat" become different paths unless you normalize case first.`,
  defaultInput: { words: ['cat', 'car', 'card', 'dog'], text: 'ca' },
  expected: 3,
  run,
  code: `function countWithPrefix(words, prefix) {
  const root = { children: new Map(), isWord: false };

  // build: insert each word char by char
  for (const word of words) {
    let cur = root;
    for (const ch of word) {
      if (!cur.children.has(ch))
        cur.children.set(ch, { children: new Map(), isWord: false });
      cur = cur.children.get(ch);
    }
    cur.isWord = true;            // mark end-of-word
  }

  // query: walk the prefix path
  let cur = root;
  for (const ch of prefix) {
    cur = cur.children.get(ch);
    if (!cur) return 0;           // prefix not present
  }

  // count end-of-word markers in the subtree
  let count = 0;
  (function dfs(n) {
    if (n.isWord) count++;
    for (const c of n.children.values()) dfs(c);
  })(cur);
  return count;
}`,
};

export default descriptor;
