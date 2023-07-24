import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Document } from 'langchain/document';
import { Embeddings } from 'langchain/embeddings/base';

export const initializeMemoryVectorStore = async ({
  docs,
  openAIApiKey,
}: {
  docs: Document[];
  openAIApiKey: string;
}) => {
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({ openAIApiKey }));
  return vectorStore;
};

/**
 * Adds documents to the MemoryVectorStore.
 * @param vectorStore The MemoryVectorStore instance.
 * @param docs The documents to add.
 */
export const addDocumentsToMemoryVectorStore = async (
  vectorStore: MemoryVectorStore,
  docs: Document[],
): Promise<void> => {
  await vectorStore.addDocuments(docs);
};

/**
 * Performs a similarity search in the MemoryVectorStore.
 * @param vectorStore The MemoryVectorStore instance.
 * @param query The query string.
 * @param k The number of results to return. Default is 4.
 * @param filter Optional filter function.
 * @returns The matching documents.
 */
export const similaritySearchInMemoryVectorStore = async (
  vectorStore: MemoryVectorStore,
  query: string,
  k = 4,
  filter?: (doc: Document<Record<string, any>>) => boolean,
): Promise<Document<Record<string, any>>[]> => {
  const results = await vectorStore.similaritySearch(query, k, filter);
  return results;
};

/**
 * Performs a similarity search in the MemoryVectorStore with scores.
 * @param vectorStore The MemoryVectorStore instance.
 * @param query The query string.
 * @param k The number of results to return. Default is 4.
 * @param filter Optional filter function.
 * @returns The matching documents with scores.
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
 * @param texts The texts to add.
 * @param metadatas The metadata for the texts.
 * @param embeddings The embeddings to use.
 * @param dbConfig The database configuration.
 * @returns The created MemoryVectorStore.
 */
export const fromTextsToMemoryVectorStore = async (
  texts: string[],
  metadatas: object | object[],
  embeddings: Embeddings,
  dbConfig?: any,
): Promise<MemoryVectorStore> => {
  const vectorStore = await MemoryVectorStore.fromTexts(texts, metadatas, embeddings, dbConfig);
  return vectorStore;
};

/**
 * Creates a MemoryVectorStore from an existing index.
 * @param embeddings The embeddings to use.
 * @param dbConfig The database configuration.
 * @returns The created MemoryVectorStore.
 */
export const fromExistingIndexToMemoryVectorStore = async (
  embeddings: Embeddings,
  dbConfig?: any,
): Promise<MemoryVectorStore> => {
  const vectorStore = await MemoryVectorStore.fromExistingIndex(embeddings, dbConfig);
  return vectorStore;
};
