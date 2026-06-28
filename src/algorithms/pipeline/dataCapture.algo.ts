import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Stage 1 of the bot-training pipeline: CAPTURE.
// As players play, the client streams a state snapshot to the server every tick.
// We log each snapshot into a capture buffer — this raw gameplay log is the fuel
// for everything downstream (it's what we'll learn to imitate).

const SNAPSHOTS: Array<[number, string, number, number, string]> = [
  // tick, player, x, y, action
  [1, 'P1', 2, 3, 'move'],
  [1, 'P2', 7, 1, 'idle'],
  [2, 'P1', 3, 3, 'move'],
  [2, 'P2', 7, 2, 'shoot'],
  [3, 'P1', 3, 4, 'shoot'],
  [3, 'P2', 6, 2, 'move'],
];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();
  const columns = ['tick', 'player', 'x', 'y', 'action'];
  const rows: Array<Array<string | number>> = [];

  const table = (highlightRow?: number, caption?: string): DataTable => ({
    name: 'capture_log',
    columns,
    rows: rows.map((r) => [...r]),
    highlightRow,
    caption,
  });

  t.step({
    view: { kind: 'table', tables: [table(undefined, 'empty buffer — waiting for snapshots')] },
    state: [{ label: 'captured', value: 0 }],
    note: 'A fresh capture buffer. Each game tick, every client sends one state snapshot to the server.',
  });

  for (const snap of SNAPSHOTS) {
    rows.push(snap);
    t.step({
      view: { kind: 'table', tables: [table(rows.length - 1)] },
      state: [
        { label: 'captured', value: rows.length, highlight: true },
        { label: 'last tick', value: snap[0] },
      ],
      note: `Tick ${snap[0]}: ${snap[1]} → (${snap[2]}, ${snap[3]}) "${snap[4]}". Append it to the log.`,
    });
  }

  t.step({
    view: { kind: 'table', tables: [table(undefined, `${rows.length} snapshots ready for the database`)] },
    state: [{ label: 'captured', value: rows.length, highlight: true }],
    note: `Done. ${rows.length} snapshots captured. Next: store them in a relational schema.`,
  });

  return { steps: t.steps, answer: rows.length };
}

const descriptor: AlgoDescriptor = {
  id: 'data-capture',
  title: 'Capture: client → server snapshots',
  category: 'Data Pipeline',
  difficulty: 'Easy',
  scenario:
    "To train a bot to play like a human, you first need data of humans playing. Every tick, each client sends a state snapshot to the server, and the server logs it. That raw capture buffer is the start of the whole training pipeline.",
  pattern:
    'Event capture: append-only log of (tick, entity, state, action) snapshots. Keep it raw and complete now — normalize, clean, and reshape it in later stages. The action column is the label you will later teach the bot to predict.',
  complexity: 'O(snapshots) — one append per tick',
  defaultInput: {},
  expected: 6,
  run,
  code: `function capture(stream) {
  const log = [];
  for (const snap of stream) {          // each tick, per client
    log.push({ tick: snap.tick, player: snap.player,
               x: snap.x, y: snap.y, action: snap.action });
  }
  return log;                            // raw gameplay, ready to store
}`,
  eli5: `## The everyday picture

Think of a security camera that snaps a photo every second and drops each one in a box. At the end of the day the box holds the whole story, frame by frame. Capturing game data is the same: every tick, a snapshot of who's where and what they did goes into a log.

## What problem it solves

A bot can't learn to play like a human from nothing — it needs examples. The capture stage records those examples: the game state and, crucially, the ACTION the human took. Later we teach the bot "in this state, do that action."

## How it works step by step

- Each tick, every client serializes its state (\`tick\`, \`player\`, position, \`action\`) and sends it to the server.
- The server appends it to a capture log — append-only, no edits, so nothing is lost.
- Keep it raw: don't clean or reshape yet, just record faithfully.

## Why raw + complete matters

You can always clean data later, but you can't recover what you never logged. Capturing everything (even fields you think you won't need) saves you from re-running expensive playtests.

## Complexity in plain terms

One append per snapshot — O(snapshots). The cost is storage, not compute.

## Common pitfalls

- Dropping the action label — then you have states but nothing to imitate.
- Clock/tick mismatch between clients, so snapshots don't line up.
- Lossy sampling at capture time; sample later, keep the raw log intact.`,
};

export default descriptor;
