import { useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  /** sidebar content; receives a `close` callback to dismiss the mobile drawer on navigation */
  sidebar: (close: () => void) => ReactNode;
  children: ReactNode;
  /** extra class on the root (e.g. "preview-mode") */
  className?: string;
}

// The page shell shared by every entry (/, /preview, /playground). On desktop
// the sidebar is a fixed column. On mobile it collapses into an off-canvas
// drawer behind a hamburger in a sticky top bar, so the actual content is the
// first thing you see. Selecting an item closes the drawer.
export function AppShell({ sidebar, children, className }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className={`app${className ? ` ${className}` : ''}${open ? ' nav-open' : ''}`}>
      <header className="mobile-topbar">
        <button
          className="hamburger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          data-testid="hamburger"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="mobile-brand">
          Algo<span>Harness</span>
        </span>
      </header>

      <aside className="sidebar" data-testid="sidebar">
        {sidebar(close)}
      </aside>

      {open && <div className="nav-scrim" onClick={close} data-testid="nav-scrim" />}

      <main className="stage">{children}</main>
    </div>
  );
}
