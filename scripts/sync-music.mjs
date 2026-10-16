// Copies tracks from the local music library into public/music and writes the player manifest.
// Usage: node scripts/sync-music.mjs [sourceDir]   (default: ~/mega/suno)
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const source = process.argv[2] ?? join(homedir(), "mega/suno");
const outDir = "public/music";
const manifestPath = "app/features/player/tracks.json";
const coverCandidates = ["cover_1024.jpg", "cover.jpeg", "cover.jpg"];

mkdirSync(outDir, { recursive: true });

const tracks = readdirSync(source, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{3}-/.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(({ name: folder }) => {
    const dir = join(source, folder);
    const info = JSON.parse(readFileSync(join(dir, "info.json"), "utf8"));
    const files = readdirSync(dir);
    const mp3 = info.audio.mp3; // the WAV master (info.audio.wav) is never published
    const coverFile = coverCandidates.find((file) => files.includes(file)) ?? files.find((file) => /\.jpe?g$/i.test(file));
    const cover = coverFile && join(dir, coverFile);

    copyFileSync(join(dir, mp3), join(outDir, `${folder}.mp3`));
    if (cover) {
      execFileSync("convert", [cover, "-resize", "320x320^", "-gravity", "center", "-extent", "320x320", "-quality", "82", join(outDir, `${folder}.jpg`)]);
    }

    const { youtube, soundcloud, instagram } = info.links ?? {};
    return {
      id: folder,
      title: info.title,
      duration: info.duration,
      publishedAt: youtube?.full?.uploadedAt ?? null, // upload of the full video on YouTube: the release date
      audio: `/music/${folder}.mp3`,
      cover: cover ? `/music/${folder}.jpg` : null,
      links: {
        youtube: youtube?.full?.url ?? null,
        soundcloud: soundcloud?.url ?? null,
        instagram: instagram?.reel ?? null,
      },
    };
  });

writeFileSync(manifestPath, `${JSON.stringify(tracks, null, 2)}\n`);
console.log(`${tracks.length} tracks synced from ${source}`);
