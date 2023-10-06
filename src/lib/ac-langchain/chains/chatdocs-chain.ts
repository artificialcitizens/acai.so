import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BufferMemory } from 'langchain/memory';
import { useAcaiLLM } from '../models/chat';

/* Initialize the LLM to use to answer the question */
const { llm: model } = useAcaiLLM();
export const docBotChat = async ({
  question,
  docs,
  vectorStore,
}: {
  question: string;
  docs: any[];
  vectorStore?: any;
}) => {
  if (!vectorStore) {
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  }
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      memory: new BufferMemory({
        memoryKey: 'chat_history',
      }),
    },
  );
  const res = await chain.call({ question });
  return res;
};
