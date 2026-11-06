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
  /** e.g. '%s | Your Site' */
  titleTemplate: string;
  author: string;
  /**
   * text: wordmark ('' to hide it). svg: inline SVG markup using currentColor (follows dark mode).
   * src: image path under /public, used when no svg is set. alt: defaults to the site name.
   */
  logo: { text: string; svg?: string; src?: string; alt?: string };
  nav: NavItem[];
  /** Optional call-to-action button in the header */
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
  /** Optional support link, e.g. an issue tracker, shown on the 404 page */
  support?: { label: string; href: string };
  /** Path under /public. Leave empty to omit og:image and twitter:image. */
  ogImage: string;
  features: { blog: boolean; rss: boolean; analytics: boolean };
  /** Optional intro paragraph on the blog index page */
  blogIntro?: string;
}

// The TODO(brief) markers flag starter placeholders: replace each value from PROJECT.md and
// delete the marker. `grep -rn "TODO(brief)" src` must return nothing before the handover.
export const site: SiteConfig = {
  name: 'Your Site', // TODO(brief): site name
  url: SITE_URL,
  description: 'A new website. Replace this description with one sentence about your site.', // TODO(brief): 50-160 characters
  lang: 'en',
  locale: 'en_US',
  titleTemplate: '%s | Your Site', // TODO(brief): '%s | <site name>'
  author: 'Your Name', // TODO(brief): owner or company
  logo: { text: 'Your Site' }, // TODO(brief): wordmark text or logo image
  nav: [
    { href: '/', label: 'Home' },
    // starter:blog-nav
  ],
  footer: {
    groups: [],
    // The footer renders "© <year> " in front of this text
    copyright: 'Your Site. All rights reserved.', // TODO(brief): '<site name>. All rights reserved.'
  },
  social: [],
  contact: {},
  ogImage: '',
  features: { blog: false, rss: false, analytics: false },
};

/** Full document title: applies the title template, or falls back to the site name. */
export function pageTitle(title?: string): string {
  return title ? site.titleTemplate.replace('%s', title) : site.name;
}
