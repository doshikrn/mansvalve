/**
 * Generates app/favicon.ico, app/icon.png, app/apple-icon.png
 * from scripts/brand/mansvalve-favicon.svg (edit SVG, then: node scripts/build-app-icons.mjs).
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const svgPath = join(root, "scripts", "brand", "mansvalve-favicon.svg");
const appDir = join(root, "app");

async function main() {
  const svg = await readFile(svgPath);
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svg).resize(48, 48).png().toBuffer();
  const icon512 = await sharp(svg).resize(512, 512).png().toBuffer();
  const apple180 = await sharp(svg).resize(180, 180).png().toBuffer();

  const png16 = await sharp(svg).resize(16, 16).png().toBuffer();
  const ico = await toIco([png16, png32, png48]);

  await writeFile(join(appDir, "favicon.ico"), ico);
  await writeFile(join(appDir, "icon.png"), icon512);
  await writeFile(join(appDir, "apple-icon.png"), apple180);

  console.log("Wrote app/favicon.ico, app/icon.png, app/apple-icon.png from scripts/brand/mansvalve-favicon.svg");
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
