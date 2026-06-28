import { useMemo, useState } from 'react';
import type { AlgoDescriptor } from '../algorithms/types';

interface Props {
  algorithms: AlgoDescriptor[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;
type Filter = (typeof DIFFICULTIES)[number];

export function AlgoPicker({ algorithms, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [diff, setDiff] = useState<Filter>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return algorithms.filter((a) => {
      const d = a.difficulty ?? 'Medium';
      if (diff !== 'All' && d !== diff) return false;
      if (!q) return true;
      return `${a.title} ${a.category}`.toLowerCase().includes(q);
    });
  }, [algorithms, query, diff]);

  const byCategory = new Map<string, AlgoDescriptor[]>();
  for (const a of filtered) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  return (
    <nav className="picker" data-testid="picker">
      <input
        className="picker-search"
        type="search"
        placeholder="Search algorithms…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search algorithms"
        data-testid="algo-search"
      />
      <div className="diff-tabs" data-testid="diff-tabs">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`diff-tab${diff === d ? ' active' : ''}`}
            onClick={() => setDiff(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="picker-empty">No matches.</p>}

      {[...byCategory.entries()].map(([category, list]) => (
        <div key={category} className="picker-group">
          <h4>{category}</h4>
          {list.map((a) => {
            const d = a.difficulty ?? 'Medium';
            return (
              <button
                key={a.id}
                className={`picker-item${a.id === selectedId ? ' active' : ''}`}
                onClick={() => onSelect(a.id)}
              >
                <span className="picker-item-title">{a.title}</span>
                <span className={`diff-dot diff-${d.toLowerCase()}`} title={d} />
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
