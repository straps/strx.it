import { useCallback, useEffect, useRef, useState } from "react";

import { Icon, type IconName } from "~/components/icons";
import { cx } from "~/components/ui";

import tracks from "./tracks.json";

type Track = (typeof tracks)[number];

const serviceLinks = [
  { key: "youtube", label: "YouTube", icon: "youtube" },
  { key: "soundcloud", label: "SoundCloud", icon: "audioLines" },
  { key: "instagram", label: "Instagram", icon: "instagram" },
] as const satisfies ReadonlyArray<{ key: keyof Track["links"]; label: string; icon: IconName }>;

const controlClass =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg hover:bg-surface-hover";

/** Fisher-Yates shuffle that never starts with `avoidFirst`, so a reshuffle cannot repeat the last track. */
function shuffle(list: Track[], avoidFirst?: string) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.length > 1 && result[0].id === avoidFirst) result.push(result.shift()!);
  return result;
}

function formatTime(seconds: number) {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Fixed bottom player: random track order, starts playing muted (the only autoplay browsers allow). */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState({ current: 0, total: 0 });

  // Shuffle after mount: doing it during render would differ between server and client.
  useEffect(() => setQueue(shuffle(tracks)), []);

  const track = queue[index];

  const next = useCallback(() => {
    if (index + 1 < queue.length) return setIndex(index + 1);
    setQueue(shuffle(tracks, queue[index]?.id));
    setIndex(0);
  }, [index, queue]);

  // Autoplay on every track change. If the browser refuses (autoplay policy), retry on the first user gesture.
  useEffect(() => {
    const audio = audioRef.current;
    if (!track || !audio) return;
    const gestures = ["pointerdown", "keydown", "touchend"] as const;
    const retry = () => void audio.play().catch(() => {});
    const stopWaiting = () => gestures.forEach((type) => window.removeEventListener(type, retry));
    audio.play().catch(() => gestures.forEach((type) => window.addEventListener(type, retry, { once: true })));
    return stopWaiting;
  }, [track]);

  const toggle = () => {
    const audio = audioRef.current;
    if (audio) void (audio.paused ? audio.play() : audio.pause());
  };

  if (!track) return null;

  return (
    <aside aria-label="Music player" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur-md">
      <audio
        ref={audioRef}
        src={track.audio}
        muted={muted}
        autoPlay
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
        onTimeUpdate={(e) => setTime({ current: e.currentTarget.currentTime, total: e.currentTarget.duration || 0 })}
      />

      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={time.total || 1}
        step={0.5}
        value={time.current}
        onChange={(e) => {
          if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
        }}
        style={{ "--progress": `${time.total ? (time.current / time.total) * 100 : 0}%` } as React.CSSProperties}
        className="player-range block h-1 w-full"
      />

      <div className="mx-auto flex max-w-site items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6">
        {track.cover ? (
          <img src={track.cover} alt="" width={44} height={44} className="size-11 shrink-0 rounded-md object-cover" />
        ) : (
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-md bg-chip text-accent">
            <Icon name="audioLines" size={20} />
          </span>
        )}

        <div className="mr-auto min-w-0">
          <p className="truncate text-sm font-medium text-fg">{track.title}</p>
          <p className="truncate font-mono text-xs text-muted">
            strx
            <span className="hidden sm:inline">
              {" · "}
              {formatTime(time.current)} / {time.total ? formatTime(time.total) : track.duration}
            </span>
          </p>
        </div>

        <nav aria-label={`Listen to ${track.title}`} className="hidden items-center sm:flex">
          {serviceLinks.map(({ key, label, icon }) => {
            const href = track.links[key];
            return (
              href && (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${track.title} on ${label}`}
                  title={label}
                  className={cx(controlClass, "text-muted hover:text-fg")}
                >
                  <Icon name={icon} size={18} />
                </a>
              )
            );
          })}
        </nav>

        <button type="button" className={controlClass} onClick={() => setMuted((m) => !m)} aria-pressed={!muted} aria-label={muted ? "Unmute" : "Mute"}>
          <Icon name={muted ? "volumeOff" : "volume"} size={20} />
        </button>
        <button type="button" className={cx(controlClass, "bg-primary hover:bg-primary-hover")} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          <Icon name={playing ? "pause" : "play"} size={20} />
        </button>
        <button type="button" className={controlClass} onClick={next} aria-label="Next track">
          <Icon name="skipForward" size={20} />
        </button>
      </div>
    </aside>
  );
}
