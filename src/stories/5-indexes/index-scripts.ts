import { OpenAI } from 'langchain/llms/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeClient } from '@pinecone-database/pinecone';
// We are importing one of the special chains that Langchain provides for us
import { RetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { openAi, pineconeEnv, pineconeIndexName, pineconeToken } from '../../env';

//##########
// LangChain
//##########

const llm = new OpenAI({ openAIApiKey: openAi });
const splitter = new CharacterTextSplitter({
  separator: '\n',
  chunkSize: 150,
  chunkOverlap: 10,
});
const loader = new TextLoader('src/stories/assets/documents/monty-grail.txt');

export const memoryStoreExample = async () => {
  try {
    const docs = await loader.load();
    const splitDocs = await splitter.splitDocuments(docs);
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ openAIApiKey: openAi }),
    );

    // Search for the most similar document
    const result = await vectorStore.similaritySearch('Tis but a flesh wound', 1);

    return result[0].pageContent;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
  // Load the docs into the vector store
};

export const queryPinecone = async (msg: string) => {
  // Retriever Docs
  const client = new PineconeClient();
  await client.init({
    apiKey: pineconeToken,
    environment: pineconeEnv,
  });
  const pineconeIndex = client.Index(pineconeIndexName);
  const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({ openAIApiKey: openAi }), {
    pineconeIndex,
  });
  // const result = await vectorStore.similaritySearch(msg, 1);
  const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());
  try {
    const res = await chain.call({
      query: msg,
    });
    return res.text;
    // return result[0].pageContent;
  } catch (error: any) {
    return error.message;
  }
};

// // const answer = await queryPinecone('how do I import design tokens?');
// const answer = await memoryStoreExample();
// console.log(answer);

export async function fetchDocBotEndpoint(question: string) {
  const response = await fetch('/query-pinecone?question=' + encodeURIComponent(question));
  const data = await response.json();
  return data;
}
