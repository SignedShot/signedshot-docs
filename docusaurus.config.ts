import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SignedShot Documentation',
  tagline: 'Secure screenshot sharing made simple',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://signedshot.io',
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  organizationName: 'SignedShot', // Usually your GitHub org/user name.
  projectName: 'signedshot-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Plausible Analytics (same domain as main site)
  scripts: [
    {
      src: 'https://plausible.io/js/script.js',
      defer: true,
      'data-domain': 'signedshot.io',
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Serve docs at the root
          // Remove edit URL for now
          // editUrl: 'https://github.com/your-org/signedshot-docs/tree/main/',
        },
        // Remove blog configuration entirely
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Color mode configuration
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    // Replace with your project's social card
    image: 'img/signedshot-social-card.jpg',
    navbar: {
      logo: {
        alt: 'SignedShot Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg', // White version for dark mode
        href: 'https://signedshot.io',
        target: '_self', // Optional: '_self' opens in same tab, '_blank' opens in new tab
      },
      items: [
        {
          href: 'https://github.com/SignedShot',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'Concepts',
              to: '/concepts/two-layer-trust',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/SignedShot',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'SignedShot Site',
              href: 'https://signedshot.io',
            },
            {
              label: 'How it Works',
              href: 'https://signedshot.io/how-it-works',
            },
            {
              label: 'Demo',
              href: 'https://signedshot.io/demo',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/SignedShot',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SignedShot. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;