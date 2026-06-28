import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Stage 3 of the bot-training pipeline: QUERY.
// The capture/store stages left us with relational tables. Now we ASK QUESTIONS
// of that data with SQL: join two tables on a shared key, filter to the rows we
// care about, group by an entity, and aggregate (here: COUNT 'shoot' actions
// per player). This is how analytics turn raw logs into features/labels.

const SQL = `SELECT p.name, COUNT(*) AS shoot_count
FROM events e
JOIN players p ON e.player_id = p.player_id
WHERE e.action = 'shoot'
GROUP BY p.name`;

// players(player_id, name, team)
const PLAYERS: Array<[number, string, string]> = [
  [1, 'Alice', 'Red'],
  [2, 'Bob', 'Blue'],
  [3, 'Cara', 'Red'],
];

// events(event_id, player_id, action)
const EVENTS: Array<[number, number, string]> = [
  [101, 1, 'shoot'],
  [102, 2, 'move'],
  [103, 1, 'shoot'],
  [104, 3, 'idle'],
  [105, 2, 'shoot'],
  [106, 1, 'move'],
];
// Hand check: 'shoot' rows -> 101 (P1), 103 (P1), 105 (P2). Alice=2, Bob=1, Cara=0.
// TOTAL shoot events = 2 + 1 + 0 = 3.

const PLAYER_COLS = ['player_id', 'name', 'team'];
const EVENT_COLS = ['event_id', 'player_id', 'action'];
const RESULT_COLS = ['name', 'shoot_count'];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Build a name lookup by player_id (the "hash join" build side).
  const nameById = new Map<number, string>();
  for (const [id, name] of PLAYERS) nameById.set(id, name);

  // Running aggregate: name -> shoot count. Seed every player at 0 so players
  // with no shoots still appear (matches GROUP BY over the joined set here).
  const counts = new Map<string, number>();
  for (const [, name] of PLAYERS) counts.set(name, 0);

  const playersTable = (highlightRow?: number): DataTable => ({
    name: 'players',
    columns: PLAYER_COLS,
    rows: PLAYERS.map((r) => [...r]),
    highlightRow,
    caption: 'player_id, name, team',
  });

  const eventsTable = (highlightRow?: number): DataTable => ({
    name: 'events',
    columns: EVENT_COLS,
    rows: EVENTS.map((r) => [...r]),
    highlightRow,
    caption: "event_id, player_id, action",
  });

  const resultTable = (caption?: string): DataTable => ({
    name: 'result',
    columns: RESULT_COLS,
    rows: [...counts.entries()].map(([name, c]) => [name, c]),
    caption: caption ?? 'name, shoot_count',
  });

  t.step({
    view: { kind: 'table', tables: [playersTable(), eventsTable(), resultTable('empty — nothing counted yet')] },
    state: [
      { label: 'players', value: PLAYERS.length },
      { label: 'events', value: EVENTS.length },
      { label: 'total shoots', value: 0 },
    ],
    note: `The query: ${SQL.replace(/\n/g, ' ')}. We have two source tables; we'll JOIN events to players, FILTER action='shoot', GROUP BY player and COUNT.`,
  });

  let total = 0;

  // Scan events (the "probe" side of a hash join). For each event, look up the
  // player by player_id, then (WHERE) keep only action='shoot' and (COUNT) bump
  // that player's tally.
  for (let i = 0; i < EVENTS.length; i++) {
    const [eventId, playerId, action] = EVENTS[i];
    const playerRow = PLAYERS.findIndex((p) => p[0] === playerId);
    const name = nameById.get(playerId);

    if (action !== 'shoot') {
      t.step({
        view: {
          kind: 'table',
          tables: [playersTable(playerRow), eventsTable(i), resultTable()],
        },
        state: [
          { label: 'event', value: eventId },
          { label: 'action', value: action },
          { label: 'total shoots', value: total },
        ],
        note: `Event ${eventId}: action="${action}" ≠ 'shoot'. JOIN found player ${name}, but WHERE filters this row out. Skip.`,
      });
      continue;
    }

    // It's a 'shoot' — join matched, filter passed, increment the group's count.
    const next = (counts.get(name as string) ?? 0) + 1;
    counts.set(name as string, next);
    total += 1;

    t.step({
      view: {
        kind: 'table',
        tables: [playersTable(playerRow), eventsTable(i), resultTable(`${name}: shoot_count → ${next}`)],
      },
      state: [
        { label: 'event', value: eventId },
        { label: 'action', value: action, highlight: true },
        { label: `${name} count`, value: next, highlight: true },
        { label: 'total shoots', value: total },
      ],
      note: `Event ${eventId}: action='shoot'. JOIN on player_id=${playerId} → ${name}; WHERE passes; COUNT for ${name} is now ${next}.`,
    });
  }

  t.step({
    view: { kind: 'table', tables: [resultTable(`final result — total shoots = ${total}`)] },
    state: [
      { label: 'total shoots', value: total, highlight: true },
    ],
    note: `Done. The result table has one row per player with their shoot_count. Summing the counts gives the total number of 'shoot' events: ${total}.`,
  });

  return { steps: t.steps, answer: total };
}

