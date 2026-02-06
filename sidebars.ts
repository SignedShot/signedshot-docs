import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/two-layer-trust',
        'concepts/sidecar-format',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/quick-start',
        'guides/ios-integration',
        'guides/python-validation',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/overview',
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/threat-model',
        'security/limitations',
      ],
    },
  ],
};

export default sidebars;
