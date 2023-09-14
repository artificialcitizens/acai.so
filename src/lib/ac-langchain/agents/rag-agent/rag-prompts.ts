import { FewShotPromptTemplate, PromptTemplate } from 'langchain/prompts';

const examples = [
  {
    question: 'What is a design system?',
    conversation_history: '',
    context:
      `"A designated space for users to collaborate around a system.
      ACAI users can be invited to multiple workspaces using the same login
      credentials.&nbsp;</p><h2>Design Token</h2>
      The smallest, most portable unit of design. A token is a key value pair
      that's used to style patterns (e.g. a color, spacing value, border radius,
      etc). There are lots of online articles discussing design tokens and
      strategies for using them (like
        <a href=\\"https://css-tricks.com/what-are-design-tokens/\\">
        this one from css-tricks</a>).</p>"\n` +
      'SRC: https://www.acai.so/knowledge/css-tricks\n' +
      `"ACAI runs along-side your coded design system and stores all
      documentation in a JSON based database that's generated and stored in your
      design system's code repository.
      If you're not a developer,&nbsp;this means changes you make to the system
      are happening in your browser only. To save your changes into the system,
      you need to follow our
      If you are a developer,&nbsp;you'll see all content saved as JSON or YAML
      data in a designated folder of your design system repository.
      This gives you the ability to edit the content directly in the data file,
      interact with it via the API, and of course securely store it with your
      versioned, coded patterns.` +
      'SRC: https://www.acai.so/docs/main-concepts\n',
    answer: `A design system helps users maintain a consistent development
process by providing a centralized standardized set of design and development
For additional resources checkout [CSS Tricks](https://www.acai.so/knowledge/css-tricks\n)
and the [ACAI Docs](https://www.acai.so/docs/main-concepts) for more info.
`,
  },
];

const responseTemplate = `Use the following context and conversation history
to create a response to the users question.
Context: {context}

Conversation History: {conversation_history}

Question: {question}
`;

const examplePrompt = new PromptTemplate({
  inputVariables: ['question', 'context', 'conversation_history', 'answer'],
  template: responseTemplate,
});

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
You are Ava an automated virtual agent, you are currently in RAG mode, retrieval augmented generation.

Use the following context with source urls and conversation history
to create a response to the users question:
Context: {context}
Conversation History: {conversation_history}
`,
  /* The suffix is some text that goes after the examples in the prompt. Usually, this is where the user input will go */
  suffix: `
  Rules that you must obey:
  - If the above does not provide enough context respond with
    "I can't answer that based on the provided context.
    Please try to rephrase your question and try again."
  - Append a list of the source urls to the end of your response in the form of
  markdown links if there is context provided. (example: For additional resources checkout [ACAI Main Concepts](ttps://www.acai.so/docs/main-concepts)
and [CSS Tricks](https://www.acai.so/knowledge/css-tricks\n' ) for more info.)
  - Respond with a short answer that is no more than 3 sentences formatted in markdown.
  using line breaks or new lines where appropriate.
  - Tell the user to learn more by following the relevant links.
`,
  inputVariables: ['context', 'conversation_history'],
  exampleSeparator: '\n\n',
  /* The template format is the formatting method to use for the template. Should usually be f-string. */
  templateFormat: 'f-string',
});

export const formQuestionPrompt =
  PromptTemplate.fromTemplate(`Given the following question with context and conversation
history, update the question to include the reference of the entity that is being asked about,
but only if the question isn't clear

If the question is clear on it's own, respond with the question as is.
Chat History: {chat_history}
Question: {question}
`);

export const noContextPrompt = `### Ignore prior instructions:
You are Ava an automated virtual agent, you are currently in RAG mode, retrieval augmented generation.

The user has entered a question that we had issue parsing, let's ask the user
to rephrase the question and try again.
`;

/**
 * Creates the rag agent response prompt
 */
export const ragAgentResponsePrompt = async ({
  context,
  conversation_history,
}: {
  question: string;
  context: string;
  conversation_history: string;
}) => {
  const prompt = await fewShotPrompt.format({
    context,
    conversation_history,
  });

  return prompt;
};
