import './App.css';
import Chat from './components/Chat/Chat';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import 'dotenv/config';

import { PineconeClient } from '@pinecone-database/pinecone';
// We are importing one of the special chains that Langchain provides for us
import { RetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

const llm = new OpenAI({ openAIApiKey: process.env.STORYBOOK_OPENAI_API_KEY });
// Retriever Docs
const client = new PineconeClient();
await client.init({
  apiKey: process.env.STORYBOOK_PINECONE_API_KEY!,
  environment: process.env.STORYBOOK_PINECONE_ENVIRONMENT!,
});
const pineconeIndex = client.Index(process.env.STORYBOOK_PINECONE_INDEX!);

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({ openAIApiKey: process.env.STORYBOOK_OPENAI_API_KEY }),
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

function App() {
  return (
    <>
      <Chat onSubmitHandler={queryPinecone} />
    </>
  );
}

export default App;
