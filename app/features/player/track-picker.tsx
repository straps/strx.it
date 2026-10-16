import type { RefObject } from "react";

import { Icon } from "~/components/icons";
import { cx } from "~/components/ui";

export interface PickerTrack {
  id: string;
  title: string;
  duration: string;
  cover: string | null;
}

interface TrackPickerProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** Tracks in the order to show them (newest release first). */
  tracks: readonly PickerTrack[];
  currentId?: string;
  onSelect: (id: string) => void;
}

/** Modal list of the tracks, built on the native <dialog>: focus trap, Escape and backdrop come for free. */
export function TrackPicker({ dialogRef, tracks, currentId, onSelect }: TrackPickerProps) {
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="track-picker-title"
      // A click on the backdrop lands on the dialog itself, not on its content.
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 id="track-picker-title" className="m-0 text-base font-semibold">
          Tracks
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-hover"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <ul className="m-0 flex max-h-[min(30rem,70dvh)] list-none flex-col overflow-y-auto p-2">
        {tracks.map((track) => {
          const current = track.id === currentId;
          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(track.id);
                  close();
                }}
                aria-current={current || undefined}
                className={cx(
                  "flex min-h-14 w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-hover",
                  current && "bg-chip",
                )}
              >
                {track.cover ? (
                  <img src={track.cover} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded-md object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-md bg-chip text-accent">
                    <Icon name="audioLines" size={18} />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{track.title}</span>
                <span className={cx("shrink-0 font-mono text-xs", current ? "text-accent" : "text-muted")}>
                  {current ? "now playing" : track.duration}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
