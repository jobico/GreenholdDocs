// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://docs.greenhold.eu',
  telemetry: false,
  redirects: {
    '/concepts/orders-and-releases': '/dispatch/orders-and-releases/',
    '/concepts/libraries-and-packages': '/library/libraries-and-packages/',
  },
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
            'get-started/first-steps',
            'get-started/requirements',
            'get-started/admin-tools',
            'get-started/before-you-install',
            'get-started/install-the-server',
            'get-started/enroll-your-first-device',
          ],
        },
        {
          label: 'Greenhold Dispatch',
          items: [
            'dispatch/overview',
            'dispatch/orders-and-releases',
            'dispatch/run-a-powershell-script',
            'dispatch/second-signer-and-tags',
            'dispatch/run-output-and-retention',
          ],
        },
        {
          label: 'Greenhold Library',
          items: [
            'library/overview',
            'library/libraries-and-packages',
            'library/create-a-library',
            'library/install-a-package',
            'library/remove-a-package',
            'library/library-installer',
            'library/azure-blob',
            'library/automatic-publisher',
          ],
        },
        {
          label: 'Concepts',
          items: [
            'concepts/how-greenhold-works',
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
