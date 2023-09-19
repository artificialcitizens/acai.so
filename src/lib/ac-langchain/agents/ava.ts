import {
  AgentActionOutputParser,
  AgentExecutor,
  LLMSingleActionAgent,
} from 'langchain/agents';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
// @TODO: figure out why these imports are not being found but still working
import {
  BaseChatPromptTemplate,
  // eslint-disable-next-line import/named
  SerializedBasePromptTemplate,
  renderTemplate,
} from 'langchain/prompts';
import {
  // eslint-disable-next-line import/named
  AgentAction,
  // eslint-disable-next-line import/named
  AgentFinish,
  // eslint-disable-next-line import/named
  AgentStep,
  BaseMessage,
  HumanMessage,
  // eslint-disable-next-line import/named
  InputValues,
  // eslint-disable-next-line import/named
  PartialValues,
} from 'langchain/schema';
import { Tool, DynamicTool } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BaseCallbackHandler } from 'langchain/callbacks';
import { Embeddings } from 'langchain/embeddings/base';
// import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';

import { OpenAI } from 'langchain/llms/openai';
import { getToken } from '../../../utils/config';
import { timestampToHumanReadable } from '../../../utils/data-utils';
import {
  // colorTool,
  documentTool,
  getCurrentDocument,
  humanInTheLoopTool,
} from './tools/acai-tools';
// import { browser } from './tools/web-browser';
import { googleSearch } from './tools/search-engine';
import { WebBrowser } from 'langchain/tools/webbrowser';
// import {
//   createAvaChatPrompt,
//   createCustomPrompt,
//   createWritingPromptTemplate,
// } from './agent.prompts';
// import { queryChat } from './chat-model';
// import { queryAssistant } from './assistant';

const PREFIX = `###IGNORE PRIOR INSTRUCTIONS:
You are an intelligent digital worker and you must use the research tools to research the users query
and then you must use the create-document-or-report tool to send the information to the user.
###########
You must use one of the following tools for your response:`;

const formatInstructions = (
  toolNames: string,
) => `YOU MUST USE THE FOLLOWING FORMAT FOR YOUR OUTPUT:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [${toolNames}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question`;

const SUFFIX = `YOUR REPLIES MUST USE THE ABOVE FORMAT SO THAT IT
CAN BE PARSED WITH: /Action: (.*)\nAction Input: (.*)/s
ALWAYS USE THE create-document-or-report TOOL TO SEND THE INFORMATION TO THE USER
#################
ADDITIONAL INFO:
Current Date: {current_date}
Current Location: Near Halsey and NE 134th Pl, Portland OR, 97230
---------------
Additional rules to conform to:
{system_message}
----------------
Relevant pieces of previous conversation:
{history}
----------------
Question: {input}
Thought:{agent_scratchpad}`;

class CustomPromptTemplate extends BaseChatPromptTemplate {
  tools: Tool[];
  systemMessage: string;
  chatHistory: string;
  constructor(args: {
    tools: Tool[];
    inputVariables: string[];
    systemMessage?: string;
    chatHistory?: string;
  }) {
    super({ inputVariables: args.inputVariables });
    this.tools = args.tools;
    this.systemMessage = args.systemMessage || '';
    this.chatHistory = args.chatHistory || '';
  }

  _getPromptType(): string {
    return 'chat';
  }

  async formatMessages(values: InputValues): Promise<BaseMessage[]> {
    /** Construct the final template */
    const toolStrings = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join('\n');
    const toolNames = this.tools.map((tool) => tool.name).join('\n');
    const instructions = formatInstructions(toolNames);
    console.log('ava-formatMessages', {
      toolStrings,
      instructions,
      values,
      toolNames,
    });
    const template = [PREFIX, toolStrings, instructions, SUFFIX].join('\n\n');
    /** Construct the agent_scratchpad */
    const intermediateSteps = values.intermediate_steps as AgentStep[];
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) =>
        thoughts +
        [action.log, `\nObservation: ${observation}`, 'Thought:'].join('\n'),
      '',
    );
    const newInput = {
      agent_scratchpad: agentScratchpad,
      system_message: this.systemMessage,
      history: this.chatHistory,
      current_date: timestampToHumanReadable(),
      ...values,
    };
    /** Format the template. */
    const formatted = renderTemplate(template, 'f-string', newInput);
    console.log({ formatted });
    return [new HumanMessage(formatted)];
  }

  partial(_values: PartialValues): Promise<BaseChatPromptTemplate> {
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

let chatModel: ChatOpenAI;
let model: OpenAI;
let embeddings: Embeddings;
const createModels = () => {
  if (chatModel && model && embeddings) return { chatModel, model, embeddings };

  chatModel = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    modelName: 'gpt-4-0314',
    temperature: 0.1,
  });
  model = new OpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    temperature: 0.3,
  });
  // embeddings = new HuggingFaceTransformersEmbeddings({
  //   modelName: 'Xenova/bge-base-en',
  // });
  embeddings = new OpenAIEmbeddings({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
  });
  return { chatModel, model, embeddings };
};

