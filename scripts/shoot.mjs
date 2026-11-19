// Full-page screenshots of the built site for visual QA.
// Usage: node scripts/shoot.mjs http://localhost:4400 /tmp/ti-shots
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:4400', out = '/tmp/ti-shots'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const pages = { home: '/', privacy: '/privacy/', support: '/support/', terms: '/terms/', '404': '/this-url-is-lying/' };
const sizes = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch();
for (const [vname, viewport] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: vname === 'mobile' ? 2 : 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const [name, path] of Object.entries(pages)) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      await document.fonts.ready;
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.log(`OVERFLOW ${name}-${vname}: ${overflow}px`);
    await page.screenshot({ path: `${out}/${name}-${vname}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log('done');
