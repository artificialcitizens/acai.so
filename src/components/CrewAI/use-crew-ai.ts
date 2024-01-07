import { useState } from 'react';

export interface Llm {
  base_url: string;
  model_name: string;
  openai_api_key: string;
}

export interface Agent {
  role: string;
  goal: string;
  verbose: boolean;
  backstory?: string;
  allow_delegation?: boolean;
  tools?: string[];
  llm: Llm;
}

export interface Task {
  description: string;
  agent: string;
  tools?: string[];
}

export interface Crew {
  agents: Agent[];
  tasks: Task[];
  process: string;
}

export interface Config {
  agents: Agent[];
  tasks: Task[];
  process: string;
}

// manages the crew and the tasks
export const useCrewAi = () => {
  const [config, setConfig] = useState<Crew | null>(null);
  // Add these functions to your useCrewAi hook
  const getTasks = () => {
    if (config) {
      return config.tasks;
    }
    return [];
  };

  // Add this function to your useCrewAi hook
  const getAgents = () => {
    if (config) {
      return config.agents;
    }
    return [];
  };

  const updateConfig = (newConfig: Crew) => {
    setConfig(newConfig);
  };
  return { config, updateConfig, getAgents, getTasks };
};
