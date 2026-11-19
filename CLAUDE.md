# CLAUDE.md: Trust Issues website

Conventions for agents working on this repo. See README.md for commands and deploy.

## What this is

Static Astro 7 site for the Trust Issues iOS app (app repo: `~/Projects/trust-issues`,
**read-only from here**). It is both the marketing page and the App Store compliance site
(`/privacy/` = Privacy Policy URL, `/support/` = Support URL). Conventions mirror
`thetechjam/upgrademyrun` (Astro static, TS strict, hand-written CSS tokens, Fontsource,
`astro:assets`, Netlify, same CI).

## Key files

| Path | Purpose |
| --- | --- |
| `src/config.ts` | `SITE`, `NAV`, launch switches (`TESTFLIGHT_URL`, `APP_STORE_URL`, `APP_STORE_ID`) |
| `src/styles/global.css` | Design tokens (ported from the app) + base styles |
| `src/data/roles.ts` | Roles: names/blurbs/details lifted from the app's `Game/Role+Presentation.swift` |
| `src/data/screenshots.ts` | Gallery images + narrator captions |
| `src/data/faq.ts` | Support FAQ (also feeds FAQPage JSON-LD and the home teaser) — plain text only |
| `src/lib/jsonld.ts` | Organization / WebSite / MobileApplication / FAQPage |
| `src/layouts/BaseLayout.astro` | `<head>`: canonical, OG/Twitter, icons, JSON-LD |
| `src/components/Glyph.astro` | Original SVG stand-ins for the app's SF Symbols (one per concept) |
| `scripts/build-og.mjs`, `scripts/build-icons.mjs` | Regenerate `public/og.png` and favicons |
| `scripts/shoot.mjs` | Playwright full-page screenshots for visual QA |
| `PRIVACY_AUDIT.md`, `APP_PRIVACY_NOTES.md` | Internal privacy audit + App Store label guide |

## Design rules (from `~/Projects/trust-issues/design/design-system.md`)

- **Tokens come from the app.** `global.css` mirrors `design-system.md` §1–3 and
  `Trust Issues/Theme/Color+Tokens.swift` 1:1. If the app changes a token, change it here. Never
  add raw hexes in components when a token exists.
- **Dark-only.** No light mode. "Day" is the warm espresso palette (`data-phase="day"`), not a light theme.
- **Role colors only ever mean their role.** Never use `--role-*` as decoration. Werewolf
  crimson at small sizes → `--role-werewolf-tint`.
- **`--text-tertiary` is decorative only** — never for information a reader needs.
- **The serif (`.narrator`, Newsreader) is the narrator's voice only.** Headings/UI use Nunito
  (rounded), body uses Inter.
- Tap targets ≥ 44px; buttons follow §5 (primary violet with `#0B0E1A` label, secondary violet @15%).
- Voice: "playful-modern with a dark edge… sly, not spooky." Wry, never cruel, no gore. Lift
  lines from `Trust Issues/Game/NarratorCopy.swift` where possible.
- Never use Apple's App Store badge artwork or the Apple logo while the app is unreleased.

## Images

- Only Higgsfield-generated art in the app icon's smug-moon style (`src/assets/images/`,
  `scripts/source/og-bg.png`) plus the app's own icon/screenshots copied from the app repo.
  No stock photos, no other generated imagery.
- All rasters go through `astro:assets` (`<Image>` / `getImage`). Hero is eager +
  `fetchpriority="high"`; everything else lazy.

## Legal pages must match the code

`/privacy/`, `/terms/` and the FAQ must stay consistent with `PRIVACY_AUDIT.md`, which is
derived from the app's code (code wins over the app's README/SUBMISSION.md). **Re-run the
audit whenever the app adds an SDK, a Firestore field, a permission, analytics, IAP, or a
retention/cleanup mechanism**, then update `/privacy/`, `src/data/faq.ts`, and
`APP_PRIVACY_NOTES.md`. Never state a retention period the code doesn't implement. Bump the
effective date when the policy changes.

## Verify checklist (before every commit)

1. `npm run check && npm run build` — zero errors, zero warnings.
2. `npm run preview -- --port 4400` then `node scripts/shoot.mjs http://localhost:4400 /tmp/ti-shots`
   and look at desktop (1440) + mobile (390) shots of every page you touched. Script also
   reports horizontal overflow.
3. Internal links end with `/` (`trailingSlash: 'always'`).
4. Watch for Astro whitespace collapse: text that wraps onto a new line right before/after
   an inline `<a>`, `<strong>` or `{expr}` needs an explicit `{' '}`. Grep `dist` for
   `[a-z]<a ` / `</a>[A-Za-z(]`.
5. JSON-LD parses; canonicals use `https://trustissues.thetechjam.com`.
6. Do not deploy, touch DNS, or modify the app repo without operator approval.
