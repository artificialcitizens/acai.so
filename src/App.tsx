import './App.css';
import Chat from './components/Chat/Chat';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

import { PineconeClient } from '@pinecone-database/pinecone';
// We are importing one of the special chains that Langchain provides for us
import { RetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

const llm = new OpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
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

function App() {
  return (
    <>
      <Chat onSubmitHandler={queryPinecone} />
    </>
  );
}

export default App;
