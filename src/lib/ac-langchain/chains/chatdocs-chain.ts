import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { BufferMemory } from 'langchain/memory';
import { useAcaiEmbeddings, useAcaiLLM } from '../models/chat';

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
    const { embeddings } = useAcaiEmbeddings()
    vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
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