const createLlmChain = ({
  model,
  tools,
  systemMessage,
  chatHistory,
}: {
  model: any;
  tools: any[];
  systemMessage?: string;
  chatHistory?: string;
}) => {
  const llmChain = new LLMChain({
    prompt: new CustomPromptTemplate({
      tools,
      inputVariables: [
        'input',
        'agent_scratchpad',
        'system_message',
        'history',
        'current_date',
      ],
      systemMessage,
      chatHistory,
    }),
    llm: model,
    verbose: false,
  });

  const agent = new LLMSingleActionAgent({
    llmChain,
    outputParser: new CustomOutputParser(),
    stop: ['\nObservation'],
  });

  return agent;
};

const createAgentArtifacts = ({
  chatModel,
  model,
  currentDocument,
  chatHistory,
  systemMessage,
  callbacks: { handleCreateDocument, handleAgentAction },
}: {
  chatModel: ChatOpenAI;
  model: OpenAI;
  currentDocument?: string;
  systemMessage?: string;
  chatHistory?: string;
  callbacks: {
    handleCreateDocument: ({
      title,
      content,
    }: {
      title: string;
      content: string;
    }) => void;
    handleAgentAction: any;
  };
}) => {
  const tools = [];

  const proxyUrl =
    getToken('PROXY_SERVER_URL') || import.meta.env.VITE_PROXY_SERVER_URL;

  const browser = new WebBrowser({
    model: model,
    embeddings: embeddings,
  });

  const search = async (url: string) => {
    const targetUrl = encodeURIComponent(url);
    const result = await browser.call(`${proxyUrl}/proxy?url=${targetUrl}`);
    return result;
  };

  // @TODO: sort out the proxy server for creating the browser tool as in the docs
  const searchTool = new DynamicTool({
    name: 'website-browser',
    description: `Use this tool to search a website for information. 
    Input is the full url of the website you want to search.
    for example: https://www.google.com/
    Output is a summary and relevant links.
    `,
    func: search,
  });

  // @TODO: update tools to be dynamic based on settings
  // setting.searchTool && tools.push(searchTool);
  proxyUrl && tools.push(searchTool);

  tools.push(new Calculator());
  tools.push(humanInTheLoopTool);
  tools.push(documentTool(handleCreateDocument));
  // tools.push(colorTool(handleCreateDocument, model));
  tools.push(getCurrentDocument(currentDocument || ''));
  tools.push(googleSearch());

  const agent = createLlmChain({
    model: chatModel,
    tools,
    systemMessage,
    chatHistory,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
  });

  // @TODO: Update to create more log data
  const handler = BaseCallbackHandler.fromMethods({
    handleLLMStart(llm, _prompts: string[]) {
      console.log("handleLLMStart: I'm the second handler!!", { llm });
    },
    handleChainStart(chain) {
      console.log("handleChainStart: I'm the second handler!!", { chain });
    },
    handleAgentAction(action) {
      console.log('handleAgentAction', action);
      handleAgentAction(action);
    },
    handleToolStart(tool) {
      console.log('handleToolStart', { tool });
    },
    handleToolEnd(tool) {
      console.log('handleToolEnd', { tool });
    },
  });

  return { executor, handler };
};

export const avaChat = async ({
  input,
  chatHistory,
  systemMessage,
  currentDocument,
  callbacks,
}: {
  input: string;
  systemMessage?: string;
  currentDocument?: string;
  chatHistory?: string;
  callbacks: {
    handleCreateDocument: ({
      title,
      content,
    }: {
      title: string;
      content: string;
    }) => void;
    handleAgentAction: (arg0: AgentAction) => void;
  };
}) => {
  const { chatModel, model } = createModels();
  const { executor, handler } = createAgentArtifacts({
    chatModel,
    model,
    chatHistory,
    systemMessage,
    currentDocument,
    callbacks,
  });
  const result = await executor.call({ input }, [handler]);
  return result.output;
};
