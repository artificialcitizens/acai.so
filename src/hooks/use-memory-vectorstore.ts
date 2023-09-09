import { useState, useEffect } from 'react';
import {
  initializeMemoryVectorStore,
  addDocumentsToMemoryVectorStore,
  similaritySearchWithScoreInMemoryVectorStore,
} from '../lib/ac-langchain/vector-store/in-memory';
import { createDocumentsFromText } from '../lib/ac-langchain/text-splitters';
import { Document } from 'langchain/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { AcaiMemoryVector, db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useMemoryVectorStore = (
  initialText: string,
  chunkSize = 1250,
  chunkOverlap = 250,
) => {
  const [vectorstore, setVectorStore] = useState<MemoryVectorStore | null>(
    null,
  );

  const memoryVectors = useLiveQuery(() => db.memoryVectors.toArray());
  useEffect(() => {
    createDocumentsFromText({
      text: initialText,
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    }).then(async (res) => {
      const vectorStore = await initializeMemoryVectorStore({ docs: res });
      const vectorSet = new Set(vectorStore.memoryVectors);
      memoryVectors?.forEach((mem) => {
        mem.memoryVectors.forEach((vector) => vectorSet.add(vector));
      });
      vectorStore.memoryVectors = Array.from(vectorSet);
      setVectorStore(vectorStore);
    });
  }, [initialText, chunkSize, chunkOverlap, memoryVectors]);

  const addDocuments = async (
    docs: Document[],
  ): Promise<AcaiMemoryVector[] | undefined> => {
    if (!vectorstore) return;
    const memoryVectors = await addDocumentsToMemoryVectorStore(
      vectorstore,
      docs,
    );
    return memoryVectors;
  };

  const addText = async (
    text: string,
  ): Promise<AcaiMemoryVector[] | undefined> => {
    if (!vectorstore) return;
    const docs = await createDocumentsFromText({
      text,
      chunkSize,
      chunkOverlap,
    });
    const memoryVectors = await addDocuments(docs);
    return memoryVectors;
  };

  const filterAndCombineContent = (
    data: Array<[Document, number]>,
    threshold: number,
  ): string => {
    // Filter out responses with a similarity score below the threshold
    const filteredData = data.filter(
      ([, similarityScore]) => similarityScore >= threshold,
    );

    // Map through the filtered data and extract the pageContent
    const pageContents = filteredData.map(([document]) => document.pageContent);
    // Combine the page contents into a single string
    const combinedContent = pageContents.join('<br/><hr/><br/>');

    return combinedContent;
  };

  const similaritySearchWithScore = async (
    query: string,
    k = 10,
    filter?: any,
  ) => {
    if (!vectorstore) return [];
    return await similaritySearchWithScoreInMemoryVectorStore(
      vectorstore,
      query,
      k,
      filter,
    );
  };

  return {
    vectorstore,
    addDocuments,
    addText,
    filterAndCombineContent,
    similaritySearchWithScore,
  };
};
