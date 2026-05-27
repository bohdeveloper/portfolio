import type React from "react";

export function useCardHolo() {
  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--card-x",   `${x * 100}%`);
    el.style.setProperty("--card-y",   `${y * 100}%`);
    el.style.setProperty("--card-rx",  `${(y - 0.5) * -14}deg`);
    el.style.setProperty("--card-ry",  `${(x - 0.5) * 18}deg`);
    el.style.setProperty("--card-hue", `${x * 300}deg`);
  }

  function onMouseLeave(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--card-rx", "0deg");
    el.style.setProperty("--card-ry", "0deg");
  }

  return { onMouseMove, onMouseLeave } as const;
}
