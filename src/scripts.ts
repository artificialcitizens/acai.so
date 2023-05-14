import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';

//##########
// LangChain
//##########

// const chatModel = new ChatOpenAI({ temperature: 0, openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
// const llm = new OpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });

const memoryStoreExample = async () => {
  const splitter = new CharacterTextSplitter({
    separator: '\n',
    chunkSize: 150,
    chunkOverlap: 10,
  });
  // Create docs with a loader
  const loader = new TextLoader('src/stories/assets/documents/vector_store_guide.txt');
  try {
    const docs = await loader.load();
    console.log('docs', docs);
    const splitDocs = await splitter.splitDocuments(docs);
    console.log('splitDocs', splitDocs[5]);
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ openAIApiKey: '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' }),
    );

    // Search for the most similar document
    const result = await vectorStore.similaritySearch('what if I want something like Python?', 1);

    return result[0].pageContent;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
};

const test = await memoryStoreExample();
console.log(test);
