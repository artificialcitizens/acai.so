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
import { useParams } from 'react-router-dom';
import { getToken } from '../utils/config';

export type VectorStoreContextType = {
  vectorstore: any; // Replace any with the actual type if available
  addDocuments: (docs: any[]) => void; // Replace any with the actual type if available
  addText: (
    text: string,
    metadata: Record<string, any>[],
    chunkHeader: string,
  ) => Promise<AcaiMemoryVector[] | undefined>;
  filterAndCombineContent: (
    data: Array<[Document, number]>,
    threshold: number,
  ) => string;
  similaritySearchWithScore: (
    query: string,
    k?: number,
    filter?: any,
  ) => Promise<any>; // Replace any with the actual type if available
};

export const useMemoryVectorStore = (
  initialText: string,
  chunkSize = 2500,
  chunkOverlap = 500,
) => {
  const [vectorstore, setVectorStore] = useState<MemoryVectorStore | null>(
    null,
  );

  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const workspaceId = rawWorkspaceId || 'docs';

  const memoryVectors = useLiveQuery(() => {
    setVectorStore(null);
    return db.memoryVectors.where('workspaceId').equals(workspaceId).toArray();
  }, [workspaceId]);

  useEffect(() => {
    createDocumentsFromText({
      text: initialText,
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    }).then(async (res) => {
      const openAIApiKey =
        getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY;
      if (!openAIApiKey) return;
      const vectorStore = await initializeMemoryVectorStore({ docs: res });
      const vectorSet = new Set(vectorStore.memoryVectors);
      memoryVectors?.forEach((mem) => {
        mem.memoryVectors.forEach((vector) => {
          if (!vectorSet.has(vector)) {
            vectorSet.add(vector);
          }
        });
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
    metadata: Record<string, any>[],
    chunkHeader: string,
  ): Promise<AcaiMemoryVector[] | undefined> => {
    if (!vectorstore) return;
    const docs = await createDocumentsFromText({
      text,
      chunkSize,
      chunkOverlap,
      chunkHeader,
      metadata,
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
    const pageContents = filteredData.map(
      ([document]) => `${document.pageContent}\n SRC: ${document.metadata.src}`,
    );
    // Combine the page contents into a single string
    const combinedContent = pageContents.join('<br/><hr/><br/>');

    return combinedContent;
  };

  const similaritySearchWithScore = async (
    query: string,
    k = 5,
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
