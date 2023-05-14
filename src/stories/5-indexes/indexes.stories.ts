import type { Meta, StoryObj } from '@storybook/react';
import fs from 'fs';
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
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';

//##########
// LangChain
//##########

const chatModel = new ChatOpenAI({ temperature: 0, openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
const llm = new OpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
const splitter = new CharacterTextSplitter({
  separator: '\n',
  chunkSize: 150,
  chunkOverlap: 10,
});
const text = fs.readFileSync('assets/', 'utf8');

const memoryStoreExample = async () => {
  try {
    const docs = await loader.load();
    console.log('docs', docs);
    const splitDocs = await splitter.splitDocuments(docs);
    console.log('splitDocs', splitDocs[5]);
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY }),
    );

    // Search for the most similar document
    const result = await vectorStore.similaritySearch('Tis but a flesh wound', 1);

    console.log(result);
    return result[0].pageContent;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
  // Load the docs into the vector store
};

// #########
// Storybook
// #########
const meta = {
  title: 'Indexes/Stories',
  component: Chat,
  argTypes: {
    startingValue: { control: 'string' },
    onSubmitHandler: { control: 'function' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MemoryStoreExample: Story = {
  args: {
    onSubmitHandler: memoryStoreExample,
    startingValue: ``,
  },
};

// export const SequentialChainExample: Story = {
//   args: {
//     onSubmitHandler: basicSequentialChain,
//     startingValue: ``,
//   },
// };
