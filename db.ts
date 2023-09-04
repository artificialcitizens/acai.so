// db.ts
import Dexie, { Table } from 'dexie';

export interface Embeddings {
  id: number;
  workspaceId: string;
  embeddings: string;
  text: string;
  meta: Record<string, unknown>;
}

export class AcaiDexie extends Dexie {
  // 'embeddings' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  embeddings!: Table<Embeddings>;

  constructor() {
    super('acaiDb');
    this.version(1).stores({
      embeddings: '++id, workspaceId, embeddings, text, meta',
    });
  }
}

export const db = new AcaiDexie();
