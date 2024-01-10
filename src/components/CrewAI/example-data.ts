import { Agent, Crew, File, Task, Tool } from './use-crew-ai';

export const exampleTools: Tool[] = [
  {
    id: 'DuckDuckGoSearch',
    name: 'DuckDuckGo Search',
    description: 'Search the web using DuckDuckGo',
    metadata: {},
  },
  {
    id: 'Embed',
    name: 'Embed',
    description: 'Embed a file into a task',
    metadata: {},
  },
  {
    id: 'ImageGenerator',
    name: 'Image Generator',
    description: 'Generate an image',
    metadata: {},
  },
  {
    id: 'CheckEmail',
    name: 'Check Email',
    description: 'Check Email',
    metadata: {},
  },
  {
    id: 'Text',
    name: 'Text',
    description: 'Text',
    metadata: {},
  },
];

/// create type from example tools array
export type ExampleTools = (typeof exampleTools)[number];

export const exampleData: Crew = {
  id: '57e106f8-7132-47bb-a50f-d5b30b984f87',
  createdAt: '2024-01-10T01:28:07.184Z',
  lastUpdated: '2024-01-10T01:28:07.184Z',
  name: 'New Crew',
  agents: [
    {
      id: '3dbceae4-35df-4559-86fd-17bf1ac50356',
      role: 'New Agent',
      name: '',
      goal: 'test the app',
      backstory: '',
      tools: [],
      llm: 'open-hermes-2.5',
      verbose: false,
      allow_delegation: false,
      files: [],
      metadata: {},
    },
  ],
  tasks: [
    {
      id: '08f8d158-e0e9-4aa0-9e4f-c445eafb47f3',
      name: 'New Task',
      description: "This is a test, return 'bar'",
      agent: 'New Agent',
      tools: [],
      files: [],
      metadata: {},
    },
  ],
  files: [],
  metadata: {},
  process: 'sequential',
};
