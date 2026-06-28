import type { TraceStep } from '../algorithms/types';
import { ArrayView } from './views/ArrayView';
import { TokensView } from './views/TokensView';
import { StackView } from './views/StackView';
import { GridView } from './views/GridView';
import { GraphView } from './views/GraphView';
import { LinkedListView } from './views/LinkedListView';
import { HashTableView } from './views/HashTableView';
import { SegTreeView } from './views/SegTreeView';
import { HeapArrayView } from './views/HeapArrayView';
import { ChartView } from './views/ChartView';
import { NetworkView } from './views/NetworkView';
import { ConvView } from './views/ConvView';

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
      {v.kind === 'list' && <LinkedListView view={v} />}
      {v.kind === 'hashtable' && <HashTableView view={v} />}
      {v.kind === 'segtree' && <SegTreeView view={v} />}
      {v.kind === 'heaparray' && <HeapArrayView view={v} />}
      {v.kind === 'chart' && <ChartView view={v} />}
      {v.kind === 'network' && <NetworkView view={v} />}
      {v.kind === 'conv' && <ConvView view={v} />}
    </div>
  );
}
