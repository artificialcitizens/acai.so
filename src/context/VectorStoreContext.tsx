import React from 'react';
import { VectorStoreContextType } from '../hooks/use-memory-vectorstore';

export const VectorStoreContext =
  React.createContext<VectorStoreContextType | null>(null);
