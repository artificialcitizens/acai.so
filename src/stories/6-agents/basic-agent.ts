import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { OpenAI } from 'langchain/llms/openai';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import 'dotenv/config';

const model = new OpenAI({ openAIApiKey: process.env.STORYBOOK_OPENAI_API_KEY, temperature: 0 });
const tools = [
  new SerpAPI(process.env.STORYBOOK_SERPAPI_KEY, {
    location: 'Austin,Texas,United States',
    hl: 'en',
    gl: 'us',
  }),
  new Calculator(),
];

export const runMrklAgent = async (query: string) => {
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'zero-shot-react-description',
    verbose: true,
  });
  const result = await executor.call({ input: query });
  return result.output;
};

export async function fetchMrklAgentEndpoint(question: string) {
  const response = await fetch('/mrkl-agent?question=' + encodeURIComponent(question));
  const data = await response.json();
  return data;
}
