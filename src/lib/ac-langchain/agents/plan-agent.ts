import { Calculator } from 'langchain/tools/calculator';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PlanAndExecuteAgentExecutor } from 'langchain/experimental/plan_and_execute';
import { GoogleCustomSearch, Tool, DynamicTool } from 'langchain/tools';

import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getToken } from '../../../utils/config';

const model = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.OPENAI_KEY,
  modelName: 'gpt-3.5-turbo-16k',
  verbose: false,
});

const tools = [
  new Calculator(),
  new GoogleCustomSearch({
    googleCSEId: getToken('GOOGLE_CSE_ID') || import.meta.env.GOOGLE_CSE_ID,
    apiKey: getToken('GOOGLE_API_KEY') || import.meta.env.GOOGLE_API_KEY,
  }),
];
const executor = PlanAndExecuteAgentExecutor.fromLLMAndTools({
  llm: model,
  tools,
});

export const queryPlanAgent = async (input: string) => {
  const res = await executor.call({ input });
  return res;
};
