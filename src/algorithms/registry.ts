import type { AlgoDescriptor } from './types';

// Zero-wiring: every `*.algo.ts` file under this folder is picked up
// automatically. Drop in a new algorithm and it appears in the picker —
// no manual registration, so the harness never rots behind the content.
const modules = import.meta.glob<{ default: AlgoDescriptor }>('./**/*.algo.ts', {
  eager: true,
});

export const algorithms: AlgoDescriptor[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title));

export function getAlgorithm(id: string): AlgoDescriptor | undefined {
  return algorithms.find((a) => a.id === id);
}
