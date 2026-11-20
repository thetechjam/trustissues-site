/**
 * Site-wide configuration. Launch-day switches live here so nothing else
 * needs editing when the app goes live.
 */

export const SITE = {
  name: 'Trust Issues',
  url: 'https://trustissues.thetechjam.com',
  tagline: 'Your phone is the narrator.',
  description:
    'Trust Issues is a social-deduction party game for iPhone. Werewolves, a Seer, a Doctor and a village full of liars. Every player uses their own phone, and the app runs the night, the day and the vote.',
  locale: 'en_US',
  themeColor: '#0B0E1A',
  ogImage: '/og.png',
  ogImageAlt: 'Trust Issues: a smug crescent moon over a sleeping village. Someone here is already lying.',
  company: 'The Tech JAM',
  author: 'Jesse Morrison',
  email: 'jam@thetechjam.com',
  companyUrl: 'https://thetechjam.com',
  /** Read from the app repo's project.yml (deploymentTarget.iOS). */
  minIOS: '17.0',
  /** From TrustIssuesEngine GameConfiguration.validate(): 4 players minimum, no hard maximum. */
  minPlayers: 4,
} as const;

/**
 * Public TestFlight invite link. While `null`, the "Join the TestFlight beta"
 * CTA points to /support/#beta (email for an invite). Paste the
 * https://testflight.apple.com/join/XXXXXXXX link here and every beta CTA
 * links straight to it.
 */
export const TESTFLIGHT_URL: string | null = null;

/**
 * App Store listing URL (live since 2026-11-20). The primary CTA links here
 * and the MobileApplication JSON-LD uses it as the install/download URL.
 * Setting it back to `null` reverts the CTA to a non-link "Coming soon" pill
 * (Apple's official badge is only shown while this is set).
 */
export const APP_STORE_URL: string | null = 'https://apps.apple.com/us/app/trust-issues-booj-game/id6788814599';

/**
 * Numeric App Store id. Drives the Smart App Banner
 * (<meta name="apple-itunes-app">) in BaseLayout.astro; omitted while `null`.
 */
export const APP_STORE_ID: string | null = '6788814599';

export const NAV = [
  { href: '/#how-it-plays', label: 'How it plays' },
  { href: '/#roles', label: 'Roles' },
  { href: '/support/', label: 'Support' },
  { href: '/privacy/', label: 'Privacy' },
] as const;

export const betaHref = TESTFLIGHT_URL ?? '/support/#beta';
export const absoluteUrl = (path: string) => new URL(path, SITE.url).toString();
