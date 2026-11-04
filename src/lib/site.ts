import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';
import { changelog } from '~/lib/changelog';
import { siteConfig } from '~/site.config';

type Site = {
  name: string;
  description: string;
  /**
   * The address search engines should index, like `https://nitpick.dev`.
   * Empty uses the address each visitor opened. Set it when a custom domain is
   * connected, so the layerwise.site address isn't indexed as a copy.
   */
  url: string;
  /**
   * Default share image for link previews: a 1200×630 PNG in `public/`.
   * `pnpm og` renders one per page into `public/og/`.
   */
  image: string;
  imageAlt: string;
  /** The `content` of Google Search Console's HTML tag, if it's used. */
  googleSiteVerification: string;
};

/** What search engines and link previews read about this site. */
export const site: Site = {
  name: siteConfig.product,
  description: siteConfig.description,
  url: '',
  image: '/og/home.png',
  imageAlt: `${siteConfig.product}: ${siteConfig.tagline}`,
  googleSiteVerification: ''
};

/** Share image rendered by `pnpm og` for a page, like `/og/privacy.png`. */
export function ogImage(name: string): string {
  return `/og/${name}.png`;
}

/** Public pages in `/sitemap.xml`. Add every page search engines should find. */
export const sitemapPaths: string[] = [
  '/',
  '/changelog',
  ...changelog.map((entry) => `/changelog/${entry.slug}`),
  '/privacy',
  '/terms'
];

const requestOrigin = createIsomorphicFn()
  .server(() => getRequestUrl().origin)
  .client(() => window.location.origin);

/** Absolute URL for a path or a `public/` file on this site. */
export function siteUrl(path = '/'): string {
  return new URL(path, site.url || requestOrigin()).toString();
}
