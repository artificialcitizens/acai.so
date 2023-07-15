import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { TimeWeightedVectorStoreRetriever } from 'langchain/retrievers/time_weighted';
import { GenerativeAgentMemory, GenerativeAgent } from 'langchain/experimental/generative_agents';
import dotenv from 'dotenv';
dotenv.config();
const createNewMemoryRetriever = async () => {
  // Create a new, demo in-memory vector store retriever unique to the agent.
  // Better results can be achieved with a more sophisticatd vector store.
  const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  const retriever = new TimeWeightedVectorStoreRetriever({
    vectorStore,
    otherScoreKeys: ['importance'],
    k: 15,
  });
  return retriever;
};

const llm = new OpenAI({
  temperature: 0.6,
  maxTokens: 1500,
});

const createAgentMemory = async () => {
  // ignore ts
  // fix this
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const memory = new GenerativeAgentMemory(llm, await createNewMemoryRetriever(), { reflectionThreshold: 8 });
  return memory;
};

export const loadAgent = async (initialObservations: string[]): Promise<GenerativeAgent> => {
  // console.log('Loading agent...');
  const agentMemory = await createAgentMemory();
  // const { name, createdAt, traits, status, recentObservations } = agents.data.find((agent) => agent.id === id);
  // const age = new Date().getFullYear() - new Date(createdAt).getFullYear();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const initializedAgent = new GenerativeAgent(llm, agentMemory, {
    name: 'Josh',
    age: 38,
    traits: 'friendly, loves ai, loves to code',
    status: 'writing a blogpost about prompting AI and context',
    verbose: true,
  });
  await addObservations(initialObservations, initializedAgent);
  return initializedAgent;
};

export const addObservations = async (observations: string[], agent: GenerativeAgent) => {
  observations.forEach((observation) => {
    agent.memory.addMemory(observation, new Date());
  });
};

export const interviewAgent = async (message: string, agent: GenerativeAgent) => {
  // Simple wrapper helping the user interact with the agent
  const response = await agent.generateDialogueResponse(message);
  return response[1];
};

// export const chain = (
//   agent: GenerativeAgent,
//   prompt: string
// ): Promise<LLMChain<string>> => {
//   return agent.chain(prompt);
// };

export const computeAgentSummary = (agent: GenerativeAgent): Promise<string> => {
  return agent.computeAgentSummary();
};

export const generateDialogueResponse = (
  agent: GenerativeAgent,
  observation: string,
  now?: Date,
): Promise<[boolean, string]> => {
  return agent.generateDialogueResponse(observation, now);
};

export const generateReaction = (
  agent: GenerativeAgent,
  observation: string,
  now?: Date,
): Promise<[boolean, string]> => {
  return agent.generateReaction(observation, now);
};

export const getEntityAction = (agent: GenerativeAgent, observation: string, entityName: string): Promise<string> => {
  return agent.getEntityAction(observation, entityName);
};

export const getEntityFromObservations = (agent: GenerativeAgent, observation: string): Promise<string> => {
  return agent.getEntityFromObservations(observation);
};

export const getFullHeader = (agent: GenerativeAgent, config: object = {}): string => {
  return agent.getFullHeader(config);
};

export const getSummary = (agent: GenerativeAgent, config: object = {}): Promise<string> => {
  return agent.getSummary(config);
};

export const parseList = (agent: GenerativeAgent, text: string): string[] => {
  return agent.parseList(text);
};

export const summarizeRelatedMemories = (agent: GenerativeAgent, observation: string): Promise<string> => {
  return agent.summarizeRelatedMemories(observation);
};

export type CallFunctionInput =
  | 'computeAgentSummary'
  | 'generateDialogueResponse'
  | 'generateReaction'
  | 'getEntityAction'
  | 'getEntityFromObservations'
  | 'getFullHeader'
  | 'getSummary'
  | 'parseList'
  | 'summarizeRelatedMemories';

export const callAgentFunction = (params: {
  agent: GenerativeAgent;
  input: CallFunctionInput;
  date: Date;
  observation?: string;
  entityName?: string;
}) => {
  const { agent, input, entityName, observation, date } = params;

  switch (input) {
    // case "chain":
    //   return chain(agent, input);
    case "computeAgentSummary":
      return computeAgentSummary(agent);
    case "generateDialogueResponse":
      return generateDialogueResponse(agent, observation, date);
    case "generateReaction":
      return generateReaction(agent, observation, date);
    case "getEntityAction":
      return getEntityAction(agent, observation, entityName);
    case "getEntityFromObservations":
      return getEntityFromObservations(agent, observation);
    case "getFullHeader":
      return getFullHeader(agent);
    case "getSummary":
      return getSummary(agent);
    case "parseList":
      return parseList(agent, observation);
    case "summarizeRelatedMemories":
      return summarizeRelatedMemories(agent, observation);
    default:
      throw new Error(`Invalid input: ${input}`);
  }
};
