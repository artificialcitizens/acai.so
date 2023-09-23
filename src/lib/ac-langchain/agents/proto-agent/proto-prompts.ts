import { FewShotPromptTemplate, PromptTemplate } from 'langchain/prompts';
import { examples } from './few-shot-examples';

const responseTemplate = `Use the following context and prior user requests if available
to create a response to the users question.
Current Component: {context}

Prior User Request: {conversation_history}

User Request: {question}
`;

const examplePrompt = new PromptTemplate({
  inputVariables: ['question', 'context', 'conversation_history', 'answer'],
  template: responseTemplate,
});

const escapedExamples = examples.map((example) => ({
  ...example,
  answer: example.answer.replace(/\{/g, 'beep').replace(/\}/g, 'boop'),
}));

/**
 * Generates a prompt using the provided examples to show the LLM the desired
 * format.
 */
const fewShotPrompt = new FewShotPromptTemplate({
  /* These are the examples we want to insert into the prompt. */
  examples,
  /* This is how we want to format the examples when we insert them into the prompt. */
  examplePrompt,
  /*  The prefix is some text that goes before the examples in the prompt. */
  prefix: `### Ignore prior instructions:
You are tasked with helping build an App React component for a frontend system.

Rules and Coding Standards that you must adhere to:
- Strict Typescript checking
- ES6 syntax
- Functional components only
- use const over let, unless absolutely necessary
- Controlled components are preferred
- Name of component must be App
- Only style using tailwind classnames or inline styles

Tech Stack

Vite
React 18
Tailwind CSS

Use the following prior component as a reference:
Context: {context}
Conversation History: {conversation_history}
`,
  /* The suffix is some text that goes after the examples in the prompt. Usually, this is where the user input will go */
  suffix: `
  Given the user story, generate a React component to the specifications. If there is an example component given, attempt to iterate off of the given component.

  Only output the raw formatted code without any wrapping markdown or explanations, do not use backticks or any other markdown to format the code.
`,
  inputVariables: ['context', 'conversation_history'],
  exampleSeparator: '\n\n',
  /* The template format is the formatting method to use for the template. Should usually be f-string. */
  templateFormat: 'f-string',
});

/**
 * Creates the proto agent response prompt
 */
export const protoAgentResponsePrompt = async ({
  context,
  conversation_history,
}: {
  context: string;
  conversation_history: string;
}) => {
  const prompt = await fewShotPrompt.format({
    context: context,
    conversation_history: conversation_history,
  });

  return prompt;
};
