import { useEffect, useState } from "react";

interface ScrolledOptions {
  /** Becomes true once scrolled past this many px. */
  enter?: number;
  /** Goes back to false only above this many px. */
  leave?: number;
}

/**
 * Tracks whether the page is scrolled, with hysteresis.
 * Elements that resize on scroll (e.g. a compacting sticky header) make the browser adjust
 * scrollY via scroll anchoring; the gap between `enter` and `leave` must exceed that size change,
 * otherwise the state flips back and forth. False during SSR and on first render.
 */
export function useScrolled({ enter = 80, leave = 8 }: ScrolledOptions = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled((prev) => (prev ? window.scrollY > leave : window.scrollY > enter));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enter, leave]);

  return scrolled;
}
