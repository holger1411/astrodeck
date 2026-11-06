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
  logo: { text: string; src?: string; alt?: string };
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
  social: {
    label: string;
    href: string;
    icon: 'github' | 'x' | 'linkedin' | 'mastodon' | 'bluesky' | 'youtube' | 'instagram';
  }[];
  contact: { email?: string; phone?: string; address?: string };
  /** Path under /public */
  ogImage: string;
  features: { blog: boolean; rss: boolean; analytics: boolean };
  /** Optional intro paragraph on the blog index page */
  blogIntro?: string;
}

export const site: SiteConfig = {
  name: 'AstroDeck',
  url: SITE_URL,
  description: 'Open-source Astro starter kit for AI-assisted websites',
  lang: 'en',
  locale: 'en_US',
  titleTemplate: '%s | AstroDeck',
  author: 'Holger Könemann',
  logo: { text: 'AstroDeck' },
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
      'Open-source Astro.js starter kit with ready-to-use components. Start building faster.',
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
  social: [{ label: 'GitHub', href: 'https://github.com/holger1411/astrodeck', icon: 'github' }],
  contact: {},
  ogImage: '/cover.png',
  features: { blog: true, rss: true, analytics: true },
  blogIntro:
    'Where ancient monsters navigate modern bureaucracy, mythical creatures struggle with technology, and the supernatural discovers that HOA violations are scarier than dragonslayers.',
};

/** Full document title: applies the title template, or falls back to the site name. */
export function pageTitle(title?: string): string {
  return title ? site.titleTemplate.replace('%s', title) : site.name;
}
