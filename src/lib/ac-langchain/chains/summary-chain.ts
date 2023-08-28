import { YoutubeTranscript } from 'youtube-transcript';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';
import { PromptTemplate } from 'langchain/prompts';
import {
  StructuredOutputParser,
  OutputFixingParser,
} from 'langchain/output_parsers';
import { z } from 'zod';
import { loadSummarizationChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { getToken } from '../../../utils/config';

export type PartialContentResult = {
  id: number;
  partialSummary: string;
};

export type SummaryResults = {
  title: string;
  mainSummary: string;
  content: PartialContentResult[];
};

const summaryPrompt = PromptTemplate.fromTemplate(
  `Give a detailed summary of the following text:
  
  {text}
  ##################
  Be sure to leave in key details and do not embellish or add any information.`,
);

const parser = StructuredOutputParser.fromZodSchema(
  z.array(z.string()).describe('Questions in an array of strings'),
);

// https://www.youtube.com/watch?v=7Y6n5zBCzMo
export const summarySplitter = new TokenTextSplitter({
  encodingName: 'gpt2',
  chunkSize: 3000,
  chunkOverlap: 300,
});

export const getSummaries = async ({
  docs,
}: {
  docs: Document[];
}): Promise<PartialContentResult[]> => {
  const summaries: PartialContentResult[] = [];
  console.log(`Generating Partial Summaries for ${docs.length} chunks of text`);

  const quickModel = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    temperature: 0,
  });
  const summaryPromises = docs.map(async (doc, index) => {
    const formattedSummaryPrompt = await summaryPrompt.format({
      text: doc.pageContent,
    });
    try {
      const response = await quickModel.call([
        new HumanChatMessage(formattedSummaryPrompt),
      ]);
      const partialSummary = response.text;
      summaries.push({ id: index, partialSummary });
      return { id: index, partialSummary };
    } catch (e) {
      throw new Error(`Failed to generate summary for chunk ${index}\n${e}`);
    } finally {
      console.log('Generating Partial Summaries Complete');
    }
  });

  // get all summaries from chunked docs
  await Promise.all(summaryPromises);

  return summaries;
};

export const getMainSummary = async ({
  summary,
  openAIApiKey,
}: {
  summary: string;
  openAIApiKey: string;
}): Promise<string> => {
  const smartModel = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-4',
    temperature: 0.25,
  });

  const formattedPrompt = await summaryPrompt.format({
    text: summary,
  });
  const docs = await summarySplitter.createDocuments([formattedPrompt]);
  console.log('Final Summarization Starting');
  const chain = loadSummarizationChain(smartModel, { type: 'map_reduce' });
  const res = await chain.call({
    input_documents: docs,
  });
  console.log('Final Summarization Complete');
  return res.text;
};
