import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import TipTap from '../../components/TipTap/TipTap';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { OpenAI } from 'langchain/llms/openai';

const chatModel = new ChatOpenAI({ temperature: 0, openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
const llmModel = new OpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });

//##########
// LangChain
//##########
const obj = {
  name: 'John Doe',
  age: 30,
  cars: [
    { name: 'Ford', models: ['Fiesta', 'Focus', 'Mustang'] },
    { name: 'BMW', models: ['320', 'X3', 'X5'] },
    { name: 'Fiat', models: ['500', 'Panda'] },
  ],
};

const jsonToYaml = async (input: string) => {
  const response = await chatModel.call([
    new SystemChatMessage('You are a coding assistant that translates JSON to YAML.'),
    new HumanChatMessage(input),
  ]);
  return `<pre><code>${response.text}</code></pre>`;
};

const languageToJSON = async (input: string): Promise<string> => {
  const response = await chatModel.call([
    new SystemChatMessage(`You are tasked with taking the users input and converting it to a JSON object. 
    Only return the object with no explanation or context in the following format:
    ${JSON.stringify(obj, null, 2)}
    `),
    new HumanChatMessage(input),
  ]);
  return `<pre><code>${response.text}</code></pre>`;
};

const structuredOutputParserExample = async (input: string): Promise<string> => {
  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    name: 'users name',
    age: 'users age',
    cars: 'users cars as a formatted string of brand names and models',
  });

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `You are tasked with taking the users input and converting it to a JSON object
    Return only the object and no other explanation.
      {format_instructions}
      {question}`,
    inputVariables: ['question'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const query = await prompt.format({
    question: input,
  });
  try {
    const response = await llmModel.call(query);
    await parser.parse(response);
    return `<pre><code>${response}</code></pre>`;
  } catch (e) {
    return `<pre><code>${e}</code></pre>`;
  }
};

const zodOutputParserExample = async (input: string): Promise<string> => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      name: z.string().describe('the users name'),
      age: z.number().describe('the users age'),
      cars: z
        .array(
          z.object({
            name: z.string().describe('the brand name of the car'),
            models: z.array(z.string()).describe('the models of the car'),
          }),
        )
        .describe('the users cars'),
    }),
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `You are tasked with taking the users input and converting it to a JSON object. 
    Only return the object with no explanation or context in the following format
    {format_instructions}
    {question}
    `,
    inputVariables: ['question'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const query = await prompt.format({
    question: input,
  });
  try {
    const response = await llmModel.call(query);
    await parser.parse(response);
    return `<pre><code>${response.trim()}</code></pre>`;
  } catch (e) {
    return `<pre><code>${e}</code></pre>`;
  }
};

const zodParserWithMyPrompt = async (input: string): Promise<string> => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      name: z.string().describe('the users name'),
      age: z.number().describe('the users age'),
      cars: z
        .array(
          z.object({
            name: z.string().describe('the brand name of the car'),
            models: z.array(z.string()).describe('the models of the car'),
          }),
        )
        .describe('the users cars'),
    }),
  );

  try {
    const response = await chatModel.call([
      new SystemChatMessage(`You are tasked with taking the users input and converting it to a JSON object. 
    Only return the object with no explanation or context in the following format:
${JSON.stringify(obj, null, 2)}`),
      new HumanChatMessage(input),
    ]);
    await parser.parse(response.text);
    return `<pre><code>${response.text}</code></pre>`;
  } catch (e) {
    return `<pre><code>${e}</code></pre>`;
  }
};

// #########
// Storybook
// #########
const meta = {
  title: 'Prompts/Stories',
  component: TipTap,
  argTypes: {
    startingValue: { control: 'string' },
    onClickHandler: { control: 'function' },
    label: { control: 'string' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TipTap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JsonToYamlExample: Story = {
  args: {
    onClickHandler: jsonToYaml,
    startingValue: `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre></code>`,
    label: 'JSON to YAML',
  },
};

export const LanguageToJsonExample: Story = {
  args: {
    onClickHandler: languageToJSON,
    startingValue: `
    My name is Josh Mabry and I'm 38 years old. I have a Pontiac GTO, a Pontiac Firebird, and a Pontiac Solstice. I also have a Ford Mustang, and a Ford Econoline.
    `,
    label: 'Language to JSON',
  },
};

export const StructuredOutputParserExample: Story = {
  args: {
    onClickHandler: structuredOutputParserExample,
    startingValue: `My name is Josh Mabry and I'm 38 years old. I have a Pontiac GTO, a Pontiac Firebird, and a Pontiac Solstice. I also have a Ford Mustang, and a Ford Econoline.`,
    label: 'Structured Output Parser',
  },
};

export const ZodOutputParserExample: Story = {
  args: {
    onClickHandler: zodOutputParserExample,
    startingValue: `My name is Josh Mabry and I'm 38 years old. I have a Pontiac GTO, a Pontiac Firebird, and a Pontiac Solstice. I also have a Ford Mustang, and a Ford Econoline.`,
    label: 'Zod Output Parser',
  },
};

export const ZodParserMyPromptExample: Story = {
  args: {
    onClickHandler: zodParserWithMyPrompt,
    startingValue: `My name is Josh Mabry and I'm 38 years old. I have a Pontiac GTO, a Pontiac Firebird, and a Pontiac Solstice. I also have a Ford Mustang, and a Ford Econoline.`,
    label: 'Zod Custom Prompt Output',
  },
};
