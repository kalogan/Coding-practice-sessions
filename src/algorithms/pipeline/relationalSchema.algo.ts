import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Stage 2 of the bot-training pipeline: SCHEMA.
// The capture stage handed us a flat, wide log — every row repeats the match id,
// the map, and the player's team over and over. That redundancy wastes space and
// invites update anomalies (rename a team in one row, forget another → contradiction).
// Here we NORMALIZE that log toward 3NF into three linked tables.

// Flat capture log: match + map + team repeat on every single row.
// [match, map, player, team, tick, x, y, action]
const FLAT: Array<[string, string, string, string, number, number, number, string]> = [
  ['M1', 'dust', 'P1', 'red', 1, 2, 3, 'move'],
  ['M1', 'dust', 'P2', 'blue', 1, 7, 1, 'idle'],
  ['M1', 'dust', 'P1', 'red', 2, 3, 3, 'move'],
  ['M1', 'dust', 'P2', 'blue', 2, 7, 2, 'shoot'],
  ['M1', 'dust', 'P1', 'red', 3, 3, 4, 'shoot'],
  ['M1', 'dust', 'P2', 'blue', 3, 6, 2, 'move'],
];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // ---- the redundant source table -------------------------------------------
  const flatColumns = ['match', 'map', 'player', 'team', 'tick', 'x', 'y', 'action'];
  const flatTable = (caption?: string, highlightCol?: number): DataTable => ({
    name: 'capture_log (flat)',
    columns: flatColumns,
    rows: FLAT.map((r) => [...r]),
    caption,
    highlightCol,
  });

  t.step({
    view: { kind: 'table', tables: [flatTable('one wide table — match/map/team repeat on every row')] },
    state: [
      { label: 'tables', value: 1 },
      { label: 'flat rows', value: FLAT.length },
    ],
    note: 'The capture log is one flat, redundant table. "M1"/"dust" appear on all 6 rows; each player\'s team is rewritten every tick. We will split it into a clean relational schema.',
  });

  t.step({
    view: { kind: 'table', tables: [flatTable('redundant columns: match & map (left), team (per row)', 0)] },
    state: [
      { label: 'tables', value: 1 },
      { label: 'goal tables', value: 3 },
    ],
    note: 'Spot the duplication: match + map are identical down the column, and team is a fact about the PLAYER, not the event. Repeating them risks update anomalies — fix the team in one row, miss another, and the data contradicts itself.',
  });

  // ---- table 1: matches ------------------------------------------------------
  const matchesCols = ['match_id', 'map'];
  const matchesRows: Array<Array<string | number>> = [];
  const seenMatch = new Set<string>();

  const matchesTable = (highlightRow?: number, caption?: string): DataTable => ({
    name: 'matches',
    columns: matchesCols,
    rows: matchesRows.map((r) => [...r]),
    highlightRow,
    caption,
  });

  for (const row of FLAT) {
    const [match, map] = row;
    if (!seenMatch.has(match)) {
      seenMatch.add(match);
      matchesRows.push([match, map]);
      t.step({
        view: {
          kind: 'table',
          tables: [
            flatTable('reading flat rows → distinct matches'),
            matchesTable(matchesRows.length - 1, 'matches (1 row per match)'),
          ],
        },
        state: [
          { label: 'tables', value: 1 },
          { label: 'matches', value: matchesRows.length, highlight: true },
        ],
        note: `New match ${match} on map "${map}" → add one row to matches. The map is stored ONCE here instead of on every event. (1NF→2NF: pull out facts that depend only on match_id.)`,
      });
    }
  }

  t.step({
    view: { kind: 'table', tables: [matchesTable(undefined, 'matches done — map stored once per match')] },
    state: [{ label: 'matches', value: matchesRows.length, highlight: true }],
    note: 'Table 1 of 3 complete. match_id is the primary key; map lives here only. Events will reference match_id by foreign key instead of copying the map.',
  });

  // ---- table 2: players ------------------------------------------------------
  const playersCols = ['player_id', 'name', 'team'];
  const playersRows: Array<Array<string | number>> = [];
  const seenPlayer = new Map<string, number>();

  const playersTable = (highlightRow?: number, caption?: string): DataTable => ({
    name: 'players',
    columns: playersCols,
    rows: playersRows.map((r) => [...r]),
    highlightRow,
    caption,
  });

  for (const row of FLAT) {
    const player = row[2];
    const team = row[3];
    if (!seenPlayer.has(player)) {
      const id = seenPlayer.size + 1;
      seenPlayer.set(player, id);
      playersRows.push([id, player, team]);
      t.step({
        view: {
          kind: 'table',
          tables: [
            flatTable('reading flat rows → distinct players'),
            playersTable(playersRows.length - 1, 'players (1 row per player)'),
          ],
        },
        state: [
          { label: 'matches', value: matchesRows.length },
          { label: 'players', value: playersRows.length, highlight: true },
        ],
        note: `New player ${player} on team "${team}" → add one row to players (player_id ${id}). Team is a property of the PLAYER, so it belongs here exactly once — not duplicated on every snapshot. (3NF: remove transitive dependency player → team from the event rows.)`,
      });
    }
  }

  t.step({
    view: {
      kind: 'table',
      tables: [
        matchesTable(undefined, 'matches'),
        playersTable(undefined, 'players done — team stored once per player'),
      ],
    },
    state: [
      { label: 'matches', value: matchesRows.length },
      { label: 'players', value: playersRows.length, highlight: true },
    ],
    note: 'Table 2 of 3 complete. player_id is the primary key; team lives here only. Rename a team and you change ONE row — no anomalies possible.',
  });

  // ---- table 3: events (the fact table, all FKs) -----------------------------
  const eventsCols = ['event_id', 'match_id', 'player_id', 'tick', 'x', 'y', 'action'];
  const eventsRows: Array<Array<string | number>> = [];

  const eventsTable = (highlightRow?: number, caption?: string): DataTable => ({
    name: 'events',
    columns: eventsCols,
    rows: eventsRows.map((r) => [...r]),
    highlightRow,
    caption,
  });

  FLAT.forEach((row, i) => {
    const [match, , player, , tick, x, y, action] = row;
    const eventId = i + 1;
    const playerId = seenPlayer.get(player)!;
    eventsRows.push([eventId, match, playerId, tick, x, y, action]);
    t.step({
      view: {
        kind: 'table',
        tables: [
          matchesTable(undefined, 'matches'),
          playersTable(undefined, 'players'),
          eventsTable(eventsRows.length - 1, 'events — references by FK, no repeated map/team'),
        ],
      },
      state: [
        { label: 'matches', value: matchesRows.length },
        { label: 'players', value: playersRows.length },
        { label: 'events', value: eventsRows.length, highlight: true },
      ],
      note: `Event ${eventId}: tick ${tick}, (${x}, ${y}) "${action}". Store only foreign keys match_id=${match} and player_id=${playerId} — the map and team are looked up via those links instead of copied here.`,
    });
  });

  // ---- final: all three tables together --------------------------------------
  const tableCount = 3;
  t.step({
    view: {
      kind: 'table',
      tables: [
        matchesTable(undefined, '1 row per match'),
        playersTable(undefined, '1 row per player'),
        eventsTable(undefined, '1 row per snapshot, all FKs'),
      ],
    },
    state: [
      { label: 'matches', value: matchesRows.length },
      { label: 'players', value: playersRows.length },
      { label: 'events', value: eventsRows.length },
      { label: 'tables', value: tableCount, highlight: true },
    ],
    note: `Normalized into ${tableCount} tables: matches, players, events. Each fact lives in exactly one place; events joins back via match_id and player_id. Same data, no duplication, no update anomalies.`,
  });

  return { steps: t.steps, answer: tableCount };
}

