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

function getCanonicalComparableSchema(db: Dexie) {
  return JSON.stringify(
    db.tables
      .map(({ name, schema }) => ({
        name,
        schema: [
          schema.primKey.src,
          ...schema.indexes.map((idx) => idx.src).sort(),
        ].join(','),
      }))
      .sort((a, b) => (a.name < b.name ? 1 : -1)),
  );
}

async function isDeclaredSchemaSameAsInstalled(db: Dexie) {
  const declaredSchema = getCanonicalComparableSchema(db);
  const dynDb = await new Dexie(db.name).open();
  const installedSchema = getCanonicalComparableSchema(dynDb);
  return declaredSchema === installedSchema;
}

export class AcaiDexie extends Dexie {
  // 'embeddings' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  knowledge!: Table<Knowledge>;
  workspaces!: Table<Workspace>;
  docs!: Table<ACDoc>;
  agents!: Table<AgentWorkspace>;
  files!: Table<ACFile>;

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

    this.knowledge = this.table('knowledge');
    this.workspaces = this.table('workspaces');
    this.agents = this.table('agents');
    this.docs = this.table('docs');
    this.files = this.table('files');
  }
}

export const db = new AcaiDexie();
indexedDB
  .databases()
  .then((databases) => {
    const dbExists = databases.some((dbInfo) => dbInfo.name === db.name);
    if (dbExists) {
      isDeclaredSchemaSameAsInstalled(db).then((same) => {
        if (!same) {
          console.log('Schema mismatch, deleting database');
          // delete db in indexedDB
          const req = indexedDB.deleteDatabase(db.name);
          req.onsuccess = () => {
            console.log('Deleted database successfully');
            db.open().catch((err) => {
              console.error(err.stack || err);
            });
          };
        } else {
          db.open().catch((err) => {
            console.error(err.stack || err);
          });
        }
      });
    } else {
      console.log('Database does not exist.');
      db.open().catch((err) => {
        console.error(err.stack || err);
      });
      window.location.reload();
    }
  })
  .catch((err) => {
    console.error('Error checking for existing databases: ', err);
  });
