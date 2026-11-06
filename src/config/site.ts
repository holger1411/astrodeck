/**
 * Central site configuration — the single place for brand, navigation,
 * footer, SEO defaults and feature flags. Components read from here;
 * pages pass plain titles (e.g. "Pricing") and never repeat the brand.
 */
import { SITE_URL } from './site-url.mjs';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  /** e.g. 'en' */
  lang: string;
  /** e.g. 'en_US' */
  locale: string;
  /** e.g. '%s | AstroDeck' */
  titleTemplate: string;
  author: string;
  /**
   * text: wordmark ('' to hide it). svg: inline SVG markup using currentColor (follows dark mode).
   * src: image path under /public, used when no svg is set. alt: defaults to the site name.
   */
  logo: { text: string; svg?: string; src?: string; alt?: string };
  nav: NavItem[];
  /** e.g. GitHub link in the demo */
  headerCta?: NavItem;
  footer: {
    /** Short brand blurb shown under the footer logo */
    tagline?: string;
    groups: { title: string; links: NavItem[] }[];
    copyright: string;
    /** Optional credit block, e.g. { label: 'example.com', href: 'https://example.com' } */
    credit?: { label: string; href: string };
  };
  /** Profile links, rendered as text links in the footer (real profiles only). [] hides them. */
  social: { label: string; href: string }[];
  /** Shown in the footer (email as mailto:, phone as tel:) and used for the 404 fallback. */
  contact: { email?: string; phone?: string; address?: string };
  /** Optional support link, e.g. an issue tracker, shown on the 404 page */
  support?: { label: string; href: string };
  /** Path under /public */
  ogImage: string;
  features: { blog: boolean; rss: boolean; analytics: boolean };
  /** Optional intro paragraph on the blog index page */
  blogIntro?: string;
}

export const site: SiteConfig = {
  name: 'AstroDeck',
  url: SITE_URL,
  description: 'Free, open-source Astro starter kit for building websites with a coding agent',
  lang: 'en',
  locale: 'en_US',
  titleTemplate: '%s | AstroDeck',
  author: 'Holger Könemann',
  logo: {
    text: 'AstroDeck',
    // AstroDeck deck mark (demo branding; starter:clean replaces this file)
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><rect x="6" y="8" width="14" height="18" rx="2" opacity="0.9"/><rect x="9" y="6" width="14" height="18" rx="2" opacity="0.7"/><rect x="12" y="4" width="14" height="18" rx="2" opacity="0.5"/><path d="M19 12 L20 15 L23 15 L20.5 17 L21.5 20 L19 18 L16.5 20 L17.5 17 L15 15 L18 15 Z" opacity="0.3"/></svg>',
  },
  nav: [
    { href: '/', label: 'Home' },
    { href: '/pages', label: 'Pages' },
    { href: '/sections', label: 'Sections' },
    { href: '/components', label: 'Components' },
    { href: '/docs', label: 'Docs' },
    { href: '/changelog', label: 'Changelog' },
  ],
  headerCta: {
    label: 'GitHub',
    href: 'https://github.com/holger1411/astrodeck',
    external: true,
  },
  footer: {
    tagline:
      'Open-source Astro starter kit for building websites with your coding agent, checked by npm run verify and vibe2prod.',
    groups: [
      {
        title: 'AstroDeck',
        links: [
          { href: '/', label: 'Home' },
          { href: '/docs', label: 'Docs' },
          { href: '/sections', label: 'Sections' },
          { href: '/changelog', label: 'Changelog' },
        ],
      },
      {
        title: 'Pages',
        links: [
          { href: '/blog', label: 'Blog' },
          { href: '/content', label: 'Content' },
          { href: '/login', label: 'Login' },
        ],
      },
    ],
    // The footer renders "© <year> " in front of this text
    copyright: 'AstroDeck. MIT License. Open Source.',
    credit: { label: 'templatedeck.com', href: 'https://templatedeck.com' },
  },
  social: [{ label: 'GitHub', href: 'https://github.com/holger1411/astrodeck' }],
  contact: {},
  support: { label: 'report it on GitHub', href: 'https://github.com/holger1411/astrodeck/issues' },
  ogImage: '/cover.png',
  features: { blog: true, rss: true, analytics: true },
  blogIntro:
    'Where ancient monsters navigate modern bureaucracy, mythical creatures struggle with technology, and the supernatural discovers that HOA violations are scarier than dragonslayers.',
};

/** Full document title: applies the title template, or falls back to the site name. */
export function pageTitle(title?: string): string {
  return title ? site.titleTemplate.replace('%s', title) : site.name;
}
