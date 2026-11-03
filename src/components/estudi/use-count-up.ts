"use client";

import { useEffect, useState } from "react";

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Counts from 0 to `target` over `duration` ms while `run` is true; returns `target` otherwise. */
export function useCountUp(target: number, duration: number, run: boolean, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const factor = 10 ** decimals;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOut(t) * factor) / factor);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, run, decimals]);

  return run ? value : target;
}
