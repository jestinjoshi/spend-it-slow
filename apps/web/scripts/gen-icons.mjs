/**
 * Rasterizes the SVG icons into PNG fallbacks (run: `node scripts/gen-icons.mjs`).
 * Re-run whenever favicon.svg or icon-maskable.svg changes.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// 32px PNG favicon, the fallback for browsers without SVG favicon support (Safari).
await sharp(join(publicDir, "favicon.svg"), { density: 384 })
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, "favicon-32.png"));

// 180px Apple touch icon, from the full-bleed maskable icon (no transparent
// corners; iOS applies its own rounding).
await sharp(join(publicDir, "icon-maskable.svg"), { density: 512 })
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, "apple-touch-icon.png"));

console.log("Generated favicon-32.png and apple-touch-icon.png");
