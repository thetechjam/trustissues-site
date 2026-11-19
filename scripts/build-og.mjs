// Renders public/og.png (1200x630) by compositing the wordmark + tagline onto
// the Higgsfield night banner (scripts/source/og-bg.png) with Playwright.
// Run: npm run og   (needs `npx playwright install chromium` once)
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const here = (p) => new URL(p, import.meta.url).pathname;
const b64 = async (p) => (await readFile(p)).toString('base64');

const bg = await b64(here('./source/og-bg.png'));
const icon = await b64(here('./source/app-icon-1024.png'));
const nunito = await b64(here('../node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2'));
const newsreader = await b64(here('../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2'));

const html = `<!doctype html><html><head><style>
@font-face{font-family:Nunito;src:url(data:font/woff2;base64,${nunito}) format('woff2');font-weight:200 1000}
@font-face{font-family:Newsreader;font-style:italic;src:url(data:font/woff2;base64,${newsreader}) format('woff2');font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0B0E1A url(data:image/png;base64,${bg}) center/cover;font-family:Nunito;color:#F4F2FF}
.wrap{position:absolute;left:72px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;gap:22px}
.tile{width:84px;height:84px;border-radius:19px;box-shadow:0 0 0 1px rgb(167 139 250/.35),0 12px 40px rgb(167 139 250/.35)}
h1{font-weight:950;font-size:104px;line-height:.9;letter-spacing:-.01em;text-transform:uppercase}
h1 span{color:#A78BFA}
p{font-family:Newsreader;font-style:italic;font-size:38px;line-height:1.2;color:#C7D2FE}
small{font-size:22px;font-weight:700;color:#A8A6BF;letter-spacing:.08em;text-transform:uppercase}
</style></head><body><div class="wrap">
<img class="tile" src="data:image/png;base64,${icon}">
<h1>Trust<br><span>Issues</span></h1>
<p>Someone here is already lying.</p>
<small>A party game for iPhone</small>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }).toFile(here('../public/og.png'));
console.log('public/og.png written');
