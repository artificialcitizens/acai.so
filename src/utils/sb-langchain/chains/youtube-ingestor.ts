import { YoutubeTranscript } from "youtube-transcript";
import { TokenTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import {
  StructuredOutputParser,
  OutputFixingParser,
} from "langchain/output_parsers";
import { z } from "zod";
import { loadSummarizationChain } from "langchain/chains";
import dotenv from "dotenv";
import {
  PartialContentResult,
  getSummaries,
  summarySplitter,
} from "./summary-chain";

dotenv.config();
const parser = StructuredOutputParser.fromZodSchema(
  z.array(z.string()).describe("Questions in an array of strings")
);

const smartModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.25,
});

const quickModel = new ChatOpenAI({
  temperature: 0,
});

export async function getYTSummaries(
  url: string
): Promise<PartialContentResult[]> {
  const transcript = await YoutubeTranscript.fetchTranscript(url);
  const combinedTranscript = transcript.map((item) => item.text).join(" ");
  const docs = await summarySplitter.createDocuments([combinedTranscript]);
  const summaries = await getSummaries(docs);
  return summaries;
}

const observationPrompt = PromptTemplate.fromTemplate(
  `You are tasked with generating observations based on the following text:
  {text}

  ##################
    output must be in the format of string[]`
);

export const getObservations = async (summary: string): Promise<string[]> => {
  const formattedPrompt = await observationPrompt.format({
    text: summary,
  });
  console.log("Generating Observations");
  const response = await quickModel.call([
    new HumanChatMessage(formattedPrompt),
  ]);
  const parsedResult = await parser.parse(response.text);
  console.log("Generating Observations Complete");
  return parsedResult;
};

const questionPrompt = PromptTemplate.fromTemplate(
  `You are tasked with generating questions based on the following text:
  {text}

  ##################
  output must be in the format of string[]`
);

export const getQuestions = async (summary: string): Promise<string[]> => {
  console.log(`Getting questions ${summary}}`);
  const formattedPrompt = await questionPrompt.format({
    text: summary,
  });
  console.log("Generating Questions");

  try {
    const response = await smartModel.call([
      new HumanChatMessage(formattedPrompt),
    ]);
    const parsedResponse = await parser.parse(response.text);
    return parsedResponse;
  } catch (e) {
    return ["failed to parse output" + e];
  } finally {
    console.log("Generating Questions Complete");
  }
};

const answerPrompt = PromptTemplate.fromTemplate(
  `You are tasked with generating answers to the questions based on the context:
  context: {context}
  questions: {questions}

  ##################
    output must be in the format of type string[]
    `
);

export const getAnswers = async (
  context: string,
  questions: string[]
): Promise<string[]> => {
  const formattedPrompt = await answerPrompt.format({
    context,
    questions,
  });
  console.log("Generating Answers");
  const response = await smartModel.call([
    new HumanChatMessage(formattedPrompt),
  ]);
  try {
    const parsedResponse = await parser.parse(response.text);
    return parsedResponse;
  } catch (e) {
    return ["failed to parse output" + e];
  } finally {
    console.log("Generating Answers Complete");
  }
};

const titlePrompt = PromptTemplate.fromTemplate(
  `You are tasked with creating a 5 word or less title for the following text:
  {text}`
);

export const getTitle = async (summary: string): Promise<string> => {
  const summaryCut = summary.slice(0, 500);

  const formattedPrompt = await titlePrompt.format({
    text: summaryCut,
  });
  console.log("Getting Title");

  const response = await quickModel.call([
    new HumanChatMessage(formattedPrompt),
  ]);
  console.log("Getting Title Complete");

  return response.text;
};

const tagsPrompt = PromptTemplate.fromTemplate(
  `You are tasked with creating several high-level category tags for the following text:
  
  {text}
  
  ##################
  output must be an array of strings`
);

export const getTags = async (summary: string): Promise<string[]> => {
  const formattedPrompt = await tagsPrompt.format({
    text: summary,
  });
  console.log("Getting Tags");

  const response = await smartModel.call([
    new HumanChatMessage(formattedPrompt),
  ]);
  console.log("Getting Tags Complete");

  return response.text.split(" ");
};
