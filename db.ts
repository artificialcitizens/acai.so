// db.ts
import Dexie, { Table } from 'dexie';
import { ACDoc, Workspace, AgentWorkspace } from './src/state';
import { Crew } from './src/components/CrewAI/use-crew-ai';

export interface AcaiMemoryVector {
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}
export interface Knowledge {
  id: string;
  workspaceId: string;
  fileId: string;
  fileName: string;
  fileType: 'pdf' | 'md' | 'txt';
  fullText: string;
  createdAt: string;
  lastModified: string;
  memoryVectors: AcaiMemoryVector[];
  summary?: string;
  title?: string;
  tags?: string[];
}

export interface ACFile {
  id: string;
  workspaceId: string;
  file: File;
  fileType: 'pdf' | 'md' | 'txt' | 'html';
  fileName: string;
  createdAt: string;
  lastModified: string;
}

export class AcaiDexie extends Dexie {
  // 'embeddings' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  knowledge!: Table<Knowledge>;
  workspaces!: Table<Workspace>;
  docs!: Table<ACDoc>;
  agents!: Table<AgentWorkspace>;
  files!: Table<ACFile>;
  crews!: Table<Crew>;

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
      files: '++id, workspaceId, file, createdAt, lastModified',
    });
    this.version(4).stores({
      crews:
        '++id, createdAt, lastUpdated, name, agents, tasks, files, metadata, process',
    });

    this.knowledge = this.table('knowledge');
    this.workspaces = this.table('workspaces');
    this.agents = this.table('agents');
    this.docs = this.table('docs');
    this.files = this.table('files');
    this.crews = this.table('crews');
  }
}

export const db = new AcaiDexie();

db.open().catch((err) => {
  console.error(err.stack || err);
});
