import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';

/**
 * Create a step by step task list based on given subject.
 */
export const taskCreator = async ({
  subject,
  openAIApiKey,
}: {
  subject: string;
  openAIApiKey: string;
}): Promise<string[]> => {
  // With a `CommaSeparatedListOutputParser`, we can parse a comma separated list.
  const parser = new CommaSeparatedListOutputParser();

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: 'Create a 5 step task list to accomplish this goal {subject}.\n{format_instructions}',
    inputVariables: ['subject'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0 });

  const input = await prompt.format({ subject: subject });
  const response = await model.call(input);

  return parser.parse(response);
};

/**
 * Create a list of brainstorming ideas based on given topic.
 */
export const brainstormSession = async ({
  topic,
  openAIApiKey,
}: {
  topic: string;
  openAIApiKey: string;
}): Promise<string[]> => {
  const parser = new CommaSeparatedListOutputParser();
  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: 'Generate 10 brainstorming ideas for the topic {topic}.\n{format_instructions}',
    inputVariables: ['topic'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.7 });

  const input = await prompt.format({ topic: topic });
  const response = await model.call(input);

  return parser.parse(response);
};

/**
 * Create a paragraph about given subject.
 */
export const writingAssistant = async ({
  subject,
  openAIApiKey,
}: {
  subject: string;
  openAIApiKey: string;
}): Promise<string> => {
  const prompt = new PromptTemplate({
    template: 'Write a paragraph about {subject}.',
    inputVariables: ['subject'],
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.5 });

  const input = await prompt.format({ subject: subject });
  const response = await model.call(input);

  return response;
};

/**
 * Review the code snippet and suggest improvements.
 */
export const automatedCodeReview = async ({
  codeSnippet,
  openAIApiKey,
}: {
  codeSnippet: string;
  openAIApiKey: string;
}): Promise<string> => {
  const prompt = new PromptTemplate({
    template: "Review the following code snippet and suggest improvements: '{codeSnippet}'",
    inputVariables: ['codeSnippet'],
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.3 });

  const input = await prompt.format({ codeSnippet: codeSnippet });
  const response = await model.call(input);

  return response;
};

export const compareContext = async ({
  a,
  b,
  openAIApiKey,
}: {
  a: string;
  b: string;
  openAIApiKey: string;
}): Promise<string> => {
  const prompt = new PromptTemplate({
    template: `Given the following two bodies of text merge the knowledge of the two. 
    If there are any conflicting ideas then you must append any questions you have about 
    the conflicting ideas to the end of your output.
    
    A:'{a}'
    
    B:'{b}'.`,
    inputVariables: ['a', 'b'],
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.5 });

  const input = await prompt.format({ a, b });
  const response = await model.call(input);

  return response;
};

export const extractConflicts = async ({
  a,
  b,
  openAIApiKey,
}: {
  a: string;
  b: string;
  openAIApiKey: string;
}): Promise<string[]> => {
  const prompt = new PromptTemplate({
    template: `Identify the conflicting ideas between the following two bodies of text: 
    
    A:'{a}'
    
    B:'{b}'.`,
    inputVariables: ['a', 'b'],
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.5 });

  const input = await prompt.format({ a, b });
  const response = await model.call(input);

  const parser = new CommaSeparatedListOutputParser();
  return parser.parse(response);
};

export const generateQuestions = async ({
  conflicts,
  openAIApiKey,
}: {
  conflicts: string[];
  openAIApiKey: string;
}): Promise<string[]> => {
  const prompt = new PromptTemplate({
    template: "Generate questions about the following conflicting ideas: '{conflicts}'.",
    inputVariables: ['conflicts'],
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.5 });

  const input = await prompt.format({ conflicts: conflicts.join(', ') });
  const response = await model.call(input);

  const parser = new CommaSeparatedListOutputParser();
  return parser.parse(response);
};

export const mergeKnowledge = async ({
  a,
  b,
  openAIApiKey,
}: {
  a: string;
  b: string;
  openAIApiKey: string;
}): Promise<string> => {
  const prompt = new PromptTemplate({
    template: `Merge the knowledge from the following two bodies of text: 
    
    A:'{a}'
    
    B:'{b}'.`,
    inputVariables: ['a', 'b'],
  });

  const model = new OpenAI({ openAIApiKey, temperature: 0.5 });

  const input = await prompt.format({ a, b });
  const response = await model.call(input);

  return response;
};
