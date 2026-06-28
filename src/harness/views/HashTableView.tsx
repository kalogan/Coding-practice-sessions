import type { ViewState } from '../../algorithms/types';

type HashState = Extract<ViewState, { kind: 'hashtable' }>;

// Draws a hash table as a column of buckets; each bucket shows its index and the
// chain of entries living in it (separate chaining). Roles colour the bucket
// being probed and the matched/active entry.
export function HashTableView({ view }: { view: HashState }) {
  return (
    <div className="hashtable-view" data-testid="hashtable-view">
      {view.buckets.map((b) => (
        <div key={b.index} className={`hash-bucket role-${b.role ?? 'plain'}`}>
          <div className="hash-index">{b.index}</div>
          <div className="hash-chain">
            {b.entries.length === 0 && <span className="hash-empty">·</span>}
            {b.entries.map((e, i) => (
              <span key={i} className={`hash-entry role-${e.role ?? 'plain'}`}>
                {e.key}
                {e.value !== undefined && <small>:{e.value}</small>}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
