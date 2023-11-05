import { Configuration, OpenAIApi } from 'openai';
import { getToken } from '../../../utils/config';

/**
 *
 * @returns a list of all available OpenAI chat models
 */
export const getOpenAIChatModels = async () => {
  const configuration = new Configuration({
    apiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    basePath:
      getToken('OPENAI_API_BASE') ||
      import.meta.env.VITE_OPENAI_API_BASE ||
      'https://api.openai.com/v1',
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.listModels();
  const models = response.data;
  // filter to only models containing gpt models
  const filteredModels = models.data.filter(
    (model) => model.id.includes('gpt') && !model.id.includes('instruct'),
  );
  // order by descending id
  filteredModels.sort((a, b) => {
    if (a.id < b.id) {
      return 1;
    }
    if (a.id > b.id) {
      return -1;
    }
    return 0;
  });
  return filteredModels.map((model) => model.id);
};
