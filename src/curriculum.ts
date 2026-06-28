// The study path: every algorithm placed in a deliberate learning order — from
// the two-pointer window up to training game bots. Each module references real
// algorithm ids (the /learn page looks them up in the registry; unknown ids are
// skipped). Adding a new algo? Drop its id into the right module here.

export interface CurriculumModule {
  id: string;
  title: string;
  blurb: string;
  algoIds: string[];
}

export const CURRICULUM: CurriculumModule[] = [
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    blurb: 'Start here. A window of two pointers that grows and shrinks — the single most common interview pattern, and a gentle warm-up.',
    algoIds: ['chat-history-budget', 'peak-engagement'],
  },
  {
    id: 'strings',
    title: 'Strings & Parsing',
    blurb: 'Scanning and transforming text: prefixes, path normalization, tokenizing. Bread-and-butter problems with sharp edge cases.',
    algoIds: ['search-prefix-count', 'simplify-path', 'music-tokenizer'],
  },
  {
    id: 'recursion',
    title: 'Recursion & Backtracking',
    blurb: 'Functions that call themselves, and the call stack made visible. Backtracking = try, recurse, undo — the engine of combinatorial search.',
    algoIds: ['recursion-factorial', 'subset-sum-search'],
  },
  {
    id: 'sorting',
    title: 'Sorting',
    blurb: 'Watch values reorder. From the simple O(n²) swap sort to the O(n log n) heap-powered one.',
    algoIds: ['bubble-sort', 'heap-sort'],
  },
  {
    id: 'hashing',
    title: 'Hashing',
    blurb: 'Spread keys across buckets for O(1) average lookup — and see what happens when they collide.',
    algoIds: ['hash-table'],
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    blurb: 'Pointer surgery: reverse a list in place, walk it both ways, and catch a cycle with two runners.',
    algoIds: ['reverse-linked-list', 'doubly-linked-list', 'cycle-detection'],
  },
  {
    id: 'grids',
    title: 'Grids',
    blurb: 'Scanning a 2-D board for patterns — the warm-up for pathfinding and game boards later.',
    algoIds: ['match-three'],
  },
  {
    id: 'trees-heaps',
    title: 'Trees & Heaps',
    blurb: 'Hierarchical structures: ordered search trees, the priority-queue heap (two ways), range-query segment trees, and prefix tries.',
    algoIds: ['bst-search', 'max-heap', 'heap-array', 'segment-tree', 'trie-prefix'],
  },
  {
    id: 'graphs',
    title: 'Graphs',
    blurb: 'Nodes and edges: breadth-first waves, dependency ordering, triangle counting, disjoint sets, and weighted shortest paths.',
    algoIds: ['bfs-traversal', 'topo-sort', 'friend-triangles', 'union-find', 'dijkstra', 'a-star'],
  },
  {
    id: 'dp',
    title: 'Dynamic Programming',
    blurb: 'Build answers from a table of sub-answers. Edit distance is the canonical 2-D DP.',
    algoIds: ['edit-distance'],
  },
  {
    id: 'game-ai-search',
    title: 'Game AI: Adversarial Search',
    blurb: 'How a bot plays an opponent: look-ahead with minimax + pruning, Monte-Carlo tree search, and learning by self-play.',
    algoIds: ['minimax-alphabeta', 'mcts', 'self-play'],
  },
  {
    id: 'ml-foundations',
    title: 'Machine Learning Foundations',
    blurb: 'The optimizer and the network under every learned bot: gradient descent, a tiny net + backprop, learning XOR, and a convnet that "sees".',
    algoIds: ['gradient-descent', 'neural-net', 'xor-net', 'convolution'],
  },
  {
    id: 'rl',
    title: 'Reinforcement Learning',
    blurb: 'Training by trial and reward. Explore vs exploit, planning, Q-learning and its on-policy cousins, and policy-gradient methods.',
    algoIds: [
      'bandit-epsilon-greedy',
      'value-iteration',
      'q-learning',
      'sarsa',
      'monte-carlo-control',
      'n-step-td',
      'reinforce',
      'actor-critic',
    ],
  },
  {
    id: 'deep-rl',
    title: 'Deep Reinforcement Learning',
    blurb: 'The capstone: neural networks as the brain. DQN learns Q from features; PPO is the clipped policy gradient that trains real game bots.',
    algoIds: ['dqn', 'ppo'],
  },

  // ── Applied mini-track: the end-to-end pipeline for training a game bot
  //    from real gameplay data, by imitation learning. ──
  {
    id: 'pipeline-data',
    title: 'Bot Pipeline · Data Engineering',
    blurb: 'The applied track. It starts with real gameplay: capture client→server snapshots, store them in a clean relational schema, and query them with a join + aggregate.',
    algoIds: ['data-capture', 'relational-schema', 'sql-query'],
  },
  {
    id: 'pipeline-preprocess',
    title: 'Bot Pipeline · Preprocess & Tensors',
    blurb: 'Turn messy logs into model food: forward-fill gaps, resample in time, cap & pad to a fixed length, then stack the samples into the input tensor.',
    algoIds: ['preprocess-sequence', 'build-tensor'],
  },
  {
    id: 'pipeline-train-serve',
    title: 'Bot Pipeline · Imitation Learning & Serving',
    blurb: 'Train a model to copy the expert (behavioral cloning), serve it as a live bot (state → action), and x-ray the input tensor to catch data bugs before you commit.',
    algoIds: ['imitation-learning', 'serve-bot', 'tensor-xray'],
  },
];
