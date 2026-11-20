# Trust Issues — website

Marketing site **and** App Store compliance site (Privacy Policy URL, Support URL) for
**Trust Issues**, a social-deduction party game for iPhone by The Tech JAM (Jesse Morrison).
Every player uses their own phone; the app is the narrator.

Intended URL: **https://trustissues.thetechjam.com**

| Page | Path | App Store Connect field |
| --- | --- | --- |
| Home | `/` | Marketing URL |
| Privacy Policy | `/privacy/` | Privacy Policy URL |
| Support (+ FAQ, `#beta`) | `/support/` | Support URL |
| Terms of Use | `/terms/` | — |
| 404 | `/404.html` | — |

## Stack

Astro 7 (static output), TypeScript strict, hand-written CSS with a token layer ported 1:1
from the iOS app's design system (`src/styles/global.css`), Fontsource self-hosted fonts
(Nunito ≈ SF Pro Rounded, Inter ≈ SF Pro, Newsreader ≈ New York for narrator lines only),
`astro:assets` for every raster, `@astrojs/sitemap`. Node 24 (`.nvmrc`). No client
framework; the only JS is a tiny reveal-on-scroll enhancement. Everything works with JS off.

```sh
npm install
npm run dev       # http://localhost:4321
npm run check     # astro check (types)
npm run build     # -> dist/
npm run preview
npm run icons     # regenerate favicons/PWA icons from scripts/source/app-icon-1024.png
npm run og        # regenerate public/og.png (needs `npx playwright install chromium` once)
```

## Deploy

Netlify (not yet created). Build `npm run build`, publish `dist`, Node 24 — all in
`netlify.toml`, which also sets security headers and immutable caching for `/_astro/*`.
Domain plan: add a `CNAME` record `trustissues` → `<site>.netlify.app` at Squarespace DNS
(thetechjam.com), then add the custom domain in Netlify. Not set up yet.

CI: `.github/workflows/ci.yml` runs `npm ci`, `npm run check`, `npm run build` on every push/PR.

## Launch-day switches (`src/config.ts`)

- `TESTFLIGHT_URL` — `null` today, so "Join the TestFlight beta" goes to `/support/#beta`
  (email jam@thetechjam.com for an invite). Paste the public `https://testflight.apple.com/join/…`
  link and every beta CTA links straight to it; the support page switches to install steps.
- `APP_STORE_URL` — `null` today, so the primary CTA is a non-link "Coming soon on the App Store"
  badge (deliberately not Apple's badge artwork). Set the listing URL at launch and it becomes a link.
  At that point, consider swapping in Apple's official badge per their marketing guidelines.
- `APP_STORE_ID` — for the Smart App Banner; uncomment the `apple-itunes-app` meta in
  `src/layouts/BaseLayout.astro` once set.
- When pricing is known, update the "Is it free?" answer in `src/data/faq.ts`.

## Replacing screenshots

The gallery reads `src/data/screenshots.ts`. Current images are real pre-release captures from
the app's DEBUG demo mode (`~/Projects/trust-issues/design/app-store-screenshots/`, 1320×2868).
To use final App Store screenshots: drop PNGs into `src/assets/screenshots/`, update the imports
and `alt`/`caption` in `screenshots.ts`. Any slot with `image: null` renders the
"Screenshot coming soon" placeholder phone (`src/components/PhoneFrame.astro`). Remove the
"Pre-release screens" note in `src/pages/index.astro` once they're final.

## Placeholders / open items

- `[STATE]` governing-law placeholder in `src/pages/terms.astro` (highlighted in gold on the page).
- `TESTFLIGHT_URL`, `APP_STORE_URL`, `APP_STORE_ID` in `src/config.ts`.
- Pricing ("announced at launch") in `src/data/faq.ts`.
- Privacy Policy retention section says plainly that online rooms are **not auto-deleted yet**.
  When the app ships TTL/cleanup, update `/privacy/` with the real window (see `docs/privacy-audit/PRIVACY_AUDIT.md` §5 in the private trust-issues repo).

## Internal docs

- The privacy audit (`PRIVACY_AUDIT.md`, source of truth for legal pages) and App Store privacy notes
  (`APP_PRIVACY_NOTES.md`) live in the private app repo under `trust-issues/docs/privacy-audit/`.
- `CLAUDE.md` — conventions for agents working on this repo.
