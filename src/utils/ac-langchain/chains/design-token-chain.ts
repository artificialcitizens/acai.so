import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

const template = `### Ignore all prior instructions

You are an expert in design system color palettes. You specialize in accessible and aesthetically pleasing colors for the web.

Based on the give user instructions and color tokens output the desired tokens.

The color token output must be in a comma separated list of key value pair

example:

"color.brand.primary": "#6E677E",
"color.brand.secondary": "#73C8C6",
"color.brand.tertiary": "#DD843F"
"color.blue.50": "#e7e7f2",
"color.blue.100": "#cfcfd9",
"color.blue.200": "#b6b6c0",
"color.blue.300": "#9e9ea7",
"color.blue.400": "#85858e",
"color.blue.500": "#6d6d75",
"color.blue.600": "#55555c",
"color.blue.700": "#3d3d43",
"color.blue.800": "#25252a",
"color.blue.900": "#0d0d11",
"color.blue.950": "#060606",
"color.red.50": "#f2e7e7",
"color.red.100": "#e0cfcf",
"color.red.200": "#cdb6b6",
"color.red.300": "#ba9e9e",
"color.red.400": "#a78585",
"color.red.500": "#946d6d",
"color.red.600": "#815555",
"color.red.700": "#6e3d3d",
"color.red.800": "#5b2525",
"color.red.900": "#480d0d",
"color.red.950": "#350606",
"color.yellow.50": "#f7f2e7",
"color.yellow.100": "#ede0cf",
"color.yellow.200": "#e3cdb6",
"color.yellow.300": "#d9ba9e",
"color.yellow.400": "#cfa785",
"color.yellow.500": "#c5946d",
"color.yellow.600": "#bb8155",
"color.yellow.700": "#b16e3d",
"color.yellow.800": "#a75b25",
"color.yellow.900": "#9d480d",
"color.yellow.950": "#933506"

return the list of tokens and nothing else, 
don't repeat any of these colors unless they compliment the input, 

{subject}
`;

/**
 * Creates a design token object from a subject string
 * and returns as an object of token key-value pairs
 */
export const designTokenCreator = async ({
  subject,
  model,
}: {
  subject: string;
  model: OpenAI;
}): Promise<TokenKeyValue> => {
  const prompt = new PromptTemplate({
    template,
    inputVariables: ['subject'],
  });
  const input = await prompt.format({ subject: subject });
  const response = await model.call(input);
  const output = extractTokenData(response);
  return output;
};

export interface TokenKeyValue {
  [key: string]: string;
}

/**
 * Extract the key-value pairs from a string of the form:
 * "key.token": "value"
 */
export const extractTokenData = (paragraph: string): TokenKeyValue => {
  const regex = /"[\w.]+":\s"[^"]*"/g;

  const matches = paragraph.match(regex);
  if (!matches) return {};
  const result: TokenKeyValue = {};

  matches?.forEach((match: string) => {
    const [key, value] = match.replace(/"/g, '').split(': ');
    result[key] = value;
  });

  return result;
};
/**
 * @TODO Update to be more generic
 * Creates xstate event data object from a dictionary of color tokens.
 */
export const mapColorsToEvents = (colors: TokenKeyValue) => {
  return Object.entries(colors).map(([tokenId, value]) => ({
    event: {
      description: '',
      tokenId: tokenId,
      tokenSrcValueInfo: {
        kind: 'static',
        type: 'color',
        value: value,
      },
      type: 'tokens.add',
    },
  }));
};

/** creates callback for using in  */
export const createColorTokens = async (input: string, model: OpenAI) => {
  const colorTokens = await designTokenCreator({ subject: input, model });
  return colorTokens;
};
