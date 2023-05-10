import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          'Welcome',
          'Models',
          'Prompts',
          'Chains',
          'Agents',
          'Memory',
          'Documents',
          'Indexes',
          'Advanced',
          'Components',
        ],
      },
    },
  },
};

export default preview;
