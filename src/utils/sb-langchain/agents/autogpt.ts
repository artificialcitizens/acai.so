import { AutoGPT } from "langchain/experimental/autogpt";
import {
  ReadFileTool,
  WriteFileTool,
  GoogleCustomSearch,
} from "langchain/tools";
import { NodeFileStore } from "langchain/stores/file/node";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Calculator } from "langchain/tools/calculator";
import { OpenAI } from "langchain/llms/openai";

const store = new NodeFileStore();

const tools = [
  new GoogleCustomSearch(),
  new ReadFileTool({ store }),
  new WriteFileTool({ store }),
  new Calculator(),
];

const vectorStore = new HNSWLib(new OpenAIEmbeddings(), {
  space: "cosine",
  numDimensions: 1536,
});

const model = new ChatOpenAI({});

const autogpt = AutoGPT.fromLLMAndTools(model, tools, {
  memory: vectorStore.asRetriever(),
  aiName: "Ava",
  aiRole: "Assistant",
});

export const taskCreator = async (input: string) => {
  const res = await autogpt.taskCreator(input);
  return res;
};

export const autogptRun = async (input: string) => {
  const res = await autogpt.run([input]);
  return res;
};
