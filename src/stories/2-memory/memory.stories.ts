import type { Meta, StoryObj } from '@storybook/react';
import Chat from '../../components/Chat/Chat';
import { OpenAI } from 'langchain/llms/openai';

//##########
// LangChain
//##########

const model = new OpenAI({ openAIApiKey: import.meta.env.STORYBOOK_OPENAI_API_KEY });

const llmExample = async (input: string, chatHistory: string) => {
  console.log('chat_history', chatHistory);
  // `call` is a simple string-in, string-out method for interacting with the model.
  const response = model.call(chatHistory + `\n` + input + '\n');
  return response;
};

// #########
// Storybook
// #########
const meta = {
  title: 'Memory/Stories',
  component: Chat,
  argTypes: {
    onSubmitHandler: { control: 'function' },
    height: { control: 'string' },
    startingValue: { control: 'string' },
    placeHolder: { control: 'string' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const BasicMemoryExample: Story = {
  args: {
    onSubmitHandler: async (message: string, chatHistory: string) => {
      const response = await llmExample(message, chatHistory).then((response) => response);
      return response.trim();
    },
    height: '250px',
    startingValue: `What is a good name for a company that makes enterprise level design systems? (Hint: it is Knapsack)`,
  },
};

// // More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
// export const LLMModelExample: Story = {
//   args: {
//     onClickHandler: async (message: string) => {
//       const response = await llmExample(message).then((response) => response);
//       return response;
//     },
//     height: '500px',
//     placeHolder: 'What is a good name for a company that makes enterprise level design systems? (Hint: it is Knapsack)',
//   },
// };

// // More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
// export const EmbeddingModelExample: Story = {
//   args: {
//     onSubmitHandler: async (message: string) => {
//       const response = await embeddingExample(message).then((response) => response);
//       return response;
//     },
//     height: '500px',
//     placeHolder: 'Hello World!',
//   },
// };
