import { useState, useEffect } from 'react';
import { getResponse, parseResponse, ParsedResponse } from '../../utils/ac-langchain/parsers/tag-parser';
/**
 * Custom hook to get a response from the OpenAI API.
 *
 * @param {ParsedResponse} data - The data to format and use as the prompt.
 * @returns {object} An object containing the response and the parseResponse function.
 */
export const useTypeTag = (data: ParsedResponse): object => {
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getResponse(data);
      setResponse(res);
    };

    fetchData();
  }, [data]);

  // Extract the tags from the data object
  const tags = Object.keys(data);

  return { response, parseResponse: (content: string) => parseResponse(tags, content) };
};
