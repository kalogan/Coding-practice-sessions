import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lesson } from './exercises/types';
import type { CResource } from './exercises/resources';

// Render text with blank-line paragraphs and inline `code` spans (backticks).
// Deliberately tiny — lessons are plain prose, not full markdown.
function rich(text: string): ReactNode[] {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para, pi) => (
      <p key={pi}>
        {para.split(/(`[^`]+`)/).map((chunk, ci) =>
          chunk.startsWith('`') && chunk.endsWith('`') ? (
            <code key={ci}>{chunk.slice(1, -1)}</code>
          ) : (
            <Fragment key={ci}>{chunk}</Fragment>
          ),
        )}
      </p>
    ));
}

interface Props {
  lesson: Lesson;
  title: string;
  resources?: CResource[];
}

// The right-hand "teacher": explains the session before you write a line of code.
export function LessonPanel({ lesson, title, resources }: Props) {
  const [hintOpen, setHintOpen] = useState(false);

  return (
    <aside className="lesson-panel" data-testid="lesson-panel" aria-label="Lesson">
      <div className="lesson-scroll">
        <h3 className="lesson-title">{title}</h3>

        <div className="lesson-body">{rich(lesson.intro)}</div>

        {lesson.sections?.map((s, i) => (
          <section key={i} className="lesson-section">
            <h4>{s.heading}</h4>
            <div className="lesson-body">{rich(s.body)}</div>
          </section>
        ))}

        {lesson.workedExample && (
          <section className="lesson-section">
            <h4>Worked example</h4>
            <pre className="lesson-example">{lesson.workedExample}</pre>
          </section>
        )}

        {lesson.whyItMatters && (
          <section className="lesson-section lesson-why">
            <h4>Why it matters</h4>
            <div className="lesson-body">{rich(lesson.whyItMatters)}</div>
          </section>
        )}

        {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
          <section className="lesson-section">
            <h4>Common mistakes</h4>
            <ul className="lesson-mistakes">
              {lesson.commonMistakes.map((m, i) => (
                <li key={i}>{rich(m)}</li>
              ))}
            </ul>
          </section>
        )}

        {lesson.hint && (
          <section className="lesson-section">
            <button
              className="lesson-hint-toggle"
              onClick={() => setHintOpen((o) => !o)}
              aria-expanded={hintOpen}
              data-testid="lesson-hint-toggle"
            >
              {hintOpen ? 'Hide hint' : 'Show a hint'}
            </button>
            {hintOpen && <div className="lesson-body lesson-hint">{rich(lesson.hint)}</div>}
          </section>
        )}

        {resources && resources.length > 0 && (
          <section className="lesson-section lesson-resources" data-testid="lesson-resources">
            <h4>Go deeper</h4>
            <ul className="lesson-links">
              {resources.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.label}
                    <span aria-hidden="true"> ↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}
