// Shared, deterministic layout helpers for graph-view algorithms. Positions are
// normalized 0..1 (the GraphView maps them into its viewBox).

/** Evenly spaces ids around a circle (good for general graphs). */
export function circleLayout(ids: string[]): Record<string, { x: number; y: number }> {
  const n = Math.max(1, ids.length);
  const out: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    const t = (2 * Math.PI * i) / n - Math.PI / 2; // start at top
    out[id] = { x: 0.5 + 0.4 * Math.cos(t), y: 0.5 + 0.42 * Math.sin(t) };
  });
  return out;
}

/**
 * Positions a binary tree / heap stored as a level-order array. Node i sits at
 * depth floor(log2(i+1)), spread evenly across its level. Good for heaps.
 */
export function binaryTreeLayout(count: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  const depth = count > 0 ? Math.floor(Math.log2(count)) : 0;
  for (let i = 0; i < count; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelStart = (1 << level) - 1; // first index on this level
    const indexInLevel = i - levelStart;
    const nodesInLevel = 1 << level;
    const x = (indexInLevel + 1) / (nodesInLevel + 1);
    const y = depth === 0 ? 0.5 : level / depth;
    out.push({ x, y });
  }
  return out;
}
