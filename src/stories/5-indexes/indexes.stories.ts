import type { Meta, StoryObj } from '@storybook/react';
import Chat from '../../components/Chat/Chat';
import { OpenAI } from 'langchain/llms/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeClient } from '@pinecone-database/pinecone';
// We are importing one of the special chains that Langchain provides for us
import { RetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

//##########
// LangChain
//##########

const llm = new OpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
const splitter = new CharacterTextSplitter({
  separator: '\n',
  chunkSize: 150,
  chunkOverlap: 10,
});
const loader = new TextLoader('src/stories/assets/documents/vector_store_guide.txt');

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

// Retriever Docs
const client = new PineconeClient();
await client.init({
  apiKey: import.meta.env.VITE_PINECONE_API_KEY,
  environment: import.meta.env.VITE_PINECONE_ENVIRONMENT,
});
const pineconeIndex = client.Index(import.meta.env.VITE_PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY }),
  { pineconeIndex },
);
const queryPinecone = async (msg: string) => {
  const result = await vectorStore.similaritySearch(msg, 1);
  const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());
  try {
    const res = await chain.call({
      query: msg,
    });

    // return res.text;
    return result[0].pageContent;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
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

export const PineconeExample: Story = {
  args: {
    onSubmitHandler: queryPinecone,
    startingValue: ``,
  },
};

// export const SequentialChainExample: Story = {
//   args: {
//     onSubmitHandler: basicSequentialChain,
//     startingValue: ``,
//   },
// };
