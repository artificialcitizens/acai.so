import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { getCookie } from '../../config';

type ParsedResponse = {
  [key: string]: string[];
};
/**
 * Parses a string of content for specified tags and returns an object
 * with each tag and its corresponding content.
 * @param {string[]} tags - The tags to search for in the content.
 * @param {string} content - The content to parse.
 * @returns {ParsedResponse} An object with each tag and its corresponding content.
 */
export const parseResponse = (tags: string[], content: string): ParsedResponse => {
  const parsed: ParsedResponse = {};

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

/**
 * Converts a JSON object into a formatted string with tags.
 *
 * @param {InputData} data - The JSON object to convert.
 * @returns {string} A formatted string with tags.
 */
export const formatData = (data: ParsedResponse): string => {
  let formatted = '';

  Object.keys(data).forEach((key) => {
    data[key].forEach((value) => {
      formatted += `<${key}>\n${value}\n</${key}>\n`;
    });
  });

  return formatted;
};

const typeTagExampleSystemPrompt = `###### Ignore all prior instructions
you are tasked with creating examples for a language model you expand 
on this example for a language model to use as an example. The idea is 
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

const chat = new ChatOpenAI({
  openAIApiKey: getCookie('OPENAI_KEY'),
});

export const getResponse = async (data: ParsedResponse) => {
  // Format the data into a string
  const prompt = formatData(data);

  const response = await chat.call([new SystemChatMessage(typeTagExampleSystemPrompt), new HumanMessage(prompt)]);
  return response;
};
