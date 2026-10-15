// Renders scripts/og/og-image.html with headless Chrome into public/og.png (1200x630, the Open Graph size).
// Usage: node scripts/og/generate.mjs   (needs google-chrome and imagemagick's `convert` for optimisation)
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const source = pathToFileURL(resolve("scripts/og/og-image.html")).href;
const output = resolve("public/og.png");

execFileSync("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--window-size=1200,630",
  "--virtual-time-budget=3000",
  `--screenshot=${output}`,
  source,
]);
// Social crawlers (WhatsApp above all) skip heavy images: quantise to keep the file small.
execFileSync("convert", [output, "-colors", "128", "-strip", output]);
console.log(`${output}: ${(statSync(output).size / 1024).toFixed(0)} KB`);
