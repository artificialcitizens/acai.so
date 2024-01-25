import { useState } from 'react';
import axios from 'axios';
import { toastifyError, toastifyInfo } from '../Toast';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { v4 as uuid } from 'uuid';
import { getToken } from '../../utils/config';

export interface CrewLog {
  // crewId
  id: string;
  timestamp: string;
  task: string;
  agent: string;
  output: string;
  context: string;
  tools: string;
}

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
  files: string[]; // probably just do a join table for files
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
  example?: string;
  metadata: Record<string, string | number | JSON>;
  logs?: CrewLog[];
  process: string;
}

export const newAgent = ({ id, llm }: { id: string; llm: string }): Agent => {
  return {
    id,
    role: 'New Agent',
    name: '',
    goal: 'Help the user test the system',
    backstory: '',
    tools: [],
    llm: llm,
    verbose: false,
    allow_delegation: false,
    files: [],
    metadata: {},
  };
};

export const newTask = ({
  id,
  agent,
}: {
  id: string;
  agent?: string;
}): Task => {
  return {
    id,
    name: 'New Task',
    description: 'This is a test, return "bar"',
    agent: agent || 'New Agent',
    tools: [],
    files: [],
    metadata: {},
  };
};

// returns {response: string, status: string}
const runCrewAi = async (
  crew: Crew,
): Promise<{ response: string; status: string }> => {
  const crewServerURL =
    getToken('CUSTOM_SERVER_URL') || import.meta.env.VITE_CREW_SERVER_URL;
  const response = await axios.post(`${crewServerURL}/run-crew`, crew);
  const data = await response.data;
  return data;
};

const fetchTools = async (): Promise<string[]> => {
  const crewServerURL =
    getToken('CUSTOM_SERVER_URL') || import.meta.env.VITE_CREW_SERVER_URL;
  const response = await axios.get(`${crewServerURL}/tools`);
  const data = await response.data;
  return data.response;
};

const fetchModels = async (): Promise<string[]> => {
  const crewServerURL =
    getToken('CUSTOM_SERVER_URL') || import.meta.env.VITE_CREW_SERVER_URL;
  const response = await axios.get(`${crewServerURL}/models`);
  const data = await response.data;
  return data.response;
};

let toolsCache: string[];
let modelsCache: string[];

fetchTools().then((tools) => {
  toolsCache = tools;
});

