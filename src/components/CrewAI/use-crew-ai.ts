import { useEffect, useState } from 'react';
import axios from 'axios';
import { toastifyError, toastifyInfo } from '../Toast';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { v4 as uuid } from 'uuid';

export interface File {
  id: string;
  name: string;
  type: string;
  data: string;

  metadata: Record<string, string | number | JSON>;
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
  backstory: string;
  tools: string[];
  llm: string;
  /**
   * List of file IDs that are used by this agent
   */
  files: string[];
  allow_delegation: boolean;
  verbose: boolean;
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

export const newAgent = (id: string): Agent => {
  return {
    id,
    role: 'New Agent',
    name: '',
    goal: '',
    backstory: '',
    tools: [],
    llm: '',
    verbose: false,
    allow_delegation: false,
    files: [],
    metadata: {},
  };
};

export const newTask = (id: string): Task => {
  return {
    id,
    name: 'New Task',
    description: '',
    agent: '',
    tools: [],
    files: [],
    metadata: {},
  };
};

const crewServerURL = import.meta.env.VITE_CREW_SERVER_URL;
const toolsCache: Record<string, Tool> = {};
const modelsCache: Record<string, Tool> = {};

const runCrewAi = async (crew: Crew) => {
  const response = await axios.post(`${crewServerURL}/run-crew`, crew);
  const data = await response.data;
  return data;
};

const fetchTools = async () => {
  const response = await axios.get(`${crewServerURL}/tools`);
  const data = await response.data;
  return data;
};

const fetchModels = async () => {
  const response = await axios.get(`${crewServerURL}/models`);
  const data = await response.data;
  return data;
};

// manages the crew and the tasks
export const useCrewAi = () => {
  const crews = useLiveQuery(() => db.crews.toArray());
  const [output, setOutput] = useState<string>('');
  const [tools, setTools] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    const getTools = async () => {
      const result = await fetchTools();
      setTools(result.response);
    };
    const getModels = async () => {
      const result = await fetchModels();

      setModels(result.response);
    };

    getTools();
    getModels();
  }, []);

  const newCrew = async () => {
    if (!crews) {
      toastifyError('Failed to create new crew');
      return;
    }
    const newCrew: Crew = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      name: 'New Crew',
      agents: [newAgent(uuid())],
      tasks: [newTask(uuid())],
      files: [],
      metadata: {},
      process: '',
      // Add other necessary properties here
    };

    crews.push(newCrew);
    await db.crews.put(newCrew);
    toastifyInfo(`Crew ${newCrew.name} added`);

    return newCrew;
  };

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

  const readCrew = async (crewId: string) => {
    try {
      const crew = await db.crews.get(crewId);
      return crew;
    } catch (error: any) {
      toastifyError(`Failed to get crew: ${error.message}`);
    }
  };
  // Add a new task to a crew
  const addTaskToCrew = async (crewId: string, task: Task) => {
    const crew = await readCrew(crewId);

    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    crew.tasks.push(task);
    await saveCrew(crew);
  };

  // Remove a task from a crew
  const removeTaskFromCrew = async (crewId: string, taskId: string) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    crew.tasks = crew.tasks.filter((task) => task.id !== taskId);
    await saveCrew(crew);
  };

  // Add a new agent to a crew
  const addAgentToCrew = async (crewId: string, agent: Agent) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    crew.agents.push(agent);
    await saveCrew(crew);
  };

  // Remove an agent from a crew
  const removeAgentFromCrew = async (crewId: string, agentId: string) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    crew.agents = crew.agents.filter((agent) => agent.id !== agentId);
    await saveCrew(crew);
  };

  // Update a task in a crew
  const updateTaskInCrew = async (crewId: string, updatedTask: Task) => {
    const crew = await db.crews.get(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const taskIndex = crew.tasks.findIndex(
      (task) => task.id === updatedTask.id,
    );
    if (taskIndex !== -1) {
      crew.tasks[taskIndex] = updatedTask;
      await db.crews.put(crew);
      toastifyInfo(`Task ${updatedTask.name} updated in crew ${crew.name}`);
    } else {
      toastifyError(`Task ${updatedTask.name} not found in crew ${crew.name}`);
    }
  };

  // Update an agent in a crew
  const updateAgentInCrew = async (crewId: string, updatedAgent: Agent) => {
    const crew = await db.crews.get(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const agentIndex = crew.agents.findIndex(
      (agent) => agent.id === updatedAgent.id,
    );
    if (agentIndex !== -1) {
      crew.agents[agentIndex] = updatedAgent;
      await db.crews.put(crew);
      toastifyInfo(`Agent ${updatedAgent.name} updated in crew ${crew.name}`);
    } else {
      toastifyError(
        `Agent ${updatedAgent.name} not found in crew ${crew.name}`,
      );
    }
  };

  const test = async (crewId: string) => {
    const crew = crews?.filter((crew) => crew.id === crewId)[0];
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    toastifyInfo(`Running Crew ${crew.name}`);
    try {
      const result = await runCrewAi(crew);
      setOutput(result.response);
    } catch (e: any) {
      setOutput(e.message);
    }
  };

  const getFiles = async (crewId: string) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    return crew.files;
  };

  return {
    crews,
    tools,
    models,
    newCrew,
    saveCrew,
    deleteCrew,
    addTaskToCrew,
    removeTaskFromCrew,
    addAgentToCrew,
    removeAgentFromCrew,
    updateAgentInCrew,
    updateTaskInCrew,
    test,
    output,
    getFiles,
  };
};
