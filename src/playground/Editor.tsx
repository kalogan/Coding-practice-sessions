import { useMemo, useRef } from 'react';
import type { KeyboardEvent, UIEvent } from 'react';
import { highlight } from './highlight';

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string;
}

// Line-numbered code editor with syntax highlighting. A transparent textarea
// sits on top of a Prism-highlighted <pre>; both share identical metrics so the
// caret lines up with the colours. Tab inserts two spaces; scroll stays synced.
export function Editor({ value, onChange, language }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(
    () => Array.from({ length: value.split('\n').length }, (_, i) => i + 1),
    [value],
  );
  const html = useMemo(() => highlight(value, language), [value, language]);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      onChange(value.slice(0, start) + '  ' + value.slice(end));
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  function onScroll(e: UIEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = t.scrollTop;
      preRef.current.scrollLeft = t.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = t.scrollTop;
  }

  return (
    <div className="editor" data-language={language}>
      <div className="editor-gutter" ref={gutterRef} aria-hidden="true">
        {lines.map((n) => (
          <div key={n} className="ln">
            {n}
          </div>
        ))}
      </div>
      <div className="editor-code">
        <pre className="editor-highlight" ref={preRef} aria-hidden="true">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
        <textarea
          ref={taRef}
          className="editor-area"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          data-testid="code-editor"
        />
      </div>
    </div>
  );
}
