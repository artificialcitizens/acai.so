import { Configuration, OpenAIApi } from 'openai';
import { getToken } from '../../config';

const configuration = new Configuration({
  apiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export const getOpenAIChatModels = async () => {
  const response = await openai.listModels();
  const models = response.data;
  // filter to only models containing gpt models
  const filteredModels = models.data.filter((model) =>
    model.id.includes('gpt'),
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