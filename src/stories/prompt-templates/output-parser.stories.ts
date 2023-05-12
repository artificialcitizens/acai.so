import type { Meta, StoryObj } from '@storybook/react';
import Chat from '../../components/Chat/Chat';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { z } from 'zod';
import { StructuredOutputParser, OutputFixingParser } from 'langchain/output_parsers';

//##########
// LangChain
//##########

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    answer: z.string().describe("answer to the user's question"),
    sources: z.array(z.string()).describe('sources used to answer the question, should be websites.'),
  }),
);

const zodExample = async (query: string) => {
  const chat = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
  // Pass in a list of messages to `call` to start a conversation.
  const response = await chat.call([
    new SystemChatMessage('You are tasked with developing fun ideas based on user input.'),
    new HumanChatMessage(query),
  ]);
  return response.text;
};

// #########
// Storybook
// #########
const meta = {
  component: Chat,
  tags: ['autodocs'],
  argTypes: {
    onSubmitHandler: { control: 'function' },
    height: { control: 'string' },
    startingValue: { control: 'string' },
  },
} satisfies Meta<typeof Chat>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const ZODExample: Story = {
  args: {
    onSubmitHandler: async (message: string) => {
      const response = await zodExample(message).then((response) => response);
      return response;
    },
    height: '250px',
    startingValue:
      'What is a good name for a company that makes enterprise level design systems? (Hint: it is Knapsack)',
  },
};
