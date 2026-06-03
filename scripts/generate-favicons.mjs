/**
 * Builds tab icons from the square brand mark (1:1 PNG).
 * Run: npm run icons
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public", "bren-cravings-logo.png");

const outputs = [
  { file: path.join(root, "app", "icon.png"), size: 512 },
  { file: path.join(root, "app", "apple-icon.png"), size: 180 },
  { file: path.join(root, "public", "apple-icon.png"), size: 180 },
  { file: path.join(root, "public", "favicon-32.png"), size: 32 },
  { file: path.join(root, "public", "favicon-16.png"), size: 16 },
];

for (const { file, size } of outputs) {
  await sharp(source).resize(size, size).png().toFile(file);
  const out = await sharp(file).metadata();
  console.log(
    `Wrote ${path.relative(root, file)} (${out.width}×${out.height})`
  );
}
