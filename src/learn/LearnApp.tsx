import { useState } from 'react';
import { CURRICULUM } from '../curriculum';
import { getAlgorithm } from '../algorithms/registry';
import type { AlgoDescriptor } from '../algorithms/types';

const KEY = 'algoharness-progress';

function loadDone(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

// The study path (/learn): every algorithm in a deliberate learning order, with
// per-item progress saved to localStorage. Each algorithm deep-links into the
// main app via ?algo=<id>.
export function LearnApp() {
  const [done, setDone] = useState<Set<string>>(() => loadDone());

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });

  const allIds = CURRICULUM.flatMap((m) => m.algoIds);
  const totalDone = allIds.filter((id) => done.has(id)).length;

  return (
    <div className="learn">
      <header className="learn-head">
        <a className="learn-back" href="/">
          ← AlgoHarness
        </a>
        <h1>🎓 Study Path</h1>
        <p className="learn-sub">
          A guided order through all {allIds.length} algorithms — from the two-pointer window up to training
          game bots. Click any one to open it; tick them off as you go (saved on this device).
        </p>
        <div className="learn-progress">
          <div className="learn-bar">
            <div className="learn-bar-fill" style={{ width: `${(totalDone / allIds.length) * 100}%` }} />
          </div>
          <span className="learn-progress-label">
            {totalDone} / {allIds.length} complete
          </span>
        </div>
      </header>

      <ol className="modules">
        {CURRICULUM.map((m, mi) => {
          const algos = m.algoIds.flatMap((id): AlgoDescriptor[] => {
            const a = getAlgorithm(id);
            return a ? [a] : [];
          });
          const mDone = m.algoIds.filter((id) => done.has(id)).length;
          return (
            <li key={m.id} className="module">
              <div className="module-head">
                <span className="module-num">{mi + 1}</span>
                <div className="module-meta">
                  <h2>{m.title}</h2>
                  <p>{m.blurb}</p>
                </div>
                <span className="module-prog">
                  {mDone}/{m.algoIds.length}
                </span>
              </div>
              <ul className="module-algos">
                {algos.map((a) => (
                  <li key={a.id} className={`learn-algo${done.has(a.id) ? ' is-done' : ''}`}>
                    <button
                      className="learn-check"
                      onClick={() => toggle(a.id)}
                      aria-label={done.has(a.id) ? 'Mark not done' : 'Mark done'}
                      data-testid={`check-${a.id}`}
                    >
                      {done.has(a.id) ? '✓' : ''}
                    </button>
                    <a className="learn-link" href={`/?algo=${a.id}`}>
                      <span className="learn-algo-title">{a.title}</span>
                      <span className="learn-algo-meta">
                        <span className={`diff-dot diff-${(a.difficulty ?? 'Medium').toLowerCase()}`} />
                        <span className="learn-cat">{a.category}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
