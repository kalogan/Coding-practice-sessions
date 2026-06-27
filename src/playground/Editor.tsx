import { useMemo, useRef } from 'react';
import type { KeyboardEvent, UIEvent } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string;
}

// Lightweight line-numbered code editor (a textarea + a synced gutter). No
// heavyweight editor dependency; Tab inserts two spaces.
export function Editor({ value, onChange, language }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(
    () => Array.from({ length: value.split('\n').length }, (_, i) => i + 1),
    [value],
  );

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
    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
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
  );
}
