import { useEffect, useRef, useState } from "react";

import { type Action, type PetDef, pickPet, preloadPet, spriteUrl } from "./pets";

export type PetMood = "sleepy" | "lively";
type Phase = "roam" | "leaving" | "arriving";

/** Horizontal speed in px/s. */
const speed: Record<Action, number> = { idle: 0, walk: 45, run: 120, swipe: 0, lie: 0 };
/** How long an action lasts, in ms [min, max]. Swipe is set per pet. */
const duration: Record<Exclude<Action, "swipe">, readonly [number, number]> = {
  idle: [1500, 4000],
  walk: [2000, 6000],
  run: [1200, 3000],
  lie: [6000, 14000],
};
/** Relative odds of the next action, per mood: asleep when the music is paused, restless while it plays. */
const weights: Record<PetMood, Partial<Record<Action, number>>> = {
  sleepy: { lie: 5, idle: 2, walk: 1 },
  lively: { run: 4, walk: 3, swipe: 2, idle: 1 },
};
/** A pet stays this long (ms [min, max]) before walking off and being replaced by another one. */
const stay = [30_000, 60_000] as const;
/** Sprites are at most this wide: used to park a pet fully off-screen. */
const MAX_SPRITE_WIDTH = 240;

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

/** Weighted random pick that never repeats the current action. Pets without a sleep animation never lie. */
function pickNext(pet: PetDef, mood: PetMood, current: Action): Action {
  const options = (Object.entries(weights[mood]) as Array<[Action, number]>).filter(
    ([action]) => action !== current && (action !== "lie" || pet.lie),
  );
  let roll = Math.random() * options.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [action, weight] of options) {
    if ((roll -= weight) < 0) return action;
  }
  return options[0][0];
}

/**
 * Pixel-art pets that wander along the top edge of the positioned parent, one at a time:
 * every 30 to 60 seconds the current one walks off and another, loaded only then, walks in.
 * Off with reduced motion. Clicking the pet (or pressing Enter/Space on it) keeps it still,
 * wagging its tail, until clicked again; elsewhere the layer lets clicks through to the player.
 */
export function PetLayer({ mood }: { mood: PetMood }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLButtonElement>(null);
  const moodRef = useRef(mood);
  const heldRef = useRef(false);
  const petDefRef = useRef<PetDef>(null as unknown as PetDef);
  const [pet, setPet] = useState(() => pickPet());
  const [action, setAction] = useState<Action>("idle");
  const [held, setHeld] = useState(false);
  const [enabled, setEnabled] = useState(false);
  // Hidden until the first pet is loaded and placed: otherwise it flashes at the left edge before jumping.
  const [placed, setPlaced] = useState(false);

  moodRef.current = mood;
  heldRef.current = held;
  petDefRef.current = pet;

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const button = petRef.current;
    if (!enabled || !layer || !button) return;

    let cancelled = false;
    let phase: Phase = "roam";
    let x = 0;
    let direction = 1;
    let current: Action = "idle";
    let last = performance.now();
    let until = last;
    let leaveAt = last + between(stay);
    let incoming: PetDef | undefined;
    let incomingReady = false;
    let frame = 0;

    const show = (next: Action) => {
      current = next;
      setAction(next);
    };
    const travelAction = (): Action => (moodRef.current === "lively" ? "run" : "walk");
    const width = () => button.offsetWidth;
    const layerWidth = () => layer.clientWidth;

    // First pet: preload it, then drop it somewhere on the bar.
    void preloadPet(petDefRef.current).then(() => {
      if (cancelled) return;
      x = Math.random() * Math.max(layerWidth() - width(), 0);
      button.style.transform = `translate3d(${x}px,0,0) scaleX(${direction})`;
      setPlaced(true);
    });

    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 100) / 1000; // clamp so a background tab does not teleport the pet
      last = now;
      const max = Math.max(layerWidth() - width(), 0);

      if (heldRef.current) {
        // Standing still: the idle GIF is the one that wags its tail. Moving on is immediate once released.
        if (current !== "idle") show("idle");
        until = now;
      } else if (phase === "roam") {
        if (now >= leaveAt) {
          phase = "leaving";
          incoming = pickPet(petDefRef.current);
          incomingReady = false;
          void preloadPet(incoming).then(() => (incomingReady = true));
          direction = x + width() / 2 < layerWidth() / 2 ? -1 : 1;
          show(travelAction());
        } else if (now >= until || (current === "lie" && moodRef.current !== "sleepy")) {
          const next = pickNext(petDefRef.current, moodRef.current, current);
          until = now + (next === "swipe" ? petDefRef.current.swipeMs : between(duration[next]));
          if (speed[next] && Math.random() < 0.5) direction = -direction;
          show(next);
        }
      } else if (phase === "leaving") {
        const offscreen = x + width() < 0 || x > layerWidth();
        if (offscreen && incoming && incomingReady) {
          // Swap while nobody can see it, then come back in from a random side.
          setPet(incoming);
          phase = "arriving";
          direction = Math.random() < 0.5 ? 1 : -1; // entering from the left walks right, from the right walks left
          x = direction === 1 ? -MAX_SPRITE_WIDTH : layerWidth() + MAX_SPRITE_WIDTH;
          show(travelAction());
        } else if (offscreen) {
          show("idle"); // waiting off-screen for the next pet to finish loading
        }
      } else if (x >= 0 && x <= max) {
        phase = "roam";
        leaveAt = now + between(stay);
        until = now;
      }

      x += direction * speed[current] * elapsed;
      if (phase === "roam") {
        if (x < 0 || x > max) {
          x = Math.min(Math.max(x, 0), max);
          direction = x === 0 ? 1 : -1;
        }
      }
      button.style.transform = `translate3d(${x}px,0,0) scaleX(${direction})`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-x-0 bottom-full h-0">
      <button
        ref={petRef}
        type="button"
        aria-pressed={held}
        aria-label="Pet: keep it still and wagging"
        onClick={() => setHeld((value) => !value)}
        className={`pointer-events-auto absolute bottom-0 left-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-link ${placed ? "" : "invisible"}`}
      >
        <img
          src={spriteUrl(pet, action)}
          alt=""
          draggable={false}
          style={{ zoom: pet.scale }}
          className="block max-w-none select-none [image-rendering:pixelated]"
        />
      </button>
    </div>
  );
}
