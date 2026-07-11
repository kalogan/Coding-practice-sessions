import type { CExercise } from './types';

// Zero-wiring: every `*.cx.ts` under this folder joins the ladder automatically,
// ordered by `order`. Drop a file in, it appears — the UI never rots behind the
// content (same contract as the algorithm registry).
const modules = import.meta.glob<{ default: CExercise }>('./**/*.cx.ts', {
  eager: true,
});

export const cExercises: CExercise[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order);

export function getExercise(id: string): CExercise | undefined {
  return cExercises.find((e) => e.id === id);
}

/** Ladder grouped by module, preserving order. */
export function exercisesByModule(): { module: string; items: CExercise[] }[] {
  const groups: { module: string; items: CExercise[] }[] = [];
  for (const ex of cExercises) {
    let g = groups.find((x) => x.module === ex.module);
    if (!g) {
      g = { module: ex.module, items: [] };
      groups.push(g);
    }
    g.items.push(ex);
  }
  return groups;
}
