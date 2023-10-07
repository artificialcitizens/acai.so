import { AutoGPT } from 'langchain/experimental/autogpt';
import { ReadFileTool, WriteFileTool, SerpAPI } from 'langchain/tools';
import { InMemoryFileStore } from 'langchain/stores/file/in_memory';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { useAcaiChat, useAcaiEmbeddings } from '../../models/chat';

const store = new InMemoryFileStore();

const tools = [
  new ReadFileTool({ store }),
  new WriteFileTool({ store }),
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: 'San Francisco,California,United States',
    hl: 'en',
    gl: 'us',
  }),
];

const { embeddings } = useAcaiEmbeddings()
const vectorStore = new MemoryVectorStore(embeddings);

const { chat } = useAcaiChat()
const autogpt = AutoGPT.fromLLMAndTools(
  chat,
  tools,
  {
    memory: vectorStore.asRetriever(),
    aiName: 'Tom',
    aiRole: 'Assistant',
  },
);

await autogpt.run(['write a weather report for SF today']);
