// Regenerates the logo PNG and every favicon from public/logo.svg.
// Usage: pnpm icons
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
const svg = await readFile(pub('logo.svg'));

// logo.svg is drawn at 1024 px; render at twice the target size, then downsample.
const render = (size) =>
  sharp(svg, { density: Math.max(1, (72 * size * 2) / 1024) }).resize(size, size).png().toBuffer();

const outputs = {
  'logo.png': 1024,
  'android-chrome-512x512.png': 512,
  'android-chrome-192x192.png': 192,
  'apple-touch-icon.png': 180,
  'favicon.png': 96,
  'favicon-32x32.png': 32,
  'favicon-16x16.png': 16
};
for (const [name, size] of Object.entries(outputs)) {
  await writeFile(pub(name), await render(size));
}

// favicon.ico holds 16, 32, and 48 px PNGs.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(render));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + i * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt8(0, entry + 2);
  header.writeUInt8(0, entry + 3);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...images]));

// The SVG favicon is the logo itself.
await writeFile(pub('favicon.svg'), svg);
console.log('Wrote logo.png, favicon.svg, favicon.ico, and', Object.keys(outputs).length - 1, 'PNG icons.');
