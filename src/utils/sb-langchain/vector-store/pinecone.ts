import { PineconeClient, QueryRequest } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

const client = new PineconeClient();
const embeddingModel = new OpenAIEmbeddings({
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
});
let vectorStore: PineconeStore;

const initializePinecone = async (apiKey?: string, env?: string, indexName?: string) => {
  await client.init({
    apiKey: apiKey || (import.meta.env.VITE_PINECONE_API_KEY as string),
    environment: env || (import.meta.env.VITE_PINECONE_ENV as string),
  });
  const pineconeIndex = client.Index(indexName || (import.meta.env.VITE_PINECONE_INDEX_NAME as string));

  if (!vectorStore) {
    vectorStore = await PineconeStore.fromExistingIndex(embeddingModel, {
      pineconeIndex,
    });
  }
};

/**
 *  Converts the data from pinecone query results into into a yaml string
 *  removing any results that are below the threshold
 */
const formatData = (data: any, similarityThreshold: number) => {
  const yamlArr: string[] = [];
  data.forEach((match: any) => {
    const {
      metadata: { text, url },
      score,
    } = match as any;
    if (score < similarityThreshold) return;
    const str = `- text: ${JSON.stringify(text)}
    url: ${url}
    score: ${score}
    `;
    yamlArr.push(str);
  });
  return yamlArr.length > 0 ? yamlArr.join('\n') : '';
};

export const queryPinecone = async (query: string, indexName?: string) => {
  const vector = await embeddingModel.embedQuery(query);
  await initializePinecone();

  const pineconeIndex = client.Index(indexName || (import.meta.env.VITE_PINECONE_INDEX_NAME as string));
  const queryRequest: QueryRequest = {
    topK: 5,
    vector,
    includeMetadata: true,
  };
  const queryResponse = await pineconeIndex.query({ queryRequest });

  const response = formatData(queryResponse.matches, 0.5);

  return response;
};
