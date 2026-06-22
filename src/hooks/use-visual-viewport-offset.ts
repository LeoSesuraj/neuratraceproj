import { useEffect, useState } from "react";

/**
 * Returns the number of CSS pixels the bottom of the layout viewport is
 * obscured by the on-screen keyboard (or other browser UI). Use this to
 * lift a sticky input above the iOS virtual keyboard.
 */
export function useVisualViewportOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => {
      // Distance from the bottom of the layout viewport to the bottom of the visual viewport.
      const next = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop,
      );
      setOffset(next);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}
