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
  memoryVectors: AcaiMemoryVector[];
}

export class AcaiDexie extends Dexie {
  // 'embeddings' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  memoryVectors!: Table<Knowledge>;

  constructor() {
    super('acaiDb');
    this.version(1).stores({
      memoryVectors: '++id, workspaceId, memoryVectors',
    });
  }
}

export const db = new AcaiDexie();
