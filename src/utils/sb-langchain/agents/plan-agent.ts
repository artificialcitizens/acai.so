import { Calculator } from "langchain/tools/calculator";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { GoogleCustomSearch, Tool, DynamicTool } from "langchain/tools";
import { config } from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
config();

const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-3.5-turbo-16k",
  verbose: true,
});

const tools = [new Calculator(), new GoogleCustomSearch()];
const executor = PlanAndExecuteAgentExecutor.fromLLMAndTools({
  llm: model,
  tools,
});

export const query = async (input: string) => {
  const res = await executor.call({ input });
  return res;
};
