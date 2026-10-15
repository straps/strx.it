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

const LINKS_PANEL_ID = "player-links";

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
  const [linksOpen, setLinksOpen] = useState(false);
  const [src, setSrc] = useState<string>();

  // Shuffle after mount: doing it during render would differ between server and client.
  useEffect(() => setQueue(shuffle(tracks)), []);

  const track = queue[index];

  const next = useCallback(() => {
    if (index + 1 < queue.length) return setIndex(index + 1);
    setQueue(shuffle(tracks, queue[index]?.id));
    setIndex(0);
  }, [index, queue]);

  // The static host answers without Range support, so the browser cannot seek in a streamed file
  // (a seek restarts the track). Downloading the mp3 as a blob makes it freely seekable.
  useEffect(() => {
    if (!track) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setSrc(undefined);
    fetch(track.audio, { signal: controller.signal })
      .then((response) => response.blob())
      .then((blob) => setSrc((objectUrl = URL.createObjectURL(blob))))
      .catch(() => {});
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [track]);

  // Autoplay whenever a track is ready. If the browser refuses (autoplay policy), retry on the first user gesture.
  useEffect(() => {
    const audio = audioRef.current;
    if (!src || !audio) return;
    const gestures = ["pointerdown", "keydown", "touchend"] as const;
    const retry = () => void audio.play().catch(() => {});
    const stopWaiting = () => gestures.forEach((type) => window.removeEventListener(type, retry));
    audio.play().catch(() => gestures.forEach((type) => window.addEventListener(type, retry, { once: true })));
    return stopWaiting;
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (audio) void (audio.paused ? audio.play() : audio.pause());
  };

  useEffect(() => {
    if (!linksOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setLinksOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [linksOpen]);

  if (!track) return null;

  const links = serviceLinks.flatMap((service) => {
    const href = track.links[service.key];
    return href ? [{ ...service, href }] : [];
  });

  return (
    <aside aria-label="Music player" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur-md">
      <audio
        ref={audioRef}
        src={src}
        muted={muted}
        autoPlay
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
        <button
          type="button"
          onClick={() => setLinksOpen((open) => !open)}
          aria-expanded={linksOpen}
          aria-controls={LINKS_PANEL_ID}
          aria-label={`Links for ${track.title}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:pointer-events-none"
        >
          {track.cover ? (
            <img src={track.cover} alt="" width={44} height={44} className="size-11 shrink-0 rounded-md object-cover" />
          ) : (
            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-md bg-chip text-accent">
              <Icon name="audioLines" size={20} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-fg">{track.title}</span>
            <span className="block truncate font-mono text-xs text-muted">
              strx
              <span className="hidden sm:inline">
                {" · "}
                {formatTime(time.current)} / {time.total ? formatTime(time.total) : track.duration}
              </span>
            </span>
          </span>
        </button>

        <nav aria-label={`Listen to ${track.title}`} className="hidden items-center sm:flex">
          {links.map(({ key, label, icon, href }) => (
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
          ))}
        </nav>

        <button
          type="button"
          className={cx(controlClass, "sm:hidden", linksOpen && "bg-surface-hover")}
          onClick={() => setLinksOpen((open) => !open)}
          aria-expanded={linksOpen}
          aria-controls={LINKS_PANEL_ID}
          aria-label={linksOpen ? "Hide links" : "Show links"}
        >
          <Icon name={linksOpen ? "close" : "arrowUpRight"} size={20} />
        </button>
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

      {linksOpen && (
        <nav
          id={LINKS_PANEL_ID}
          aria-label={`Listen to ${track.title}`}
          className="absolute inset-x-0 bottom-full flex flex-wrap gap-2 border-t border-border bg-bg px-4 py-3 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.7)] sm:hidden"
        >
          {links.map(({ key, label, icon, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm text-fg hover:bg-surface-hover"
            >
              <Icon name={icon} size={18} />
              {label}
            </a>
          ))}
        </nav>
      )}
    </aside>
  );
}
