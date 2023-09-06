import React from 'react';
import { Document } from 'langchain/document';
import { AcaiMemoryVector } from '../../db';

type VectorStoreContextType = {
  vectorstore: any; // Replace any with the actual type if available
  addDocuments: (docs: any[]) => void; // Replace any with the actual type if available
  addText: (text: string) => Promise<AcaiMemoryVector[] | undefined>;
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

export const VectorStoreContext =
  React.createContext<VectorStoreContextType | null>(null);
