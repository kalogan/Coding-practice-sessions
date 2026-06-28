import type { ReactNode } from 'react';

// Renders the algorithm's plain-language breakdown in an expandable section at
// the bottom of the page. Tiny markup: blank line = new paragraph, "## " =
// sub-heading, "- " = bullet, `backticks` = inline code.
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((seg, i) =>
    seg.startsWith('`') && seg.endsWith('`') ? (
      <code key={i}>{seg.slice(1, -1)}</code>
    ) : (
      <span key={i}>{seg}</span>
    ),
  );
}

export function Eli5({ text }: { text: string }) {
  const lines = text.trim().split('\n');
  const out: ReactNode[] = [];
  let para: string[] = [];
  let bullets: string[] = [];
  const flushPara = () => {
    if (para.length) {
      out.push(<p key={out.length}>{inline(para.join(' '))}</p>);
      para = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      out.push(
        <ul key={out.length}>
          {bullets.map((b, i) => (
            <li key={i}>{inline(b)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      flushPara();
      flushBullets();
    } else if (line.startsWith('## ')) {
      flushPara();
      flushBullets();
      out.push(<h4 key={out.length}>{inline(line.slice(3))}</h4>);
    } else if (line.startsWith('- ')) {
      flushPara();
      bullets.push(line.slice(2));
    } else {
      flushBullets();
      para.push(line);
    }
  }
  flushPara();
  flushBullets();

  return (
    <details className="eli5" data-testid="eli5">
      <summary>📖 Explain like I&apos;m 5 — the full breakdown</summary>
      <div className="eli5-body">{out}</div>
    </details>
  );
}
