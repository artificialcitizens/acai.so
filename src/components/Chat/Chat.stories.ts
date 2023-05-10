import type { Meta, StoryObj } from '@storybook/react';

import Chat from './Chat';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Components/Chat',
  component: Chat,
  tags: ['autodocs'],
  argTypes: {
    onSubmitHandler: { control: 'function' },
  },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const ChatWidgetBase: Story = {
  args: {
    onSubmitHandler: (message: string, chatHistory: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Pong');
        }, 1000);
      });
    },
  },
};
