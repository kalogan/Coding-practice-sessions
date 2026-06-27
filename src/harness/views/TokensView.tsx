import type { ViewState } from '../../algorithms/types';

type TokensState = Extract<ViewState, { kind: 'tokens' }>;

// Draws a sequence of string tokens (search terms, notes, path segments, …).
// `role` drives the colour; an optional window shades a contiguous run.
export function TokensView({ view }: { view: TokensState }) {
  return (
    <div className="tokens-view" data-testid="tokens-view">
      {view.tokens.map((t, i) => {
        const inWindow = view.window ? i >= view.window.start && i <= view.window.end : false;
        return (
          <span
            key={i}
            className={`token role-${t.role ?? 'plain'}${inWindow ? ' in-window' : ''}`}
            data-testid={`token-${i}`}
          >
            {t.label && <small className="token-label">{t.label}</small>}
            <span className="token-text">{t.text}</span>
          </span>
        );
      })}
    </div>
  );
}
