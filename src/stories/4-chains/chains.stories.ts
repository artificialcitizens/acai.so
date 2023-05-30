import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import TipTap from '../../components/TipTap/TipTap';
import Chat from '../../components/Chat/Chat';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { OpenAI } from 'langchain/llms/openai';
import { LLMChain, SimpleSequentialChain } from 'langchain/chains';
import { BufferWindowMemory } from 'langchain/memory';

//##########
// LangChain
//##########

const chatModel = new ChatOpenAI({ temperature: 0, openAIApiKey: import.meta.env.STORYBOOK_OPENAI_API_KEY });
const llm = new OpenAI({ openAIApiKey: import.meta.env.STORYBOOK_OPENAI_API_KEY });
const memory = new BufferWindowMemory({ k: 5 });

const basicLlmChain = async (input: string) => {
  const prompt = PromptTemplate.fromTemplate('What is a good name for a company that makes {product}?');
  // We can construct an LLMChain from a PromptTemplate and an LLM.
  const chain = new LLMChain({ llm, prompt, memory });

  // The result is an object with a `text` property.
  const res = await chain.call({ product: input });

  return res.text;
};

const basicSequentialChain = async (input: string) => {
  // This is an LLMChain to write a synopsis given a title of a play.
  const template = `You are a brand consultant. Given the name of a company, 
  it is your job to write a description of what the company does based on the name alone.
 
  Company: {name}
  Description: This is a description for the {name} company:`;
  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ['name'],
  });
  const descriptionChain = new LLMChain({ llm: chatModel, prompt: promptTemplate });

  // This is an LLMChain to write a review of a play given a synopsis.
  const webTemplate = `You are a writer covering the latest and greatest in companies.
  Given a description of a company, it is your job to write a long form blog post about the company.

  Only output the blog post and nothing else
 
  Business Description:
  {description}
  Post:`;
  const webPromptTemplate = new PromptTemplate({
    template: webTemplate,
    inputVariables: ['description'],
  });
  const webChain = new LLMChain({
    llm,
    prompt: webPromptTemplate,
  });

  const overallChain = new SimpleSequentialChain({
    chains: [descriptionChain, webChain],
    verbose: true,
  });
  const review = await overallChain.run(input);

  return review.trim();
};
// #########
// Storybook
// #########
const meta = {
  title: 'Chains/Stories',
  component: Chat,
  argTypes: {
    startingValue: { control: 'string' },
    onSubmitHandler: { control: 'function' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LlmChainExample: Story = {
  args: {
    onSubmitHandler: basicLlmChain,
    startingValue: ``,
  },
};

export const SequentialChainExample: Story = {
  args: {
    onSubmitHandler: basicSequentialChain,
    startingValue: ``,
  },
};
