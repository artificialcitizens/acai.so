// db.ts
import Dexie, { Table } from 'dexie';

export interface AcaiMemoryVector {
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}
export interface Knowledge {
  id: string;
  workspaceId: string;
  file: File;
  fileType: 'pdf' | 'md' | 'txt';
  fullText: string;
  createdAt: string;
  lastModified: string;
  memoryVectors: AcaiMemoryVector[];
  summary?: string;
  title?: string;
  tags?: string[];
}

export class AcaiDexie extends Dexie {
  // 'embeddings' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  knowledge!: Table<Knowledge>;

  constructor() {
    super('acaiDb');
    this.version(1).stores({
      knowledge:
        '++id, workspaceId, file, fileType, fullText, createdAt, lastModified, memoryVectors, summary, title, tags',
    });
  }
}

export const db = new AcaiDexie();
