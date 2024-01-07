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

  const updateConfig = async (crew: Crew) => {
    await db.crews.add(crew);
    try {
      const id = await db.crews.add(crew);
      toastifyInfo(`Crew ${crew.name} saved with id ${id}`);
    } catch (error: any) {
      toastifyError(`Crew ${crew.name} failed to save: ${error.message}`);
    }
  };
  // const addAgent = (agent: Agent) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     agents: [...prevConfig.agents, agent],
  //   }));
  // };

  // const addTask = (task: Task) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     tasks: [...prevConfig.tasks, task],
  //   }));
  // };

  // const deleteAgent = (agentId: string) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     agents: prevConfig.agents.filter((agent) => agent.id !== agentId),
  //   }));
  // };

  // const deleteTask = (taskId: string) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     tasks: prevConfig.tasks.filter((task) => task.id !== taskId),
  //   }));
  // };

  // const updateAgent = (updatedAgent: Agent) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     agents: prevConfig.agents.map((agent) =>
  //       agent.id === updatedAgent.id ? updatedAgent : agent,
  //     ),
  //   }));
  // };

  // const updateTask = (updatedTask: Task) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     tasks: prevConfig.tasks.map((task) =>
  //       task.id === updatedTask.id ? updatedTask : task,
  //     ),
  //   }));
  // };

  // const addFile = (file: File) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     files: [...(prevConfig.files || []), file], // Add the new file to the existing files
  //   }));
  // };

  // const deleteFile = (fileId: string) => {
  //   setCrew((prevConfig) => ({
  //     ...prevConfig,
  //     files: prevConfig.files?.filter((file) => file.id !== fileId), // Remove the file with the given id
  //   }));
  // };

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
    updateConfig,
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
