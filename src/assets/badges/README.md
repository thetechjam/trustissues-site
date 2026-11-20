# Apple "Download on the App Store" badges (official, unmodified)

These SVGs are Apple's official badge artwork, US-English, downloaded on 2026-11-20 and
committed byte-for-byte. **Do not edit, reformat, pretty-print or run SVGO on them.** To update,
re-download them from the same URLs.

| File | Source | SVG title |
| --- | --- | --- |
| `download-on-the-app-store-white-en-us.svg` | https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/white/en-us | `Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917` |
| `download-on-the-app-store-black-en-us.svg` | https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/en-us (identical to https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg) | `Download_on_the_App_Store_Badge_US-UK_RGB_blk_4SVG_092917` |

SHA-256:

- white `056de2f81ff61b778a0c192dbb098f9b0416e7e8f79b119e43d11248155e597f`
- black `a26fc5b38380272c92e9019a2eb8b45542a66814b3e2b203772db8904b9fb99f`

The site displays the **white** badge (Apple's alternative badge, for when the black one
looks heavy. Here it would vanish on the near-black site, and no other store badge appears).
The black one is kept for reference only and must not be shown on this dark background.
`src/components/CtaGroup.astro` imports the white badge with `?url` so the build emits the file
unchanged. Usage rules (Apple Marketing Guidelines): at least 40px tall onscreen (we use 56px),
clear space of at least 1/4 of the badge height, scale uniformly, and never recolor, crop,
angle, animate, or add shadows, filters or borders. Only use it while the app is actually live
on the App Store.
