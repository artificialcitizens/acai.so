import { useState } from 'react';
import { exampleData } from './example-data';
import axios from 'axios';
import { toastifyError, toastifyInfo } from '../Toast';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
export interface File {
  id: string;
  name: string;
  type: string;
  data: string;

  metadata: Record<string, string | number | JSON>;
}

export interface Llm {
  base_url: string;
  model_name: string;
  openai_api_key: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string | number | JSON>;
}
export interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  verbose: boolean;
  backstory: string;
  allow_delegation: boolean;
  tools: string[];
  llm: Llm;
  /**
   * List of file IDs that are used by this agent
   */
  files: string[];
  metadata: Record<string, string | number | JSON>;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  agent: string;
  tools: string[];
  /**
   * List of file IDs that are used by this task
   */
  files: string[];
  metadata: Record<string, string | number | JSON>;
}

export interface Crew {
  id: string;
  createdAt: string;
  lastUpdated: string;
  name: string;
  agents: Agent[];
  tasks: Task[];
  files: File[];
  metadata: Record<string, string | number | JSON>;
  process: string;
}

const runCrewAi = async (crew: Crew) => {
  const response = await axios.post('http://localhost:5050/run-crew', crew);
  const data = await response.data;
  return data;
};

// manages the crew and the tasks
export const useCrewAi = () => {
  const crews = useLiveQuery(() => db.crews.toArray());
  const [output, setOutput] = useState<string>('');
  const saveCrew = async (crew: Crew) => {
    try {
      const id = await db.crews.put(crew);
      toastifyInfo(`Crew ${crew.name} saved or updated with id ${id}`);
    } catch (error: any) {
      toastifyError(
        `Crew ${crew.name} failed to save or update: ${error.message}`,
      );
    }
  };

  const deleteCrew = async (crewId: string) => {
    try {
      await db.crews.delete(crewId);
      toastifyInfo(`Crew with id ${crewId} deleted successfully`);
    } catch (error: any) {
      toastifyError(
        `Failed to delete crew with id ${crewId}: ${error.message}`,
      );
    }
  };

  const test = async (crewId: string) => {
    const crew = crews?.filter((crew) => crew.id === crewId)[0];
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    toastifyInfo(`Running Crew ${crew.name}...}`);
    try {
      const result = await runCrewAi(crew);
      setOutput(result.response);
    } catch (e: any) {
      setOutput(e.message);
    }
  };

  return {
    crews,
    saveCrew,
    deleteCrew,
    // addAgent,
    // addTask,
    // deleteAgent,
    // deleteTask,
    // updateAgent,
    // updateTask,
    // addFile,
    // deleteFile,
    test,
    output,
  };
};
