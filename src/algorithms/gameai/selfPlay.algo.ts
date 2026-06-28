import type { AlgoDescriptor, AlgoInput, AlgoResult, ChartPoint } from '../types';
import { Tracer } from '../tracer';

// Self-play: a tic-tac-toe bot that gets better by playing copies of ITSELF.
//
// Both X and O share ONE value table V[boardKey] of afterstate values: how good
// a board is for X after a move lands (init 0.5; terminal X-win=1, O-win=0,
// draw=0.5). X moves to MAXIMIZE this value, O moves to MINIMIZE it. They play
// epsilon-greedily (explore with prob eps, else pick the best afterstate), and
// after each game a TD update is swept backward along the moves played:
//     V[s] += alpha * (V[next] - V[s]).
// Perfect tic-tac-toe is a draw, so as both sides — always exactly at each
// other's level — improve, the games converge to DRAWS.

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6], // diagonals
];

type Board = string[]; // 9 cells: 'X' | 'O' | ''

function winner(b: Board): string | null {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function emptyCells(b: Board): number[] {
  const m: number[] = [];
  for (let i = 0; i < 9; i++) if (b[i] === '') m.push(i);
  return m;
}

const keyOf = (b: Board): string => b.map((c) => (c === '' ? '.' : c)).join('');

function run(input: AlgoInput): AlgoResult {
  // Seeded LCG — deterministic, no Math.random/Date.
  let seed = (input.params?.seed ?? 5) >>> 0;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

  const totalGames = input.params?.games ?? 5000;
  const alpha = input.params?.alpha ?? 0.2; // TD learning rate
  const eps0 = input.params?.eps0 ?? 0.3; // starting exploration
  const epsMin = input.params?.epsMin ?? 0.01; // final exploration
  const batchSize = input.params?.batch ?? 100;

  const t = new Tracer();

  // Shared afterstate value table — the SAME brain plays both colours.
  const V = new Map<string, number>();
  const getV = (k: string): number => (V.has(k) ? V.get(k)! : 0.5);

  // Value of the board AFTER a move, from X's perspective.
  const afterValue = (nb: Board, nk: string): number => {
    const w = winner(nb);
    if (w === 'X') return 1;
    if (w === 'O') return 0;
    if (emptyCells(nb).length === 0) return 0.5; // full board, no winner => draw
    return getV(nk);
  };

  // Play one game. `greedy` disables exploration. Returns outcome + the list of
  // afterstate keys (the board after each move) for the backward TD sweep.
  const playGame = (greedy: boolean, eps: number): { outcome: string; history: string[] } => {
    const b: Board = Array(9).fill('');
    let turn = 'X';
    const history: string[] = [];
    for (;;) {
      const w = winner(b);
      if (w) return { outcome: w, history };
      const avail = emptyCells(b);
      if (avail.length === 0) return { outcome: 'draw', history };

      let chosen: number;
      if (!greedy && rand() < eps) {
        // EXPLORE: random legal move.
        chosen = avail[Math.floor(rand() * avail.length)];
      } else {
        // EXPLOIT: pick the afterstate best for the side to move
        // (X maximizes X-value, O minimizes it).
        let best = avail[0];
        let bestVal = turn === 'X' ? -Infinity : Infinity;
        for (const mv of avail) {
          const nb = b.slice();
          nb[mv] = turn;
          const val = afterValue(nb, keyOf(nb));
          if (turn === 'X' ? val > bestVal : val < bestVal) {
            bestVal = val;
            best = mv;
          }
        }
        chosen = best;
      }
      b[chosen] = turn;
      history.push(keyOf(b));
      turn = turn === 'X' ? 'O' : 'X';
    }
  };

  // TD update: sweep the final outcome backward through the boards we saw.
  const learn = (outcome: string, history: string[]): void => {
    let next = outcome === 'X' ? 1 : outcome === 'O' ? 0 : 0.5;
    for (let i = history.length - 1; i >= 0; i--) {
      const k = history[i];
      const cur = getV(k);
      const updated = cur + alpha * (next - cur); // V[s] += alpha*(V[next]-V[s])
      V.set(k, updated);
      next = updated;
    }
  };

  const xRange: [number, number] = [0, totalGames];
  const yRange: [number, number] = [0, 1];
  const drawCurve: Array<[number, number]> = [];

  const draw = (
    gamesPlayed: number,
    drawRate: number,
    xRate: number,
    oRate: number,
    note: string,
    done = false,
  ) => {
    const points: ChartPoint[] = drawCurve
      .slice(0, -1)
      .map(([px, py]) => ({ x: px, y: py, role: 'plain' as const }));
    const last = drawCurve[drawCurve.length - 1];
    if (last) {
      points.push({
        x: last[0],
        y: last[1],
        role: done ? 'match' : 'active',
        label: `${(last[1] * 100).toFixed(0)}% draws`,
      });
    }
    t.step({
      view: {
        kind: 'chart',
        lines: [{ points: drawCurve.map(([px, py]) => [px, py] as [number, number]), role: 'plain' }],
        points,
        xRange,
        yRange,
        xLabel: 'games played',
        yLabel: 'draw rate',
      },
      state: [
        { label: 'games played', value: gamesPlayed },
        { label: 'draw rate (last 100)', value: drawRate.toFixed(2), highlight: true },
        { label: 'X-win rate', value: xRate.toFixed(2) },
        { label: 'O-win rate', value: oRate.toFixed(2) },
        { label: 'states learned', value: V.size },
      ],
      note,
    });
  };

  // Training loop. We emit ONE trace step per batch (~totalGames/batchSize ≈ 50).
  let batchDraws = 0;
  let batchX = 0;
  let batchO = 0;

  for (let g = 0; g < totalGames; g++) {
    // Linearly decay exploration from eps0 down to epsMin.
    const eps = eps0 + (epsMin - eps0) * (g / totalGames);
    const { outcome, history } = playGame(false, eps);
    learn(outcome, history);

    if (outcome === 'draw') batchDraws++;
    else if (outcome === 'X') batchX++;
    else batchO++;

    if ((g + 1) % batchSize === 0) {
      const drawRate = batchDraws / batchSize;
      const xRate = batchX / batchSize;
      const oRate = batchO / batchSize;
      drawCurve.push([g + 1, drawRate]);
      draw(
        g + 1,
        drawRate,
        xRate,
        oRate,
        g + 1 === batchSize
          ? `First ${batchSize} games: still clumsy and exploring a lot (ε≈${eps.toFixed(2)}). Only ${(drawRate * 100).toFixed(0)}% were draws — the bots blunder into wins and losses.`
          : `After ${g + 1} games (ε≈${eps.toFixed(2)}): ${(drawRate * 100).toFixed(0)}% of the last ${batchSize} were draws. As both shared-brain sides improve in lock-step, decisive games get rarer.`,
      );
      batchDraws = batchX = batchO = 0;
    }
  }

  // THE ANSWER: a final game with BOTH sides greedy (no exploration) using the
  // trained table. Perfect tic-tac-toe play is a draw.
  const final = playGame(true, 0);
  const answer = final.outcome === 'X' ? 'X wins' : final.outcome === 'O' ? 'O wins' : 'draw';

  draw(
    totalGames,
    drawCurve.length ? drawCurve[drawCurve.length - 1][1] : 0,
    0,
    0,
    `Training done over ${totalGames} games. Now both sides play GREEDILY with the trained table — and the game ends in a ${answer}. Self-play taught the bot perfect tic-tac-toe, which is always a draw.`,
    true,
  );

  return { steps: t.steps, answer };
}

const descriptor: AlgoDescriptor = {
  id: 'self-play',
  title: 'Self-play: learning by playing yourself',
  category: 'Game AI',
  difficulty: 'Hard',
  scenario:
    'A tic-tac-toe bot has no teacher and no game database — so it plays copies of itself, thousands of times. Both X and O share one value table of afterstate values; each picks the move that looks best for its side, then the final result is swept backward as a TD update so earlier boards learn from the outcome. The opponent is always exactly as good as the bot, which forms an automatic curriculum. Because perfect tic-tac-toe is a draw, the games converge to draws as both sides master it.',
  pattern:
    'Self-play reinforcement learning with a shared afterstate value V[s] (init 0.5, terminal win=1 / loss=0 / draw=0.5). Move ε-greedily: explore at rate ε, else pick the afterstate that maximizes V for X / minimizes it for O. After each game, sweep backward: V[s] ← V[s] + α·(V[next] − V[s]). Decay ε so early exploration gives way to confident play. This is the kernel of AlphaZero, just tabular.',
  complexity: 'O(games × moves)',
  defaultInput: { params: { games: 5000, alpha: 0.2, eps0: 0.3, epsMin: 0.01, batch: 100, seed: 5 } },
  expected: 'draw',
  run,
  code: `// Shared afterstate value table: V[board] = chance this board is good for X.
// init 0.5; terminal X-win=1, O-win=0, draw=0.5. X maximizes V, O minimizes it.
function selfPlay({ games, alpha, eps0, epsMin, seed }) {
  let s = seed >>> 0;
  const rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const V = new Map();
  const getV = (k) => (V.has(k) ? V.get(k) : 0.5);

  function playGame(greedy, eps) {
    const b = Array(9).fill(''); let turn = 'X'; const history = [];
    for (;;) {
      const w = winner(b);             if (w) return { outcome: w, history };
      const avail = empties(b);        if (!avail.length) return { outcome: 'draw', history };
      let move;
      if (!greedy && rand() < eps) {
        move = avail[Math.floor(rand() * avail.length)];   // explore
      } else {                                             // exploit
        let best = avail[0], bestVal = turn === 'X' ? -Infinity : Infinity;
        for (const mv of avail) {
          const nb = b.slice(); nb[mv] = turn;
          const val = afterValue(nb, getV);                // terminal payoff or V
          if (turn === 'X' ? val > bestVal : val < bestVal) { bestVal = val; best = mv; }
        }
        move = best;
      }
      b[move] = turn; history.push(key(b)); turn = turn === 'X' ? 'O' : 'X';
    }
  }

  for (let g = 0; g < games; g++) {
    const eps = eps0 + (epsMin - eps0) * (g / games);      // decay exploration
    const { outcome, history } = playGame(false, eps);
    let next = outcome === 'X' ? 1 : outcome === 'O' ? 0 : 0.5;
    for (let i = history.length - 1; i >= 0; i--) {        // TD sweep backward
      const k = history[i], cur = getV(k);
      V.set(k, cur + alpha * (next - cur));                // V[s] += α·(V[next] - V[s])
      next = getV(k);
    }
  }

  return playGame(true, 0).outcome;   // final GREEDY game — perfect play => 'draw'
}`,
  eli5: `## Playing chess against a mirror

Imagine practising chess against a mirror that always plays exactly as well as you do. Every time you get a little better, so does your reflection — so you're never bored by a weak opponent and never crushed by a strong one. You always face the perfect-difficulty rival: yourself. That is self-play, and it's how this tic-tac-toe bot learns with no teacher and no game database.

## Afterstate values and the TD update

The bot keeps one number for each board: \`V[board]\` — its guess of how that position turns out for X. New boards start at \`0.5\` (a coin-flip); finished boards are pinned to the truth (X-win \`1\`, O-win \`0\`, draw \`0.5\`). On its turn, X moves to the board with the HIGHEST \`V\`, and O to the LOWEST — they share one brain, just rooting for opposite ends. After the game ends, we walk the moves backward and nudge each board toward the next one: \`V[s] += alpha * (V[next] - V[s])\`. This is the TD (temporal-difference) update: every position slowly soaks up the eventual result.

## Why self-play makes an automatic curriculum

Because both sides use the same table, the opponent is always at your exact skill level. Beat a sloppy version of yourself, learn, and now you must beat the sharper version — an endless, self-tuning ladder of difficulty. No human has to design lessons.

## Why it converges to a draw

Tic-tac-toe is "solved": with no mistakes, X can't force a win and O can't either, so perfect play is always a \`draw\`. As both sides stop blundering, decisive games vanish and the draw rate climbs toward 100%. The final game, played greedily, ends in a draw.

## The AlphaZero connection and complexity

Swap the lookup table for a neural network and the board for Go or chess and you have AlphaZero — same loop: play yourself, predict the value, update toward the outcome. Cost here is \`O(games × moves)\`: cheap games, lots of them.

## Pitfalls

- No exploration and it collapses — the bot keeps replaying one line and never discovers better moves. You need \`epsilon\` early.
- One shared table is the trick that makes the curriculum work, but a bug that flips X's and O's preference quietly poisons learning.`,
};

export default descriptor;
