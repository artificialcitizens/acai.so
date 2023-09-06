import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { AcaiMemoryVector } from '../../../../db';
import { Document } from 'langchain/document';
import { Embeddings } from 'langchain/embeddings/base';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getToken } from '../../../utils/config';

export const initializeMemoryVectorStore = async ({
  docs,
}: {
  docs: Document[];
}) => {
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    }),
  );
  return vectorStore;
};

/**
 * Adds documents to the MemoryVectorStore.
 */
export const addDocumentsToMemoryVectorStore = async (
  vectorStore: MemoryVectorStore,
  docs: Document[],
): Promise<AcaiMemoryVector[]> => {
  await vectorStore.addDocuments(docs);
  return vectorStore.memoryVectors;
};

/**
 * Performs a similarity search in the MemoryVectorStore.
 */
export const similaritySearchInMemoryVectorStore = async (
  vectorStore: MemoryVectorStore,
  query: string,
  /** Returns top k relevant documents from the search */
  k = 4,
  filter?: (doc: Document<Record<string, any>>) => boolean,
): Promise<Document<Record<string, any>>[]> => {
  const results = await vectorStore.similaritySearch(query, k, filter);
  return results;
};

/**
 * Performs a similarity search in the MemoryVectorStore with scores.
 */
export const similaritySearchWithScoreInMemoryVectorStore = async (
  vectorStore: MemoryVectorStore,
  query: string,
  k = 4,
  filter?: (doc: Document<Record<string, any>>) => boolean,
): Promise<[Document<Record<string, any>>, number][]> => {
  const results = await vectorStore.similaritySearchWithScore(query, k, filter);
  return results;
};

/**
 * Creates a MemoryVectorStore from texts.
 */
export const fromTextsToMemoryVectorStore = async (
  texts: string[],
  metadatas: object | object[],
  embeddings: Embeddings,
  dbConfig?: any,
): Promise<MemoryVectorStore> => {
  const vectorStore = await MemoryVectorStore.fromTexts(
    texts,
    metadatas,
    embeddings,
    dbConfig,
  );
  return vectorStore;
};

/**
 * Creates a MemoryVectorStore from an existing index.
 */
export const fromExistingIndexToMemoryVectorStore = async (
  embeddings: Embeddings,
  dbConfig?: any,
): Promise<MemoryVectorStore> => {
  const vectorStore = await MemoryVectorStore.fromExistingIndex(
    embeddings,
    dbConfig,
  );
  return vectorStore;
};
