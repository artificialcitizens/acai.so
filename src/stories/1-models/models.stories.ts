import type { Meta, StoryObj } from '@storybook/react';
import Chat from '../../components/Chat/Chat';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import 'dotenv/config';

//##########
// LangChain
//##########

/* Create embeddings instance */
const embeddings = new OpenAIEmbeddings({ openAIApiKey: import.meta.env.STORYBOOK_OPENAI_API_KEY });
/* Embed queries */
const embeddingExample = async (input: string) => {
  const res = await embeddings.embedQuery(input);
  return JSON.stringify(res);
};

const chatModelExample = async (query: string) => {
  const chat = new ChatOpenAI({ openAIApiKey: import.meta.env.STORYBOOK_OPENAI_API_KEY });
  // Pass in a list of messages to `call` to start a conversation.
  const response = await chat.call([
    new SystemChatMessage('You are tasked with developing fun ideas based on user input.'),
    new HumanChatMessage(query),
  ]);
  return response.text;
};

const llmExample = async (msg: string) => {
  const model = new OpenAI({ openAIApiKey: import.meta.env.STORYBOOK_OPENAI_API_KEY });
  // `call` is a simple string-in, string-out method for interacting with the model.
  const response = await model.call(msg + '\n');
  return response.trim();
};

// #########
// Storybook
// #########
const meta = {
  title: 'Models/Stories',
  component: Chat,
  tags: ['autodocs'],
  argTypes: {
    onSubmitHandler: { control: 'function' },
    height: { control: 'string' },
    startingValue: { control: 'string' },
    placeHolder: { control: 'string' },
  },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const ChatLLMExample: Story = {
  args: {
    onSubmitHandler: async (message: string) => {
      const response = await chatModelExample(message).then((response) => response);
      return response;
    },
    height: '300px',
    placeHolder: 'What is a good name for a company that makes enterprise level design systems? (Hint: it is Knapsack)',
  },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const LLMModelExample: Story = {
  args: {
    onSubmitHandler: async (message: string) => {
      const response = await llmExample(message).then((response) => response);
      return response;
    },
    height: '300px',
    placeHolder: 'What is a good name for a company that makes enterprise level design systems? (Hint: it is Knapsack)',
  },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const EmbeddingModelExample: Story = {
  args: {
    onSubmitHandler: async (message: string) => {
      const response = await embeddingExample(message).then((response) => response);
      return response;
    },
    height: '500px',
    placeHolder: 'Hello World!',
  },
};