const descriptor: AlgoDescriptor = {
  id: 'relational-schema',
  title: 'Schema: normalize the capture log',
  category: 'Data Pipeline',
  difficulty: 'Medium',
  scenario:
    "The capture stage left us one giant flat log where every row re-states the match, the map, and the player's team. That redundancy wastes storage and is dangerous: change a team in one row and forget another, and your data now disagrees with itself. A relational schema fixes this — store each fact once and link tables with foreign keys, so a join reconstructs the full picture on demand and integrity is enforced by the keys, not by hope.",
  pattern:
    'Database normalization toward 3NF: split a wide, redundant table so every non-key column depends on the whole key and nothing but the key. Pull match-level facts (map) into a matches table, player-level facts (team) into a players table, and keep a slim events fact table that references them by foreign key. Trade a little query-time join cost for no duplication and no update anomalies.',
  complexity: 'O(rows) — one pass to bucket distinct matches, players, and events',
  defaultInput: {},
  expected: 3,
  run,
  code: `function normalize(log) {
  const matches = new Map();   // match_id -> { map }
  const players = new Map();   // name     -> { player_id, team }
  const events  = [];

  for (const r of log) {
    if (!matches.has(r.match))                 // match-level fact: map
      matches.set(r.match, { map: r.map });
    if (!players.has(r.player))                // player-level fact: team
      players.set(r.player, { id: players.size + 1, team: r.team });

    events.push({                              // slim fact row: only FKs
      event_id: events.length + 1,
      match_id: r.match,                       // FK -> matches
      player_id: players.get(r.player).id,     // FK -> players
      tick: r.tick, x: r.x, y: r.y, action: r.action,
    });
  }
  return [matches, players, events];           // three normalized tables
}`,
  eli5: `## The everyday picture

Imagine writing 50 letters to two friends. The flat-log way is to scribble each friend's full home address at the bottom of every single letter. If a friend moves, you have to find and fix all 25 letters — miss one and you'll mail to the wrong place. The relational way is to keep ONE address book: each friend's address is written once. On a letter you just write their name; you look the address up when you need it. Move house? Change one line in the book and every letter is instantly correct.

## What "normalizing" means

Our capture log was one wide table that repeated the match, the map, and each player's team on every row. Normalizing splits it into three tables so every fact lives in exactly one place:

- \`matches\` — one row per match, holding the map.
- \`players\` — one row per player, holding their team.
- \`events\` — one row per snapshot (tick, x, y, action), storing only \`match_id\` and \`player_id\`.

## 1NF, 2NF, 3NF in plain terms

- 1NF: each cell holds a single value, no lists crammed into one box.
- 2NF: a fact must depend on the WHOLE key, not just part of it — the map depends on the match, so it moves to \`matches\`.
- 3NF: no fact should depend on another non-key fact — a player's team follows from the player, not the event, so it moves to \`players\`.

## Foreign keys link it back together

The \`events\` table doesn't copy the map or team; it stores \`match_id\` and \`player_id\`, which are foreign keys pointing at the other tables. A JOIN follows those links to rebuild the full flat view whenever you ask for it. The keys also enforce integrity: you can't log an event for a player who doesn't exist.

## Why it's worth it

- Saves space: each repeated fact is stored once, not once per row.
- Prevents update anomalies: rename a team in one place and the whole database agrees.

## Common pitfalls

- Forgetting the keys: without primary/foreign keys the tables can't be rejoined reliably.
- Over-normalizing: splitting into too many tiny tables makes every query a pile of joins; sometimes a little redundancy is the right trade.`,
};

export default descriptor;
