/**
 * Pixel-art pets, GIFs from https://github.com/tonybaloney/vscode-pets (media/<animal>/<color>_<action>_8fps.gif),
 * stored as public/pets/<id>/<action>.gif. Each pet is shown at its native size times `scale`.
 */
export type Action = "idle" | "walk" | "run" | "swipe" | "lie";

export interface PetDef {
  id: string;
  /** Integer upscale for sprites that are tiny at native size. */
  scale: number;
  /** Has a sleeping animation; the others just stand still when the music is paused. */
  lie: boolean;
  /** Length of one swipe, in ms: at least one full loop of its GIF. */
  swipeMs: number;
}

export const pets: readonly PetDef[] = [
  { id: "fox", scale: 1, lie: true, swipeMs: 1400 },
  { id: "panda", scale: 1, lie: true, swipeMs: 1500 },
  { id: "turtle", scale: 1, lie: true, swipeMs: 1500 },
  { id: "chicken", scale: 1, lie: false, swipeMs: 1250 },
  { id: "duck", scale: 1, lie: false, swipeMs: 1500 },
  { id: "deno", scale: 2, lie: false, swipeMs: 1500 },
];

export const spriteUrl = (pet: PetDef, action: Action) => `/pets/${pet.id}/${action}.gif`;

export const actionsOf = (pet: PetDef): Action[] =>
  pet.lie ? ["idle", "walk", "run", "swipe", "lie"] : ["idle", "walk", "run", "swipe"];

/** Resolves once every animation of the pet is in the browser cache (or failed to load: never blocks forever). */
export function preloadPet(pet: PetDef): Promise<void> {
  return Promise.all(
    actionsOf(pet).map(
      (action) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = image.onerror = () => resolve();
          image.src = spriteUrl(pet, action);
        }),
    ),
  ).then(() => undefined);
}

/** A random pet, never `current`. */
export function pickPet(current?: PetDef): PetDef {
  const options = pets.filter((pet) => pet.id !== current?.id);
  return options[Math.floor(Math.random() * options.length)];
}
