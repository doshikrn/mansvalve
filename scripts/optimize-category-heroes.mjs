import { readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const dir = join(process.cwd(), "public", "images");
const files = [
  "category-flansy-i-otvody.png",
  "category-klapany.png",
  "category-zatvory.png",
  "category-zadvizhki.png",
  "category-krany-sharovye.png",
  "category-filtry-i-kompensatory.png",
];

const TARGET_WIDTH = 1280;

for (const name of files) {
  const path = join(dir, name);
  const before = (await stat(path)).size;
  const input = await readFile(path);
  const meta = await sharp(input).metadata();
  const width = Math.min(TARGET_WIDTH, meta.width ?? TARGET_WIDTH);

  const output = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .png({ palette: true, quality: 82, effort: 10, compressionLevel: 9, dither: 1 })
    .toBuffer();

  await writeFile(path, output);
  const after = output.length;
  const saved = (((before - after) / before) * 100).toFixed(1);
  console.log(
    `${name}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${saved}%) [${width}px]`,
  );
}
