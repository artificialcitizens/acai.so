// db.ts
import Dexie, { Table } from 'dexie';
import { ACDoc, Workspace, AgentWorkspace } from './src/state';

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
  workspaces!: Table<Workspace>;
  docs!: Table<ACDoc>;
  agents!: Table<AgentWorkspace>;

  constructor() {
    super('acaiDb');
    this.version(1).stores({
      knowledge:
        '++id, workspaceId, file, fileType, fullText, createdAt, lastModified, memoryVectors, summary, title, tags',
    });
    this.version(2).stores({
      workspaces: '++id, name, createdAt, lastUpdated, private',
      docs: '++id, workspaceId, title, filetype, content, isContext, systemNote, createdAt, lastUpdated, autoSave, canEdit',
    });
    this.version(3).stores({
      agents:
        '++id, loading, agentMode, agentName, workspaceId, customPrompt, recentChatHistory, openAIChatModel, returnRagResults, customAgentVectorSearch, agentLogs, memory, agentTools',
    });

    this.knowledge = this.table('knowledge');
    this.workspaces = this.table('workspaces');
    this.agents = this.table('agents');
    this.docs = this.table('docs');
  }
}

export const db = new AcaiDexie();

db.open().catch((err) => {
  console.error(err.stack || err);
});
