import type { AlgoDescriptor, AlgoInput, AlgoResult, NetNeuron, NetEdge } from '../types';
import { Tracer } from '../tracer';

// Stage 7 of the data pipeline: SERVE the trained bot (inference).
// Training already happened; the weights below are FIXED. At game time we take the
// live world state, turn it into a feature vector (a "tensor"), push it through one
// linear layer, and pick the highest-scoring action (argmax). No gradients, no
// learning — just a fast, deterministic forward pass: state -> features -> model -> action.

// The live game state, already turned into 3 numeric features (normalized 0..1).
const STATE = [0.9, 0.8, 0.7]; // [enemyClose, health, ammo]
const FEATURES = ['enemyClose', 'health', 'ammo'];

// The 3 candidate actions the bot can take.
const ACTIONS = ['move', 'shoot', 'retreat'];

// FIXED trained weights: W[a] = weights for action a over the 3 features; B[a] = bias.
// Tuned so that, for this state, "shoot" (index 1) is the unambiguous winner.
const W = [
  [0.2, 0.1, 0.1], // move
  [1.0, 0.5, 0.8], // shoot
  [0.3, -0.4, 0.0], // retreat
];
const B = [0.0, 0.2, 0.1];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Each action score = (weighted sum of state features) + bias.
  const scores = ACTIONS.map((_, a) => {
    let z = B[a];
    for (let f = 0; f < STATE.length; f++) z += W[a][f] * STATE[f];
    return z;
  });

  // The bot picks the action with the highest score (greedy / argmax).
  let best = 0;
  for (let a = 1; a < scores.length; a++) if (scores[a] > scores[best]) best = a;

  // --- network layout: input neurons on the left, action neurons on the right ---
  const inputNeurons = (role: NetNeuron['role']): NetNeuron[] =>
    STATE.map((v, f) => ({
      id: `s${f}`,
      x: 0,
      y: (f + 1) / (STATE.length + 1),
      value: v,
      label: FEATURES[f],
      role,
    }));

  const actionNeurons = (active: number | null): NetNeuron[] =>
    ACTIONS.map((name, a) => ({
      id: `a${a}`,
      x: 1,
      y: (a + 1) / (ACTIONS.length + 1),
      value: scores[a],
      label: name,
      role: active === a ? 'active' : 'plain',
    }));

  const edges = (role: NetEdge['role']): NetEdge[] => {
    const out: NetEdge[] = [];
    for (let a = 0; a < ACTIONS.length; a++)
      for (let f = 0; f < STATE.length; f++)
        out.push({ from: `s${f}`, to: `a${a}`, weight: W[a][f], role });
    return out;
  };

  const scoreFields = () =>
    ACTIONS.map((name, a) => ({
      label: `score[${name}]`,
      value: scores[a].toFixed(2),
      highlight: a === best,
    }));

  // Step 1: live state lands as a feature vector on the input neurons.
  t.step({
    view: { kind: 'network', neurons: [...inputNeurons('active'), ...actionNeurons(null)], edges: edges('plain') },
    state: [
      { label: 'state', value: `[${STATE.join(', ')}]` },
      { label: 'features', value: FEATURES.join(', ') },
      { label: 'actions', value: ACTIONS.join(' / ') },
    ],
    note: 'Serving (inference): the live world state is already a feature vector on the left. The trained weights are fixed — no learning here.',
  });

  // Step 2: forward pass — light the weighted edges feeding every action.
  t.step({
    view: { kind: 'network', neurons: [...inputNeurons('active'), ...actionNeurons(null)], edges: edges('active') },
    state: scoreFields(),
    note: 'Forward pass: each action score = (weighted sum of the features) + bias. Activations flow left → right along the weighted edges.',
  });

  // Step 3: argmax — the winning action neuron lights up.
  t.step({
    view: { kind: 'network', neurons: [...inputNeurons('plain'), ...actionNeurons(best)], edges: edges('plain') },
    state: [...scoreFields(), { label: 'chosen action', value: `${ACTIONS[best]} (#${best})`, highlight: true }],
    note: `argmax picks the highest score: "${ACTIONS[best]}" wins with ${scores[best].toFixed(2)}. The bot acts. answer = ${best}.`,
  });

  return { steps: t.steps, answer: best };
}

const descriptor: AlgoDescriptor = {
  id: 'serve-bot',
  title: 'Serve the bot: state → action',
  category: 'Imitation Learning',
  difficulty: 'Medium',
  scenario:
    'At game time the bot must turn the current world state into an action, fast. Training is done and the weights are frozen; serving just takes the live state (enemy close, health, ammo), scores every candidate action with one forward pass, and fires the best one before the next frame.',
  pattern:
    'Inference, not training: build the feature tensor from live state, run a single forward pass (each action score = weighted sum of features + bias), then argmax = the greedy action. No gradients, no updates — just a fast, deterministic lookup of the best response.',
  complexity: 'O(features × actions) per inference',
  defaultInput: {},
  expected: 1,
  run,
  code: `const STATE = [0.9, 0.8, 0.7];        // live state -> feature tensor
const W = [                            // FIXED trained weights, per action
  [0.2, 0.1, 0.1],  // move
  [1.0, 0.5, 0.8],  // shoot
  [0.3, -0.4, 0.0], // retreat
];
const B = [0.0, 0.2, 0.1];             // per-action bias

function serve(state) {
  // forward pass: one linear layer
  const scores = W.map((w, a) =>
    w.reduce((z, wf, f) => z + wf * state[f], B[a]));
  // greedy action = argmax of the action scores
  let best = 0;
  for (let a = 1; a < scores.length; a++)
    if (scores[a] > scores[best]) best = a;
  return best;                         // index of the chosen action
}
serve(STATE); // -> 1 (shoot)`,
  eli5: `## A trained reflex

Picture a seasoned player who has drilled the same situations a thousand times. They glance at the screen — enemy close, health fine, ammo loaded — and *instantly* slam the shoot button. No deliberation, no second-guessing. That trained reflex is exactly what serving a bot is: see the situation, pick the response, now.

## The inference path

Serving turns the live world into an action along a fixed pipeline:

- **state → features:** the raw world (enemy distance, health, ammo) becomes 3 numbers, the feature vector \`[0.9, 0.8, 0.7]\`.
- **features → tensor → model:** those numbers feed one linear layer. Each action gets a \`score = (weights · features) + bias\`.
- **model → argmax:** the bot takes the action with the biggest score. Here \`shoot\` scores ~2.06 versus ~0.33 and ~0.05, so it wins — answer \`1\`.

## Why serving differs from training

Training is slow and careful: run forward, measure error, send \`gradients\` backward, nudge every weight. Serving does *none* of that. The weights are frozen, so there are no gradients and no updates — just the forward pass. It must be **fast** (it runs every frame) and **deterministic** (the same state must always pick the same action), so we avoid randomness entirely.

## Pitfalls

- **Train/serve skew:** if you normalize features differently at serve time than during training, the model sees garbage and acts wrong.
- **Latency:** a forward pass that misses the frame budget makes the bot feel sluggish.
- **Stale model:** shipping old weights means the bot keeps making yesterday's decisions.`,
};

export default descriptor;
