# Trust Issues — website

Marketing site **and** App Store compliance site (Privacy Policy URL, Support URL) for
**Trust Issues**, a social-deduction party game for iPhone by The Tech JAM (Jesse Morrison).
Every player uses their own phone; the app is the narrator.

Intended URL: **https://trustissues.thetechjam.com**

| Page | Path | App Store Connect field |
| --- | --- | --- |
| Home | `/` | Marketing URL |
| Privacy Policy | `/privacy/` | Privacy Policy URL |
| Support (+ FAQ) | `/support/` | Support URL |
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

Netlify, auto-deploying from `main`. Live at https://trustissues.thetechjam.com (custom domain)
and https://trustissues.netlify.app. Build `npm run build`, publish `dist`, Node 24 — all in
`netlify.toml`, which also sets security headers and immutable caching for `/_astro/*`.

CI: `.github/workflows/ci.yml` runs `npm ci`, `npm run check`, `npm run build` on every push/PR.

## Launch-day switches (`src/config.ts`)

- `APP_STORE_URL` — set (live since 2026-11-20). The primary CTA is Apple's official white
  "Download on the App Store" badge (vendored unmodified in `src/assets/badges/`, see the README
  there) linking to this URL, and the MobileApplication JSON-LD gets
  `installUrl`/`downloadUrl`/`offers`. If `null`, the CTA reverts to a non-link "Coming soon"
  pill in the site's own tokens (no Apple artwork). The badge is the site's only download CTA:
  there is no public beta link (TestFlight is internal-only now that the app is live).
- `APP_STORE_ID` — set; drives the Smart App Banner (`apple-itunes-app` meta in
  `src/layouts/BaseLayout.astro`), omitted while `null`.
- Pricing: v1 is a free download, no ads, no IAP ("Is it free?" in `src/data/faq.ts`). Update it
  and the JSON-LD `offers` if that changes.

## Replacing screenshots

The gallery reads `src/data/screenshots.ts`. Current images are real pre-release captures from
the app's DEBUG demo mode (`~/Projects/trust-issues/design/app-store-screenshots/`, 1320×2868).
To use final App Store screenshots: drop PNGs into `src/assets/screenshots/`, update the imports
and `alt`/`caption` in `screenshots.ts`. Any slot with `image: null` renders the
"Screenshot coming soon" placeholder phone (`src/components/PhoneFrame.astro`). Remove the
"Pre-release screens" note in `src/pages/index.astro` once they're final.

## Placeholders / open items

- `[STATE]` governing-law placeholder in `src/pages/terms.astro` (highlighted in gold on the page).
- Privacy Policy retention section says plainly that online rooms are **not auto-deleted yet**.
  When the app ships TTL/cleanup, update `/privacy/` with the real window (see `docs/privacy-audit/PRIVACY_AUDIT.md` §5 in the private trust-issues repo).

## Internal docs

- The privacy audit (`PRIVACY_AUDIT.md`, source of truth for legal pages) and App Store privacy notes
  (`APP_PRIVACY_NOTES.md`) live in the private app repo under `trust-issues/docs/privacy-audit/`.
- `CLAUDE.md` — conventions for agents working on this repo.
