import { WebBrowser } from 'langchain/tools/webbrowser';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getToken } from '../../../../utils/config';

const webBrowseModel = new ChatOpenAI({
  openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
  temperature: 0,
});

const webBrowseEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
});

const proxyUrl =
  getToken('PROXY_SERVER_URL') || import.meta.env.VITE_PROXY_SERVER_URL;

/**
 * Web Browser Tool
 * Can be added as a tool to an agent
 * https://js.langchain.com/docs/modules/agents/tools/integrations/webbrowser#usage-in-an-agent
 */
export const browser = new WebBrowser({
  model: webBrowseModel,
  embeddings: webBrowseEmbeddings,
  axiosConfig: {
    baseURL: proxyUrl,
  },
});

/**
 * Browse a url with query to generate a response
 * @param query - a url and a query formatted as a stringified array
    ex: `"https://www.themarginalian.org/2015/04/09/find-your-bliss-joseph-campbell-power-of-myth","who is joseph campbell"`,
  @returns a response from the model
  ex:
  Joseph Campbell was a mythologist and writer who discussed spirituality, psychological archetypes, cultural myths, and the mythology of self. He sat down with Bill Moyers for a lengthy conversation at George Lucas’s Skywalker Ranch in California, which continued the following year at the American Museum of Natural History in New York. The resulting 24 hours of raw footage were edited down to six one-hour episodes and broadcast on PBS in 1988, shortly after Campbell’s death, in what became one of the most popular in the history of public television.

  Relevant Links:
  - [The Holstee Manifesto](http://holstee.com/manifesto-bp)
  - [The Silent Music of the Mind: Remembering Oliver Sacks](https://www.themarginalian.org/2015/08/31/remembering-oliver-sacks)
  - [Joseph Campbell series](http://billmoyers.com/spotlight/download-joseph-campbell-and-the-power-of-myth-audio/)
  - [Bill Moyers](https://www.themarginalian.org/tag/bill-moyers/)
  - [books](https://www.themarginalian.org/tag/books/)
 */
export async function runWebBrowser(query: string) {
  const result = await browser.call(query);
  return result;
}
