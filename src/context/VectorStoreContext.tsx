import React from 'react';
import { Document } from 'langchain/document';
import { AcaiMemoryVector } from '../../db';
import { VectorStoreContextType } from '../hooks/use-memory-vectorstore';

export const VectorStoreContext =
  React.createContext<VectorStoreContextType | null>(null);
