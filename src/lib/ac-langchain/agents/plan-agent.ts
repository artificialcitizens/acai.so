import { Calculator } from 'langchain/tools/calculator';
import { PlanAndExecuteAgentExecutor } from 'langchain/experimental/plan_and_execute';
import { GoogleCustomSearch, Tool, DynamicTool } from 'langchain/tools';

import { getToken } from '../../../utils/config';
import { handleAcaiChat } from '../models/chat';

const { chat: model } = handleAcaiChat({
  temperature: 0,
  modelName: 'gpt-3.5-turbo-16k',
  verbose: false,
});

export const queryPlanAgent = async (input: string) => {
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
  const res = await executor.call({ input });
  return res;
};
