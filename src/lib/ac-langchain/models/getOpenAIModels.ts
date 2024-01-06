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
    (model) =>
      model.id.includes('') &&
      !model.id.includes('instruct') &&
      !model.id.includes('davinci') &&
      !model.id.includes('ada') &&
      !model.id.includes('babbage') &&
      !model.id.includes('curie') &&
      !model.id.includes('cushman') &&
      !model.id.includes('tts') &&
      !model.id.includes('dall-e') &&
      !model.id.includes('whisper'),
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

/**
 *
 * @returns a list of all available custom endpoint chat models
 */
export const getLocalLLMs = async () => {
  const configuration = new Configuration({
    apiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    basePath:
      getToken('CUSTOM_OPENAI_API_BASE_URL') ||
      import.meta.env.VITE_CUSTOM_OPENAI_BASE_URL ||
      'http://localhost:8080/v1',
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.listModels();
  const models = response.data;
  // filter to only models containing gpt models
  const filteredModels = models.data.filter((model) => model.id.includes(''));
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
