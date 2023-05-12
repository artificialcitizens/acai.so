import { addons } from '@storybook/manager-api';
import customTheme from './customTheme';

addons.setConfig({
  theme: customTheme,
  sidebar: {
    collapsedRoots: ['models', 'prompts', 'chains', 'agents', 'memory', 'documents', 'indexes', 'components'],
  },
});
