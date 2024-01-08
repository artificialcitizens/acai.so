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
  id: '1',
  createdAt: '2021-01-01',
  lastUpdated: '2021-01-01',
  name: 'Knapsack',
  agents: [
    {
      id: '1',
      name: 'Grant',
      role: 'Product Manager',
      goal: 'Orchestrate the team to create the design system, based on the clients needs. You will be provided the goal for the sprint and you will need to create a task list for the team and assign the tasks to the team members.',
      backstory:
        'You manage the design system for Knapsack.cloud, It is called Toby. You run a small team of highly intelligent designers. You are responsible for the overall success of the design system. Provide the members of your team with a task list based off of the need of the current sprint.',
      llm: {
        base_url: 'http://192.168.4.192:8080/v1',
        model_name: 'open-hermes-2.5',
        openai_api_key: 'sk-xxx',
      },
      tools: ['DuckDuckGoSearch'],
      files: ['1'],
      metadata: {},
      verbose: true,
      allow_delegation: true,
    },
    {
      id: '2',
      role: 'Senior Research',
      name: 'Jim',
      goal: 'Research the best way to create a design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens',
      backstory:
        'You are a Senior Research Analyst at a leading tech think tank. Your expertise lies in identifying emerging trends and technologies in AI and design systems. You have a knack for dissecting complex data and presenting actionable insights.',
      tools: ['DuckDuckGoSearch'],
      llm: {
        base_url: 'http://192.168.4.192:8080/v1',
        model_name: 'open-hermes-2.5',
        openai_api_key: 'sk-xxx',
      },
      files: ['1'],
      metadata: {},
      verbose: true,
      allow_delegation: false,
    },
    {
      id: '3',
      name: 'Matt',
      role: 'Designer',
      goal: 'Create a design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens',
      backstory:
        'A creative soul who translates complex tech jargon into beautiful designs for the masses, you write using simple words in a friendly and inviting tone that does not sounds like AI.',
      llm: {
        base_url: 'http://192.168.4.192:8080/v1',
        model_name: 'open-hermes-2.5',
        openai_api_key: 'sk-xxx',
      },
      tools: [],
      files: ['1'],
      metadata: {},
      verbose: true,
      allow_delegation: true,
    },
  ],
  tasks: [
    {
      id: '1',
      name: 'AI Integration',
      description:
        'We need to create a integrate AI into our design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens. You can use your team to help you.',
      agent: 'Product Manager',
      tools: ['DuckDuckGoSearch'],
      files: ['1'],
      metadata: {
        dueDate: '2021-01-01',
      },
    },
    {
      id: '2',
      name: 'AI Research',
      description:
        'Conduct a comprehensive analysis of the latest advancements in AI in 2024. Identify key trends, breakthrough technologies, and potential industry impacts. Compile your findings in a detailed report. Your final answer MUST be a full analysis report',
      agent: 'Senior Research',
      files: ['1'],
      tools: [],
      metadata: {
        dueDate: '2021-01-01',
      },
    },
    {
      id: '3',
      name: 'Color Tokens',
      description:
        'Lookup colors for knapsack.cloud. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.',
      agent: 'Designer',
      tools: [],
      files: ['1'],
      metadata: {
        dueDate: '2021-01-01',
      },
    },
    {
      id: '4',
      name: 'Create Color Tokens',
      description:
        'Create a list of color tokens to represent our design system Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.',
      agent: 'Designer',
      tools: [],
      files: ['1'],
      metadata: {
        dueDate: '2021-01-01',
      },
    },
  ],
  files: [
    {
      id: '1',
      name: 'Toby Design System',
      type: 'JSON',
      data: '',
      metadata: {},
    },
  ],
  metadata: {},
  process: 'sequential',
};
