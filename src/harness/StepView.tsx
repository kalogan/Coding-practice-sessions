import type { TraceStep } from '../algorithms/types';
import { ArrayView } from './views/ArrayView';
import { TokensView } from './views/TokensView';
import { StackView } from './views/StackView';
import { GridView } from './views/GridView';
import { GraphView } from './views/GraphView';

// Dispatches a step to the right renderer by its view kind. The player
// (controls/scrub/state/notes) is identical across every algorithm — only the
// visual surface swaps. Renderer-agnostic test hook: [data-testid="step-view"].
export function StepView({ step }: { step: TraceStep }) {
  const v = step.view;
  return (
    <div className="step-view" data-testid="step-view">
      {v.kind === 'array' && <ArrayView view={v} />}
      {v.kind === 'tokens' && <TokensView view={v} />}
      {v.kind === 'stack' && <StackView view={v} />}
      {v.kind === 'grid' && <GridView view={v} />}
      {v.kind === 'graph' && <GraphView view={v} />}
    </div>
  );
}
