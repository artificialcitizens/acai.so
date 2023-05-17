import type { Preview } from '@storybook/react';
import '../src/App.css';

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
        order: ['Welcome', 'Models', 'Memory', 'Prompts', 'Chains', 'Indexes', 'Agents', 'Advanced', 'Components'],
      },
    },
  },
};

export default preview;
