// Adds images for the site, ready to drop into a screen slot.
//
//   pnpm add-images path/to/hero-screenshot.png [more images…]
//
// For each image it writes WebP versions 800, 1600, and 2880 px wide to
// public/images/ (never wider than the original), and records the size and a
// tiny blurred placeholder in src/content/images.json under the file's name.
// GIFs are copied untouched so animation survives. SVGs are refused: export
// a PNG or WebP of the screen instead.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTHS = [800, 1600, 2880];
const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const manifestPath = root('src/content/images.json');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: pnpm add-images <image> [more images…]');
  process.exit(1);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'));
await mkdir(root('public/images'), { recursive: true });

const slug = (file) =>
  basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function placeholder(input) {
  const tiny = await sharp(input, { animated: false })
    .resize(24, 24, { fit: 'inside' })
    .blur(1.2)
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${tiny.toString('base64')}`;
}

let failed = false;
for (const file of files) {
  const ext = extname(file).toLowerCase();
  const name = slug(file);
  if (ext === '.svg') {
    console.error(`✗ ${file}: SVG isn’t supported. Export the screen as PNG or WebP and try again.`);
    failed = true;
    continue;
  }
  if (!name) {
    console.error(`✗ ${file}: the file name needs at least one letter or digit.`);
    failed = true;
    continue;
  }

  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch {
    console.error(`✗ ${file}: not an image sharp can read.`);
    failed = true;
    continue;
  }
  // Photos from phones carry a rotation; report the size as displayed.
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.format === 'gif' ? (meta.pageHeight ?? meta.height) : (meta.autoOrient?.height ?? meta.height);

  if (meta.format === 'gif') {
    const target = `/images/${name}.gif`;
    await copyFile(file, root(`public${target}`));
    manifest[name] = {
      width,
      height,
      placeholder: await placeholder(file),
      sources: [{ src: target, width }],
      type: 'image/gif'
    };
    console.log(`✓ ${name}: GIF kept as is (${width}×${height})`);
    continue;
  }

  const widths = WIDTHS.filter((w) => w < width);
  if (!widths.includes(Math.min(width, WIDTHS.at(-1)))) widths.push(Math.min(width, WIDTHS.at(-1)));
  const sources = [];
  for (const w of widths) {
    const target = `/images/${name}-${w}.webp`;
    await sharp(file).rotate().resize({ width: w }).webp({ quality: 82 }).toFile(root(`public${target}`));
    sources.push({ src: target, width: w });
  }
  manifest[name] = {
    width,
    height,
    placeholder: await placeholder(file),
    sources,
    type: 'image/webp'
  };
  console.log(`✓ ${name}: ${sources.map((s) => s.width).join(', ')} px WebP (${width}×${height})`);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
if (failed) process.exit(1);
