import type { Meta, StoryObj } from '@storybook/react';
import Chat from '../../components/Chat/Chat';
import { fetchCustomAgentEndpoint } from './custom-agent';
import { fetchMrklAgentEndpoint } from './basic-agent';
import { fetchChatMrklAgentEndpoint } from './chat-agent';

const meta = {
  title: 'Agents/Stories',
  component: Chat,
  argTypes: {
    startingValue: { control: 'string' },
    onSubmitHandler: { control: 'function' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AgentExample: Story = {
  args: {
    onSubmitHandler: fetchCustomAgentEndpoint,
    startingValue: ``,
  },
};

export const MrklExample: Story = {
  args: {
    onSubmitHandler: fetchMrklAgentEndpoint,
    startingValue: ``,
  },
};

export const ChatMrklExample: Story = {
  args: {
    onSubmitHandler: fetchChatMrklAgentEndpoint,
    startingValue: ``,
  },
};
