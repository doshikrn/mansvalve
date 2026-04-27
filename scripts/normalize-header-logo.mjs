/**
 * Нормализует фирменный знак `public/images/mansvalve-brand-mark.png`:
 * trim, экспорт 512×512 PNG (contain на белом).
 */
import sharp from "sharp";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const target = join(root, "public/images/mansvalve-brand-mark.png");

async function main() {
  const raw = await readFile(target);
  const out = await sharp(raw)
    .trim({ threshold: 14 })
    .resize(512, 512, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      position: "center",
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(target + ".bak.png", raw);
  await writeFile(target, out);
  console.log("OK:", target, "(backup: mansvalve-brand-mark.png.bak.png)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
