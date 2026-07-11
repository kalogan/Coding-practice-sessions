import type { ViewState, HexPane } from '../../algorithms/types';

type HexState = Extract<ViewState, { kind: 'hex' }>;

// Renders a byte buffer as a classic hex dump — the view every ROM hacker lives
// in. Each row: an offset, 16 two-digit hex bytes (grouped 8 + 8), and an ASCII
// gutter. `cursor` spotlights the byte under inspection; `highlights` tint a
// region (a checksum span, a matched run). Multiple panes sit side by side so an
// algorithm can show input → output (e.g. RLE compressed vs expanded).
const COLS = 16;

function hex(n: number, width: number): string {
  return (n >>> 0).toString(16).toUpperCase().padStart(width, '0');
}

function printable(b: number): string {
  return b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '·';
}

function Pane({ pane }: { pane: HexPane }) {
  const { bytes, cursor, highlights, ascii = true, label, caption } = pane;
  const hot = new Set(highlights ?? []);
  const rowCount = Math.max(1, Math.ceil(bytes.length / COLS));
  const rows = Array.from({ length: rowCount }, (_, r) => r * COLS);
  const cls = (i: number) => (i === cursor ? 'hx-byte cursor' : hot.has(i) ? 'hx-byte hot' : 'hx-byte');

  return (
    <div className="hex-pane">
      {label && <div className="hex-label">{label}</div>}
      <div className="hex-body" role="img">
        {rows.map((base) => (
          <div key={base} className="hex-line">
            <span className="hx-off">{hex(base, 4)}</span>
            <span className="hx-cells">
              {Array.from({ length: COLS }, (_, c) => {
                const i = base + c;
                const has = i < bytes.length;
                return (
                  <span key={c} className={`${has ? cls(i) : 'hx-byte pad'}${c === 7 ? ' gap' : ''}`}>
                    {has ? hex(bytes[i], 2) : '  '}
                  </span>
                );
              })}
            </span>
            {ascii && (
              <span className="hx-ascii">
                {Array.from({ length: COLS }, (_, c) => {
                  const i = base + c;
                  const has = i < bytes.length;
                  return (
                    <span key={c} className={has ? cls(i) : 'hx-byte pad'}>
                      {has ? printable(bytes[i]) : ' '}
                    </span>
                  );
                })}
              </span>
            )}
          </div>
        ))}
      </div>
      {caption && <div className="hex-caption">{caption}</div>}
    </div>
  );
}

export function HexView({ view }: { view: HexState }) {
  return (
    <div className="hex-view" data-testid="hex-view">
      {view.panes.map((p, i) => (
        <Pane key={i} pane={p} />
      ))}
    </div>
  );
}
