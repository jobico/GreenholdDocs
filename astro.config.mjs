// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://docs.greenhold.eu',
  telemetry: false,
  integrations: [
    // Mermaid renders in the reader's browser. Nothing runs at build time.
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'Greenhold Docs',
      description: 'How to install, run and secure Greenhold.',
      logo: {
        light: './src/assets/docs.svg',
        dark: './src/assets/docs-dark.svg',
        alt: 'Greenhold Docs',
      },
      favicon: '/favicon.svg',
      components: { Footer: './src/components/Footer.astro' },
      customCss: ['./src/styles/greenhold.css'],
      lastUpdated: false,
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Get started',
          items: [
            'get-started/requirements',
            'get-started/before-you-install',
            'get-started/install-the-server',
            'get-started/enroll-your-first-device',
          ],
        },
        {
          label: 'Concepts',
          items: [
            'concepts/how-greenhold-works',
            'concepts/orders-and-releases',
            'concepts/libraries-and-packages',
            'concepts/policy-for-agents',
            'concepts/security-model',
            'concepts/certificates',
          ],
        },
        {
          label: 'Operate',
          items: [
            'operate/upgrade-greenhold',
            'operate/troubleshooting',
            'operate/logs-and-support-bundles',
            'operate/remove-greenhold',
          ],
        },
        { label: 'Reference', items: ['reference/command-line', 'third-party-notices'] },
      ],
    }),
  ],
});
