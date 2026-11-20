import { APP_STORE_URL, SITE, absoluteUrl } from '../config';

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

/** No aggregateRating: don't claim ratings the page doesn't show. Free download (v1). */
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
  ...(APP_STORE_URL
    ? {
        installUrl: APP_STORE_URL,
        downloadUrl: APP_STORE_URL,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', url: APP_STORE_URL },
      }
    : {}),
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
