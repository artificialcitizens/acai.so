import { PromptTemplate } from 'langchain/prompts';
import { queryChat } from './chat-model';

const actionRouterPrompt = `##Ignore Prior Instructions
You are tasked with routing the user query to the best action based on the users input.
use the following chat history to help decide the users intent:

{chatHistory}

==============
you'll receive a set of possible actions formatted with their related utterances.

example format:
- action_name: ...
  related_utterances:
  - ...
  - ...
  - ...

this will give you a wider range of ideas to funnel the user query

The possible actions are:
{actions}

you are to think step by step and  give a confidence score for each one and then finally output the one you think is most likely

the final action chosen must be wrapped in an action typetag
example:
actionA: 0.9
actionB: 0.3
actionC: 0.2
<action>actionA</action>
`;
const writingAssistantPromptTemplate = PromptTemplate.fromTemplate<{
  actions: string;
  input: string;
  chatHistory?: string;
}>(actionRouterPrompt);

export const createWritingPromptTemplate = ({
  actions,
  input,
  chatHistory,
}: {
  actions: string;
  input: string;
  chatHistory?: string;
}) => {
  return writingAssistantPromptTemplate.format({
    actions,
    input,
    chatHistory: chatHistory ? chatHistory : '',
  });
};

// export const queryRouterAgent = async ({
//   actions,
//   input,
//   chatHistory,
// }: {
//   actions: string;
//   input: string;
//   chatHistory?: string;
// }): Promise<string> => {
//   const prompt = await createWritingPromptTemplate({
//     actions,
//     input,
//     chatHistory,
//   });
//   const response = await queryChat({
//     systemMessage: prompt,
//     message: input,
//     modelName: 'gpt-4',
//   });
//   const regex = /<action>(.*)<\/action>/gm;
//   const match = regex.exec(response);
//   console.log(match);
//   if (match) {
//     return match[1];
//   } else {
//     return 'chat';
//   }
// };
