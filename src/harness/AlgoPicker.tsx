import type { AlgoDescriptor } from '../algorithms/types';

interface Props {
  algorithms: AlgoDescriptor[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AlgoPicker({ algorithms, selectedId, onSelect }: Props) {
  const byCategory = new Map<string, AlgoDescriptor[]>();
  for (const a of algorithms) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  return (
    <nav className="picker" data-testid="picker">
      {[...byCategory.entries()].map(([category, list]) => (
        <div key={category} className="picker-group">
          <h4>{category}</h4>
          {list.map((a) => (
            <button
              key={a.id}
              className={`picker-item${a.id === selectedId ? ' active' : ''}`}
              onClick={() => onSelect(a.id)}
            >
              {a.title}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
