import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { openAi, pineconeEnv, pineconeIndexName, pineconeToken, serpApiKey } from '../../env';
import { DynamicTool } from 'langchain/tools';

const model = new ChatOpenAI({ openAIApiKey: openAi, temperature: 0 });

const exampleToolFunction = async (input: string) => {
  return 'foo';
};

const tools = [
  new SerpAPI(serpApiKey, {
    location: 'Portland,Oregon,United States',
    hl: 'en',
    gl: 'us',
  }),
  new Calculator(),
  new DynamicTool({
    name: 'Foo Bar',
    description: 'call this to get the value of foo. input should be an empty string.',
    func: exampleToolFunction,
  }),
];

export const runChatMrklAgent = async (query: string) => {
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'chat-zero-shot-react-description',
    verbose: true,
  });

  const input = query;

  const result = await executor.call({ input });

  return result.output;
};

export async function fetchChatMrklAgentEndpoint(question: string) {
  const response = await fetch('/chat-mrkl-agent?question=' + encodeURIComponent(question));
  const data = await response.json();
  return data;
}
