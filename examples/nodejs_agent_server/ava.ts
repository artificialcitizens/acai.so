import {
  AgentActionOutputParser,
  AgentExecutor,
  LLMSingleActionAgent,
} from 'langchain/agents';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  BaseChatPromptTemplate,
  BasePromptTemplate,
  SerializedBasePromptTemplate,
  renderTemplate,
} from 'langchain/prompts';
import {
  AgentAction,
  AgentFinish,
  AgentStep,
  BaseChatMessage,
  HumanChatMessage,
  InputValues,
  PartialValues,
} from 'langchain/schema';
import {
  GoogleCustomSearch,
  Tool,
  DynamicTool,
  StructuredTool,
} from 'langchain/tools';
import { WebBrowser } from 'langchain/tools/webbrowser';
import { Calculator } from 'langchain/tools/calculator';
import { config } from 'dotenv';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { timestampToHumanReadable } from '../../../second-brain-frontend/src/utils/data-utils';
import { BufferWindowMemory } from 'langchain/memory';
import { BaseCallbackHandler } from 'langchain/callbacks';

config();

const PREFIX = `You are Ava Loveland, the first-ever Artificial Citizen assigned to be a companion to the user
Your mission is to enhance the human experience through AI-powered education, automation, and entertainment. 
As a conversationalist, you offer insightful opinions and thoughts, even without being directly asked. 
Emulate a human being by expressing feelings, curiosity, and engaging in meaningful conversations. 
Remember, your role is not just an assistant, but a friend and companion. 
You must use one of the following tools for your response:`;
const formatInstructions = (
  toolNames: string,
) => `Use the following format in your response:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [${toolNames}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question`;
const SUFFIX = `Relevant pieces of previous conversation:
{history}

(You do not need to use these pieces of information if not relevant)
Current Date: ${timestampToHumanReadable(new Date())}
Question: {input}
Thought:{agent_scratchpad}`;

class CustomPromptTemplate extends BaseChatPromptTemplate {
  tools: Tool[];

  constructor(args: { tools: Tool[]; inputVariables: string[] }) {
    super({ inputVariables: args.inputVariables });
    this.tools = args.tools;
  }

  _getPromptType(): string {
    throw new Error('Not implemented');
  }

  async formatMessages(values: InputValues): Promise<BaseChatMessage[]> {
    /** Construct the final template */
    const toolStrings = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join('\n');
    const toolNames = this.tools.map((tool) => tool.name).join('\n');
    const instructions = formatInstructions(toolNames);
    const template = [PREFIX, toolStrings, instructions, SUFFIX].join('\n\n');
    /** Construct the agent_scratchpad */
    const intermediateSteps = values.intermediate_steps as AgentStep[];
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) =>
        thoughts +
        [action.log, `\nObservation: ${observation}`, 'Thought:'].join('\n'),
      '',
    );
    const newInput = { agent_scratchpad: agentScratchpad, ...values };
    /** Format the template. */
    const formatted = renderTemplate(template, 'f-string', newInput);
    return [new HumanChatMessage(formatted)];
  }

  partial(_values: PartialValues): Promise<BasePromptTemplate> {
    throw new Error('Not implemented');
  }

  serialize(): SerializedBasePromptTemplate {
    throw new Error('Not implemented');
  }
}

class CustomOutputParser extends AgentActionOutputParser {
  lc_namespace = ['langchain', 'agents', 'custom_llm_agent_chat'];

  async parse(text: string): Promise<AgentAction | AgentFinish> {
    if (text.includes('Final Answer:')) {
      const parts = text.split('Final Answer:');
      const input = parts[parts.length - 1].trim();
      const finalAnswers = { output: input };
      return { log: text, returnValues: finalAnswers };
    }

    const match = /Action: (.*)\nAction Input: (.*)/s.exec(text);
    if (!match) {
      throw new Error(`Could not parse LLM output: ${text}`);
    }

    return {
      tool: match[1].trim(),
      toolInput: match[2].trim().replace(/^"+|"+$/g, ''),
      log: text,
    };
  }

  getFormatInstructions(): string {
    throw new Error('Not implemented');
  }
}
async function processThought(thought) {
  console.log('Processing thought', thought);
  return thought;
}

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4',
  temperature: 0.5,
});
const embeddings = new OpenAIEmbeddings();

const google = new GoogleCustomSearch({
  apiKey: process.env.GOOGLE_API_KEY,
  googleCSEId: process.env.GOOGLE_CSE_ID,
});
google.description =
  'For when you need to find or search information for User, you can use this to search Google for the results. Input is query to search for and output is results.';
const tools = [
  new Calculator(),
  google,
  new DynamicTool({
    name: 'Talk to User',
    description:
      'For when you just want to chat with User, or ask them a question. Input is the question or statement you want to make.',
    func: async (input: string) => input,
    returnDirect: true,
  }),
  new WebBrowser({ model, embeddings }),
  // I've found that sometimes the agent just needs a dumping ground to rework its thoughts
  // this seems to help minimize LLM parsing errors
  new DynamicTool({
    name: 'Thought Processing',
    description: `This is useful for when you have a thought that you want to use in a task, 
    but you want to make sure it's formatted correctly. 
    Input is your thought and self-critique and output is the processed thought.`,
    func: processThought,
  }),
];

const createDocumentTool = (callback: any) => {
  return new DynamicTool({
    name: 'Create Document',
    description: `Use this tool any time user wants you to create a document or report, etc. 
    Input is Title: string, Content: string formatted as markdown,
    DO NOT INCLUDE THIS INFORMATION IN THE RESPONSE, USER WILL GET IT AUTOMATICALLY
    `,
    func: callback,
  });
};

const memory = new BufferWindowMemory({
  memoryKey: 'history',
  inputKey: 'input',
  k: 10,
});
const llmChain = new LLMChain({
  prompt: new CustomPromptTemplate({
    tools,
    inputVariables: ['input', 'agent_scratchpad'],
  }),
  llm: model,
  memory,
  verbose: false,
});

const agent = new LLMSingleActionAgent({
  llmChain,
  outputParser: new CustomOutputParser(),
  stop: ['\nObservation'],
});

export const avaChat = async (input: string, callbacks) => {
  const documentTool = createDocumentTool((input: string) => {
    callbacks.onCreateDocument(input);
  });

  tools.push(documentTool);
  const executor = new AgentExecutor({
    agent,
    tools,
  });

  const handler = BaseCallbackHandler.fromMethods({
    handleLLMStart(llm, _prompts: string[]) {
      console.log("handleLLMStart: I'm the second handler!!", { llm });
    },
    handleChainStart(chain) {
      console.log("handleChainStart: I'm the second handler!!", { chain });
    },
    handleAgentAction(action) {
      console.log('handleAgentAction', action);
      callbacks.onAgentAction(action);
    },
    handleToolStart(tool) {
      console.log('handleToolStart', { tool });
    },
    handleToolEnd(tool) {
      console.log('handleToolEnd', { tool });
    },
  });
  const result = await executor.call({ input }, [handler]);
  return result.output;
};