fetchModels().then((models) => {
  modelsCache = models;
});
// manages the crew and the tasks
export const useCrewAi = () => {
  const crews = useLiveQuery(() => db.crews.toArray());
  const [output, setOutput] = useState<string>('');
  const [tools] = useState<string[]>(toolsCache || []);
  const [models] = useState<string[]>(modelsCache || []);

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
      agents: [
        newAgent({
          id: uuid(),
          llm: models[0],
        }),
      ],
      tasks: [],
      files: [],
      logs: [],
      metadata: {},
      example: '',
      process: 'sequential',
      // Add other necessary properties here
    };

    await db.crews.put(newCrew);

    return newCrew;
  };

  const saveCrew = async (crew: Crew) => {
    crew.lastUpdated = new Date().toISOString();
    validateCrew(crew);
    try {
      await db.crews.put(crew);
      return crew;
    } catch (error: any) {
      toastifyError(
        `Crew ${crew.name} failed to save or update: ${error.message}`,
      );
    }
  };

  const deleteCrew = async (crewId: string) => {
    try {
      await db.crews.delete(crewId);
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
    const crewClone = JSON.parse(JSON.stringify(crew));
    crewClone.tasks.push(task);
    const savedCrew = await saveCrew(crewClone);
    return savedCrew;
  };

  // Remove a task from a crew
  const removeTaskFromCrew = async (crewId: string, taskId: string) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const crewClone = JSON.parse(JSON.stringify(crew));
    crewClone.tasks = crew.tasks.filter((task) => task.id !== taskId);
    const savedCrew = await saveCrew(crewClone);
    return savedCrew;
  };

  // Add a new agent to a crew
  const addAgentToCrew = async (crewId: string, agent: Agent) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const crewClone = JSON.parse(JSON.stringify(crew));
    crewClone.agents.push(agent);
    const savedCrew = await saveCrew(crewClone);
    return savedCrew;
  };

  // Remove an agent from a crew
  const removeAgentFromCrew = async (crewId: string, agentId: string) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const crewClone = JSON.parse(JSON.stringify(crew));
    crewClone.agents = crew.agents.filter((agent) => agent.id !== agentId);
    const savedCrew = await saveCrew(crewClone);
    return savedCrew;
  };

  // Update a task in a crew
  const updateTaskInCrew = async (
    crewId: string,
    updatedTask: Task,
  ): Promise<Crew | undefined> => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const taskIndex = crew.tasks.findIndex(
      (task) => task.id === updatedTask.id,
    );
    const crewClone = JSON.parse(JSON.stringify(crew));
    crewClone.tasks[taskIndex] = updatedTask;
    await db.crews.put(crewClone);
  };

  // Update an agent in a crew
  const updateAgentInCrew = async (crewId: string, updatedAgent: Agent) => {
    const crew = await readCrew(crewId);
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    const crewClone = JSON.parse(JSON.stringify(crew));
    const agentIndex = crew.agents.findIndex(
      (agent) => agent.id === updatedAgent.id,
    );
    if (agentIndex !== -1) {
      crewClone.agents[agentIndex] = updatedAgent;
      saveCrew(crewClone);
    } else {
      toastifyError(
        `Agent ${updatedAgent.name} not found in crew ${crew.name}`,
      );
    }
  };

  const addLogsToCrew = async (log: CrewLog) => {
    if (!log) {
      toastifyError(`No logs to add`);
      return;
    }
    const crew = await readCrew(log.id);
    if (!crew) {
      toastifyError(`Crew ${log.id} not found`);
      return;
    }
    const crewClone = JSON.parse(JSON.stringify(crew));
    if (!crewClone.logs) crewClone.logs = [];
    crewClone.logs.push(log);
    const savedCrew = await saveCrew(crewClone);
    if (!savedCrew) {
      toastifyError(`Failed to save crew ${log.id}`);
      return;
    }
  };

  const validateAgents = (agents: Agent[]) => {
    return agents.every((agent) => agent.llm && agent.role && agent.goal);
  };

  const validateTasks = (tasks: Task[]) => {
    return tasks.every((task) => task.name && task.description && task.agent);
  };

  const validateCrew = (crew: Crew) => {
    // Check if all agents have llm, role, and description filled out
    if (!validateAgents(crew.agents)) {
      toastifyError(
        'All agents do not have llm, role, and description filled out',
      );
      throw new Error(
        'All agents do not have llm, role, and description filled out',
      );
    }

    // Check if all tasks have name, description, and agent filled out
    if (!validateTasks(crew.tasks)) {
      toastifyError(
        'All tasks do not have name, description, and agent filled out',
      );
      throw new Error(
        'All tasks do not have name, description, and agent filled out',
      );
    }
  };

  const test = async (crewId: string) => {
    const crew = crews?.filter((crew) => crew.id === crewId)[0];
    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return;
    }
    try {
      validateCrew(crew);
      toastifyInfo(`Running Crew ${crew.name}`);
      const result = await runCrewAi(crew);
      setOutput(result.response);
      console.log(result.response);
      const crewClone = JSON.parse(JSON.stringify(crew));
      crewClone.example = result.response;
      await saveCrew(crewClone);
    } catch (e: any) {
      toastifyError(e.message);
    }
  };

  /**
   * Adds a task to the beginning|end of the task list
   */
  const addTaskAndRun = async ({
    crewId,
    task,
  }: {
    crewId: string;
    task: Task;
  }) => {
    if (!task) {
      toastifyError(`Task not found`);
      return {
        response: 'Task not found',
        status: 'error',
      };
    }

    const crew = crews?.filter((crew) => crew.id === crewId)[0];

    if (!crew) {
      toastifyError(`Crew ${crewId} not found`);
      return {
        response: `Crew ${crewId} not found`,
        status: 'error',
      };
    }
    // cheap deep copy
    const tempCrew: Crew = JSON.parse(JSON.stringify(crew));
    tempCrew.tasks.unshift(task);

    const response = runCrewAi(tempCrew);

    return response;
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
    addLogsToCrew,
    test,
    output,
    getFiles,
    validateAgents,
    validateTasks,
    addTaskAndRun,
  };
};
