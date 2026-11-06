/**
 * Built-in interface text: skip link, menu and theme buttons, contact labels and form, footer
 * credit and the 404 page. English by default. When `site.lang` is not English, translate every
 * value here so no English text is left on the site (screen readers read the aria labels too).
 */
export const ui = {
  skipToContent: 'Skip to content',
  menuToggle: 'Toggle navigation menu',
  themeToggle: 'Dark mode',
  contact: {
    /** aria-label of the contact details list */
    list: 'Contact information',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    /** Link text for Contact's mapUrl */
    map: 'Open in map',
    hours: 'Opening hours',
    name: 'Name',
    subject: 'Subject',
    message: 'Message',
    required: 'Required fields',
    submit: 'Send message',
  },
  footer: {
    /** Heading and lines of the optional credit block (site.footer.credit) */
    creditHeading: 'Creator',
    createdBy: 'Created by',
    createdFor: 'for',
    /** aria-label of the social links list (site.social) */
    social: 'Social links',
  },
  notFound: {
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
    heading: 'Page not found',
    text: "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.",
    home: 'Back to Home',
    blog: 'Read Blog',
    /** Followed by a link to site.support or the contact email */
    help: 'If you believe this is an error, please',
    contactUs: 'contact us',
  },
};
