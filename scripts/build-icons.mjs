// Derives favicons + PWA icons from the app icon (copied read-only from
// ~/Projects/trust-issues/design/icon/app-icon-1024.png into scripts/source/).
// Run: npm run icons
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const src = new URL('./source/app-icon-1024.png', import.meta.url).pathname;
const pub = (f) => new URL(`../public/${f}`, import.meta.url).pathname;

// iOS-style rounded mask for browser-tab / PWA icons (the source is a square, no alpha).
const rounded = (size, r = 0.2237) =>
  Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * r}" ry="${size * r}"/></svg>`);

async function roundedPng(size) {
  return sharp(src).resize(size, size).composite([{ input: rounded(size), blend: 'dest-in' }]).png({ palette: size > 64, quality: 92, effort: 10 }).toBuffer();
}

// apple-touch-icon: square, no alpha (iOS applies its own mask).
await sharp(src).resize(180, 180).png().toFile(pub('apple-touch-icon.png'));
await writeFile(pub('icon-192.png'), await roundedPng(192));
await writeFile(pub('icon-512.png'), await roundedPng(512));
// Maskable variant keeps full-bleed artwork.
await sharp(src).resize(512, 512).png({ palette: true, quality: 92, effort: 10 }).toFile(pub('icon-maskable-512.png'));

// favicon.ico with 16 + 32 PNG entries.
const pngs = await Promise.all([16, 32].map((s) => roundedPng(s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((buf, i) => {
  const s = [16, 32][i];
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));

// Optimized tile for the header/hero (astro:assets handles final formats).
await sharp(src).resize(512, 512).png().toFile(new URL('../src/assets/images/app-icon.png', import.meta.url).pathname);
console.log('icons written');