const descriptor: AlgoDescriptor = {
  id: 'sql-query',
  title: 'Query: join + filter + aggregate',
  category: 'Data Pipeline',
  difficulty: 'Medium',
  scenario:
    "The gameplay data is now in relational tables: players(player_id, name, team) and events(event_id, player_id, action). To turn it into features, we ask: how many times did each player shoot? In SQL: SELECT p.name, COUNT(*) AS shoot_count FROM events e JOIN players p ON e.player_id = p.player_id WHERE e.action = 'shoot' GROUP BY p.name.",
  pattern:
    "JOIN + FILTER + GROUP-BY aggregate. Join key: events.player_id = players.player_id. Filter: action = 'shoot'. Group key: the player; aggregate: COUNT. Engines run this as a hash join (build a key→row map from one table, probe with the other) so it's linear, not a nested-loop O(n·m) scan.",
  complexity: 'O(rows) for a hash join',
  defaultInput: {},
  expected: 3,
  run,
  code: `function shootCountPerPlayer(players, events) {
  const nameById = new Map(players.map(p => [p.player_id, p.name]));
  const counts = new Map(players.map(p => [p.name, 0]));   // seed groups
  for (const e of events) {                  // probe side
    if (e.action !== 'shoot') continue;      // WHERE
    const name = nameById.get(e.player_id);  // JOIN
    counts.set(name, counts.get(name) + 1);  // GROUP BY + COUNT
  }
  return counts;                             // name -> shoot_count
}`,
  eli5: `## The everyday picture

Imagine two clipboards. One lists every player with their id and name. The other is a stack of action slips, each slip just says a player's id and what they did. To answer "how many times did each player shoot?" you cross-reference: pick up a slip, look up the id on the roster to find the name, and if the slip says 'shoot', add a tally mark next to that name.

## What each piece does

- JOIN stitches the two tables together on a shared id (events.player_id matches players.player_id), so each action slip "knows" the player's name.
- WHERE is the bouncer: it throws out every row that isn't a 'shoot'.
- GROUP BY sorts the survivors into one bucket per player.
- COUNT counts how many slips landed in each bucket.

## Why it's fast

A naive join compares every event against every player — slow. Real databases build a hash index (a key→row map) from one table, then scan the other once, looking each id up in O(1). That makes the whole query roughly O(rows) instead of O(events × players). An index on player_id is what makes the lookup instant.

## Common pitfalls

- Join key mismatch (string "1" vs number 1, or a typo'd column) silently drops rows.
- Forgetting GROUP BY: COUNT then collapses everything into one number instead of per-player.
- Fan-out: if a key isn't unique on the joined side, rows multiply and your COUNT double-counts.`,
};

export default descriptor;
