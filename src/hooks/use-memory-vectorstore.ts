import { useState, useEffect } from 'react';
import {
  initializeMemoryVectorStore,
  addDocumentsToMemoryVectorStore,
  similaritySearchWithScoreInMemoryVectorStore,
} from '../utils/sb-langchain/vector-store/in-memory';
import { createDocumentsFromText } from '../utils/sb-langchain/text-splitters';
import { Document } from 'langchain/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { toastifyError } from '../components/Toast';
import { getCookie } from '../utils/config';

export const useMemoryVectorStore = (initialText: string, chunkSize = 750, chunkOverlap = 75) => {
  const [vectorstore, setVectorStore] = useState<MemoryVectorStore | null>(null);
  const openAIApiKey = getCookie('OPENAI_KEY');

  useEffect(() => {
    if (!openAIApiKey) {
      toastifyError('OpenAI API key not set');
      return;
    }

    createDocumentsFromText({
      text: initialText,
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    }).then(async (res) => {
      const vectorStore = await initializeMemoryVectorStore({ docs: res });
      setVectorStore(vectorStore);
    });
  }, [openAIApiKey, initialText, chunkSize, chunkOverlap]);

  const addDocuments = (docs: Document[]) => {
    if (!vectorstore) return;
    addDocumentsToMemoryVectorStore(vectorstore, docs);
  };

  const filterAndCombineContent = (data: Array<[Document, number]>, threshold: number): string => {
    // Filter out responses with a similarity score below the threshold
    const filteredData = data.filter(([, similarityScore]) => similarityScore >= threshold);

    // Map through the filtered data and extract the pageContent
    const pageContents = filteredData.map(([document]) => document.pageContent);

    // Combine the page contents into a single string
    const combinedContent = pageContents.join('\n\n');

    return combinedContent;
  };

  const similaritySearchWithScore = async (query: string, k = 4, filter?: any) => {
    if (!vectorstore) return [];
    return await similaritySearchWithScoreInMemoryVectorStore(vectorstore, query, k, filter);
  };

  return {
    vectorstore,
    addDocuments,
    filterAndCombineContent,
    similaritySearchWithScore,
  };
};
