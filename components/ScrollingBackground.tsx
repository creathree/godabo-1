/** 全画面・縦方向シームレスループ（public/images/back.jpeg） */
export function ScrollingBackground() {
  return (
    <div
      className="scrolling-back-viewport pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="scrolling-back-blur">
        <div className="scrolling-back-track">
          <div className="scrolling-back-layer" />
          <div className="scrolling-back-layer" />
        </div>
      </div>
    </div>
  );
}