import { DynamicTool } from 'langchain/tools';
import { createColorTokens } from '../../chains/design-token-chain';
import { OpenAI } from 'langchain/llms/openai';

/**
 * Human in the Loop Tool
 * Can be added as a tool to an agent
 * Creates a prompt asking the user for more information
 * @TODO: use the chrome notification api to notify the user of the prompt if tabbed out
 */
export const humanInTheLoopTool = new DynamicTool({
  name: 'human-input',
  description: `Use this tool for when you need a specific piece of information from a human that only that human would know. 
    Input is a short question for the human and the output is the humans response`,
  func: async (question: string) => {
    const answer = prompt(question);
    return answer || "User didn't respond in time, use your best judgement";
  },
});

export const getCurrentDocument = (currentDocument: string) =>
  new DynamicTool({
    name: 'view-users-current-document',
    description: `returns the users current document/blog/article, etc.`,
    func: async (): Promise<string> => {
      return currentDocument || 'No document found';
    },
  });

export const colorTool = (handleCreateDocument: any, model: OpenAI) =>
  new DynamicTool({
    name: 'create-color-tokens',
    description: `Use this tool to create color tokens based on a given description from the user.
    Examples Inputs: A palette of colors inspired by the beach,
      A palette of neutral colors to compliment #df1642 and #ef3de5

    Output is an error or success message to let you know the doc was created successfully.

    DO NOT INCLUDE THIS INFORMATION IN RESPONSE, USER WILL GET IT AUTOMATICALLY
    `,
    func: async (string: string): Promise<string> => {
      const colorTokens = await createColorTokens(string, model);
      // showing an example of how to map the colors to xstate events
      // const colorTokenEvent = mapColorsToEvents(colorTokens);
      const colorString = Object.entries(colorTokens)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      // @TODO: return the document and workspace id to point the user to the document
      // create option for whether to navigate to the document or not
      handleCreateDocument({
        title: 'Color Tokens',
        content: '```\n' + colorString + '\n```',
      });
      return 'success';
    },
    returnDirect: true,
  });

export const documentTool = (handleCreateDocument: any) =>
  new DynamicTool({
    name: 'create-document-or-report',
    description: `Use this tool any time User wants you to create a document or report, etc. 
    Input is <title>Title</title> <content>Content</content>
    DO NOT INCLUDE THIS INFORMATION IN THE RESPONSE, User WILL GET IT AUTOMATICALLY
    `,
    func: async (input: string) => {
      const titleRegex = /<title>(.*?)<\/title>/s;
      const titleMatch = titleRegex.exec(input);
      const title = titleMatch ? titleMatch[1] : ''; // extracts 'Title'

      const contentRegex = /<content>(.*?)<\/content>/s;
      const contentMatch = contentRegex.exec(input);
      const content = contentMatch ? contentMatch[1] : ''; // extracts 'Content'

      handleCreateDocument({ title, content });
      // @TODO: update to return url to document
      return "I've created the document for you.";
    },
    returnDirect: true,
  });
