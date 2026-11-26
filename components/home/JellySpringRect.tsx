"use client";

import { useCallback, useRef } from "react";

export function JellySpringRect() {
  const ref = useRef<HTMLButtonElement>(null);

  const playSpring = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("jelly-rect--bounce");
    void el.offsetWidth;
    el.classList.add("jelly-rect--bounce");
  }, []);

  const onAnimationEnd = useCallback(() => {
    ref.current?.classList.remove("jelly-rect--bounce");
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className="jelly-rect pointer-events-auto absolute z-30 rounded-md border border-sky-600/40 bg-sky-500 shadow-lg shadow-sky-900/30"
      style={{ width: 100, height: 200, left: 100, top: 100 }}
      onClick={playSpring}
      onAnimationEnd={onAnimationEnd}
      aria-label="ゼリーバネのデモ（クリックで上に伸びる）"
    />
  );
}