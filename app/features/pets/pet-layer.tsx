import { useEffect, useRef, useState } from "react";

export type PetMood = "sleepy" | "calm" | "lively";
type Action = "idle" | "walk" | "run" | "swipe" | "lie";

const sprites: Record<Action, string> = {
  idle: "/pets/fox/red_idle.gif",
  walk: "/pets/fox/red_walk.gif",
  run: "/pets/fox/red_run.gif",
  swipe: "/pets/fox/red_swipe.gif",
  lie: "/pets/fox/red_lie.gif",
};

/** Horizontal speed in px/s. */
const speed: Record<Action, number> = { idle: 0, walk: 45, run: 120, swipe: 0, lie: 0 };
/** How long an action lasts, in ms [min, max]. The swipe GIF is 11 frames at 8fps: one loop. */
const duration: Record<Action, readonly [number, number]> = {
  idle: [1500, 4000],
  walk: [2000, 6000],
  run: [1200, 3000],
  swipe: [1400, 1400],
  lie: [6000, 14000],
};
/** Relative odds of the next action, per mood: asleep when the music is paused, wild when it is loud. */
const weights: Record<PetMood, Partial<Record<Action, number>>> = {
  sleepy: { lie: 5, idle: 2, walk: 1 },
  calm: { walk: 4, idle: 2, swipe: 1, run: 1, lie: 1 },
  lively: { run: 4, walk: 3, swipe: 2, idle: 1 },
};

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

/** Weighted random pick that never repeats the current action. */
function pickNext(mood: PetMood, current: Action): Action {
  const options = (Object.entries(weights[mood]) as Array<[Action, number]>).filter(([action]) => action !== current);
  let roll = Math.random() * options.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [action, weight] of options) {
    if ((roll -= weight) < 0) return action;
  }
  return options[0][0];
}

/**
 * A pixel-art fox that wanders along the top edge of its positioned parent.
 * Off with reduced motion. Clicking it (or pressing Enter/Space on it) keeps it still, wagging its tail,
 * until clicked again; everywhere else the layer lets clicks through to the player.
 */
export function PetLayer({ mood }: { mood: PetMood }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLButtonElement>(null);
  const moodRef = useRef(mood);
  const heldRef = useRef(false);
  const [held, setHeld] = useState(false);
  const [action, setAction] = useState<Action>("idle");
  const [enabled, setEnabled] = useState(false);

  moodRef.current = mood;
  heldRef.current = held;

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // Preload every animation so switching GIFs never flashes an empty frame.
    Object.values(sprites).forEach((src) => (new Image().src = src));
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const pet = petRef.current;
    if (!enabled || !layer || !pet) return;

    let x = Math.random() * Math.max(layer.clientWidth - pet.offsetWidth, 0);
    let direction = 1;
    let current: Action = "idle";
    let last = performance.now();
    let until = last + between(duration.idle);
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 100) / 1000; // clamp so a background tab does not teleport the pet
      last = now;

      const woken = current === "lie" && moodRef.current !== "sleepy";
      if (heldRef.current) {
        // Standing still: the idle GIF is the one that wags its tail. Moving on is immediate once released.
        if (current !== "idle") {
          current = "idle";
          setAction(current);
        }
        until = now;
      } else if (now >= until || woken) {
        current = pickNext(moodRef.current, current);
        until = now + between(duration[current]);
        if (speed[current] && Math.random() < 0.5) direction = -direction;
        setAction(current);
      }

      const max = Math.max(layer.clientWidth - pet.offsetWidth, 0);
      x += direction * speed[current] * elapsed;
      if (x < 0 || x > max) {
        x = Math.min(Math.max(x, 0), max);
        direction = x === 0 ? 1 : -1;
      }
      pet.style.transform = `translate3d(${x}px,0,0) scaleX(${direction})`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-x-0 bottom-full h-14 overflow-hidden sm:h-[75px]">
      <button
        ref={petRef}
        type="button"
        aria-pressed={held}
        aria-label="Fox: keep it still and wagging"
        onClick={() => setHeld((value) => !value)}
        className="pointer-events-auto absolute bottom-0 left-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-link"
      >
        <img
          src={sprites[action]}
          alt=""
          draggable={false}
          className="block h-14 w-auto select-none [image-rendering:pixelated] sm:h-[75px]"
        />
      </button>
    </div>
  );
}
