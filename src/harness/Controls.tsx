interface Props {
  stepIndex: number;
  total: number;
  playing: boolean;
  speed: number;
  onPlayPause: () => void;
  onStep: (delta: number) => void;
  onScrub: (index: number) => void;
  onSpeed: (speed: number) => void;
  onRestart: () => void;
}

export function Controls(p: Props) {
  return (
    <div className="controls" data-testid="controls">
      <button className="ctl" onClick={p.onRestart} title="Restart">
        ⟲
      </button>
      <button className="ctl" onClick={() => p.onStep(-1)} title="Step back" disabled={p.stepIndex <= 0}>
        ◀
      </button>
      <button className="ctl play" onClick={p.onPlayPause} data-testid="play">
        {p.playing ? '❚❚ Pause' : '▶ Play'}
      </button>
      <button
        className="ctl"
        onClick={() => p.onStep(1)}
        title="Step forward"
        disabled={p.stepIndex >= p.total - 1}
      >
        ▶
      </button>
      <input
        className="scrub"
        type="range"
        min={0}
        max={Math.max(0, p.total - 1)}
        value={p.stepIndex}
        onChange={(e) => p.onScrub(Number(e.target.value))}
        aria-label="Scrub steps"
      />
      <span className="step-counter" data-testid="step-counter">
        {p.stepIndex + 1}/{p.total}
      </span>
      <label className="speed">
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.5}
          value={p.speed}
          onChange={(e) => p.onSpeed(Number(e.target.value))}
          aria-label="Playback speed"
        />
        {p.speed}×
      </label>
    </div>
  );
}
