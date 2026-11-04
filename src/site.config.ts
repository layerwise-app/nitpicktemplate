/**
 * Site-wide settings: names, navigation, button labels, social links, colors,
 * fonts, and the address that receives demo requests. Every page reads from
 * this file, so a change here shows up everywhere.
 *
 * Keep this file free of runtime imports: `scripts/og-images.mjs` reads it
 * directly with Node.
 */

export type NavLink = { label: string; href: string };

export type FontSetting = {
  /** CSS family name used in `font-family`. */
  family: string;
  /** A variable woff2 file in `public/fonts/`. */
  file: string;
  /** Weight range the file covers, like `'400 900'`. */
  weights: string;
  /**
   * Metric overrides for the local fallback font so text doesn't move when
   * the web font arrives. Recompute them when you change the font (see README).
   */
  fallback: {
    local: string[];
    sizeAdjust: string;
    ascentOverride: string;
    descentOverride: string;
    lineGapOverride: string;
  };
};

export type SiteConfig = {
  company: string;
  city: string;
  product: string;
  tagline: string;
  description: string;
  /** Links in the header. Paths starting with `/#` scroll to a home section. */
  nav: NavLink[];
  /** Footer link groups. */
  footer: { title: string; links: NavLink[] }[];
  cta: {
    /** The one call to action. Every button that asks the visitor to act uses it. */
    primary: string;
    /** Hero button that replays the pull request review. */
    replay: string;
    /** Id of the demo form section on the home page. */
    formId: string;
  };
  /** Shown in the footer when present, like `{ label: 'GitHub', href: 'https://github.com/…' }`. */
  social: NavLink[];
  /** Hex colors. `surface1`–`surface4` step up from `background`. */
  colors: {
    background: string;
    surface1: string;
    surface2: string;
    surface3: string;
    surface4: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    /** The product's own highlight. Use it only for Nitpick's comments, checks, and the main button. */
    accent: string;
    accentInk: string;
    high: string;
    added: string;
    removed: string;
  };
  fonts: { sans: FontSetting; mono: FontSetting };
  /**
   * Where new demo requests are emailed. Empty sends no email; requests are
   * always saved to the database either way.
   */
  ownerEmail: string;
};

export const siteConfig: SiteConfig = {
  company: 'Fernhill Labs',
  city: 'Toronto',
  product: 'Nitpick',
  tagline: 'Every pull request, reviewed in under a minute.',
  description:
    'Nitpick is an AI code reviewer that reads every pull request within a minute, comments on the exact lines, and writes fixes authors apply in one click.',
  nav: [
    { label: 'Review', href: '/#review' },
    { label: 'Rules', href: '/#rules' },
    { label: 'Security', href: '/#security' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Changelog', href: '/changelog' }
  ],
  footer: [
    {
      title: 'Product',
      links: [
        { label: 'Review', href: '/#review' },
        { label: 'Rules', href: '/#rules' },
        { label: 'Timeline', href: '/#timeline' },
        { label: 'Workflow', href: '/#workflow' },
        { label: 'Security', href: '/#security' },
        { label: 'Pricing', href: '/#pricing' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'Changelog', href: '/changelog' },
        { label: 'Book a demo', href: '/#book-a-demo' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' }
      ]
    }
  ],
  cta: {
    primary: 'Book a demo',
    replay: 'See it review a PR',
    formId: 'book-a-demo'
  },
  social: [],
  colors: {
    background: '#08090a',
    surface1: '#0d0e10',
    surface2: '#121316',
    surface3: '#17181c',
    surface4: '#1e2024',
    text: '#f1f2f3',
    textMuted: '#a7abb2',
    textSubtle: '#8b9098',
    accent: '#c6f39a',
    accentInk: '#0b1206',
    high: '#f2a68f',
    added: '#8fd3a5',
    removed: '#f19c9c'
  },
  fonts: {
    sans: {
      family: 'Schibsted Grotesk',
      file: '/fonts/schibsted-grotesk-latin-wght.woff2',
      weights: '400 900',
      fallback: {
        local: ['Arial', 'Helvetica Neue', 'Roboto'],
        sizeAdjust: '104.34%',
        ascentOverride: '93.59%',
        descentOverride: '24.71%',
        lineGapOverride: '0%'
      }
    },
    mono: {
      family: 'Geist Mono',
      file: '/fonts/geist-mono-latin-wght.woff2',
      weights: '100 900',
      fallback: {
        local: ['Menlo', 'Courier New', 'Roboto Mono'],
        sizeAdjust: '99.98%',
        ascentOverride: '100.52%',
        descentOverride: '29.5%',
        lineGapOverride: '0%'
      }
    }
  },
  ownerEmail: ''
};
