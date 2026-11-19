import { SITE, absoluteUrl } from '../config';

export type JsonLd = Record<string, unknown>;

export const organization = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#org`,
  name: SITE.company,
  url: SITE.companyUrl,
  email: SITE.email,
  founder: { '@type': 'Person', name: SITE.author },
});

export const website = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: absoluteUrl('/'),
  description: SITE.description,
  publisher: { '@id': `${SITE.url}/#org` },
  inLanguage: 'en',
});

/** No offers/aggregateRating until the app is actually on the App Store. */
export const mobileApp = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  '@id': `${SITE.url}/#app`,
  name: SITE.name,
  description: SITE.description,
  url: absoluteUrl('/'),
  image: absoluteUrl('/icon-512.png'),
  screenshot: absoluteUrl(SITE.ogImage),
  operatingSystem: `iOS ${SITE.minIOS} or later`,
  applicationCategory: 'GameApplication',
  genre: 'Party game, Social deduction',
  author: { '@id': `${SITE.url}/#org` },
  publisher: { '@id': `${SITE.url}/#org` },
});

export const faqPage = (items: { q: string; a: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
