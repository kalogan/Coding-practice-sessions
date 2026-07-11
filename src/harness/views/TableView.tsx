import type { ViewState, DataTable } from '../../algorithms/types';

type TableState = Extract<ViewState, { kind: 'table' }>;

// Renders one or more labelled tables — relational rows, query results, or a
// numeric tensor. With `heat` set, cells are coloured by value (the x-ray view);
// `flags` mark anomalous cells (NaN / out of range) with a red border.
function heatStyle(v: unknown, lo: number, hi: number): React.CSSProperties {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return { background: 'rgba(248,81,73,0.25)' };
  const t = hi === lo ? 0.5 : Math.max(0, Math.min(1, (n - lo) / (hi - lo)));
  return { background: `rgba(88, 166, 255, ${0.1 + 0.72 * t})` };
}

function TableBlock({ t }: { t: DataTable }) {
  const lo = t.heatMin ?? Math.min(...t.rows.flat().map(Number).filter(Number.isFinite), 0);
  const hi = t.heatMax ?? Math.max(...t.rows.flat().map(Number).filter(Number.isFinite), 1);
  const flagged = new Set((t.flags ?? []).map((f) => `${f.row},${f.col}`));
  const spot = t.highlightCell ? `${t.highlightCell.row},${t.highlightCell.col}` : null;
  return (
    <div className="dt-block">
      {t.name && <div className="dt-name">{t.name}</div>}
      <table className="dt">
        <thead>
          <tr>
            {t.columns.map((c, i) => (
              <th key={i} className={t.highlightCol === i ? 'hl' : ''}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((row, r) => (
            <tr key={r} className={t.highlightRow === r ? 'hl' : ''}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`${t.heat ? 'heat' : ''}${flagged.has(`${r},${c}`) ? ' flag' : ''}${
                    spot === `${r},${c}` ? ' spot' : ''
                  }`}
                  style={t.heat ? heatStyle(cell, lo, hi) : undefined}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {t.caption && <div className="dt-caption">{t.caption}</div>}
    </div>
  );
}

export function TableView({ view }: { view: TableState }) {
  return (
    <div className="table-view" data-testid="table-view">
      {view.tables.map((t, i) => (
        <TableBlock key={i} t={t} />
      ))}
    </div>
  );
}
