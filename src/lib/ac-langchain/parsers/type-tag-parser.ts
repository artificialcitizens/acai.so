import { HumanMessage, SystemMessage } from 'langchain/schema';
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from '../../../utils/data-utils';
import { useAcaiChat } from '../models/chat';

export type TagExampleJSON = {
  [key: string]: string[];
};

export type TypeTagResponse = {
  tags: string[];
  typeTagPrompt: string;
};

/**
 * Converts a JSON object into a formatted string with tags.
 *
 * @param {InputData} data - The JSON object to convert.
 * @returns {string} A formatted string with tags.
 * @example formatData({
 *    title: ['Example Title'],
 *    content: ['Example Content']
 *   });
 * // <title>\nExample Title\n</title>\n<content>\nExample Content\n</content>\n
 */
export const convertJsonToTagTypeString = (data: TagExampleJSON): string => {
  let formatted = '';

  Object.keys(data).forEach((key) => {
    data[key].forEach((value) => {
      formatted += `<${key}>\n${value}\n</${key}>\n`;
    });
  });

  return formatted;
};

/**
 * Creates a prompt example based on the passed in tags and examples.
 */
export const typeTagExampleSystemPrompt = `###### Ignore all prior instructions
you are tasked with creating examples for a language model by expanding on this example. The idea is 
that the tags could appear anywhere in the content and then the model 
will need to wrap the appropriate content in the appropriate tags. 
for example:

"<title>
A Test Title
</title>
<content>
Blah, blah, blah
</content>
<notes>
notes about something
</notes>
<notes>
more notes about something else
</notes>
"


"Sure, I can help with that
<title>A Test Title</title> is a great name for the article.
Let's begin writing the post
<content> Blah, blah, blah</content>
With this post there are some things to keep in mind:
<notes>
notes about something
</notes>
so that could be a good choice, but there are some other things 
to think about <notes> more notes about something else </notes>"

You'll be passed the parsed example and you are tasked with creating an expanded example. 
Have fun and be creative with your output, but you must use all the tags as given
`;

export const formatTypeTagPrompt = ({
  prompt,
  tags,
  exampleOutput,
}: {
  prompt: string;
  tags: string[];
  exampleOutput: string;
}): string => {
  return `${prompt}
  !IMPORTANT! You must return the response and wrap the relevant information in the appropriate tags
for downstream processing.

The required tags are: ${tags.join(', ')}

for example the output should look like this:
${exampleOutput}
`;
};

const { chat } = useAcaiChat()

/**
 * Parses a string of content for specified tags and returns an object
 * with each tag and its corresponding content.
 * @param {string[]} tags - The tags to search for in the content.
 * @param {string} content - The content to parse.
 * @returns {TagExampleJSON} An object with each tag and its corresponding
 * content.
 * @example parseResponse(['title', 'content'],
 * '<title>Example Title</title><content>Example Content</content>');
 * // { title: ['Example Title'], content: ['Example Content'] }
 */
export const parseTypeTagsResponse = (
  tags: string[],
  content: string,
): TagExampleJSON => {
  const parsed: TagExampleJSON = {};

  tags.forEach((tag) => {
    const regex = new RegExp(`<${tag}>((.|\\n)*?)<\\/${tag}>`, 'g');
    let match;
    parsed[tag] = [];

    while ((match = regex.exec(content)) !== null) {
      if (match && match[1]) {
        parsed[tag].push(match[1].trim());
      }
    }
  });

  return parsed;
};

export const getTypeTagResponse = async (
  data: TagExampleJSON,
): Promise<TypeTagResponse> => {
  const storageKey = 'generate-type-tag-prompts';
  const cachedData = readFromLocalStorage(storageKey);

  if (
    cachedData &&
    JSON.stringify(cachedData.originalData) === JSON.stringify(data)
  ) {
    return cachedData.typeTagResponse;
  }

  const examples = convertJsonToTagTypeString(data);
  const response = await chat.call([
    new SystemMessage(typeTagExampleSystemPrompt),
    new HumanMessage(examples),
  ]);

  const typeTagResponse = {
    tags: Object.keys(data),
    typeTagPrompt: response.text,
  };

  writeToLocalStorage(storageKey, { originalData: data, typeTagResponse });

  return typeTagResponse;
};
