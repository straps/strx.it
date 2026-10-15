import { useEffect, useState } from "react";

import { cardClass, cx } from "~/components/ui";

import { hero } from "./content";

type TerminalLine = (typeof hero.terminal)[number];

/** Progress of the typing animation: current line, typed characters, whether its output is shown. */
interface Progress {
  line: number;
  chars: number;
  output: boolean;
}

const START: Progress = { line: 0, chars: 0, output: false };
const DONE: Progress = { line: hero.terminal.length, chars: 0, output: false };
/** Typed at the final prompt to wipe the screen before the session replays. */
const CLEAR_COMMAND = "clear";

const timing = {
  start: 600,
  /** Idle prompt before typing a command. */
  think: 550,
  /** Base delay per keystroke, plus a deterministic jitter so typing feels human. */
  key: 55,
  jitter: 60,
  /** Delay between pressing enter and the output appearing. */
  enter: 280,
  /** Pause after the output before the next prompt. */
  read: 450,
  /** How long the finished session stays on screen before `clear` is typed. */
  idle: 10_000,
  /** Blank screen after `clear`, before the session restarts. */
  cleared: 800,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Plays the scripted session on mount, then clears the screen and replays it in a loop; jumps to the end when the user prefers reduced motion. */
function useTypingSession(lines: readonly TerminalLine[]) {
  const [progress, setProgress] = useState<Progress>(START);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(DONE);
      return;
    }

    let cancelled = false;
    const step = async (next: Progress, delay: number) => {
      if (cancelled) return;
      setProgress(next);
      await sleep(delay);
    };

    const typeCommand = async (command: string, at: (chars: number) => Progress) => {
      for (let chars = 1; chars <= command.length; chars++) {
        await step(at(chars), timing.key + ((chars * 37) % timing.jitter));
      }
      await sleep(timing.enter);
    };

    (async () => {
      await sleep(timing.start);
      while (!cancelled) {
        for (const [line, { command }] of lines.entries()) {
          await step({ line, chars: 0, output: false }, timing.think);
          await typeCommand(command, (chars) => ({ line, chars, output: false }));
          await step({ line, chars: command.length, output: true }, timing.read);
        }
        await step(DONE, timing.idle);
        await typeCommand(CLEAR_COMMAND, (chars) => ({ ...DONE, chars }));
        await step(START, timing.cleared);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  return progress;
}

export function Terminal() {
  const progress = useTypingSession(hero.terminal);

  return (
    <figure aria-label="Terminal session introducing Strx" className={cx(cardClass, "m-0 overflow-hidden p-0")}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {[0, 1, 2].map((dot) => (
          <span key={dot} aria-hidden="true" className="size-2.5 rounded-full bg-dot" />
        ))}
        <span className="ml-2 font-mono text-xs text-subtle">strx@ubuntu: ~</span>
      </div>
      {/* Both layers share one grid cell: the full transcript sizes the box and is what
          screen readers and crawlers read; the animated layer is drawn on top of it. */}
      <div className="grid p-6 font-mono text-sm leading-6">
        <Session progress={DONE} className="opacity-0" />
        <Session progress={progress} aria-hidden="true" />
      </div>
    </figure>
  );
}

interface SessionProps {
  progress: Progress;
  className?: string;
  "aria-hidden"?: "true";
}

function Session({ progress, className, ...aria }: SessionProps) {
  const visible = hero.terminal.slice(0, Math.min(progress.line + 1, hero.terminal.length));
  const finished = progress.line >= hero.terminal.length;

  return (
    <div className={cx("col-start-1 row-start-1 flex flex-col gap-1", className)} {...aria}>
      {visible.map((line, index) => {
        const current = index === progress.line;
        const typed = current ? line.command.slice(0, progress.chars) : line.command;
        const showOutput = !current || progress.output;
        return (
          <div key={line.command}>
            <div className="whitespace-pre-wrap">
              <Prompt /> {typed}
              {current && !progress.output && <Cursor key={progress.chars} />}
            </div>
            {showOutput && (
              <div className="pb-2 text-subtle">
                {line.output.map((out) => (
                  <div key={out}>{out}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {finished && (
        <div>
          <Prompt /> {CLEAR_COMMAND.slice(0, progress.chars)}
          <Cursor key={progress.chars} />
        </div>
      )}
    </div>
  );
}

function Prompt() {
  return <span className="text-accent">$</span>;
}

/** Blinking cursor. Re-keyed on every keystroke so the blink restarts and it stays solid while typing. */
function Cursor() {
  return <span className="animate-blink text-fg">_</span>;
}
