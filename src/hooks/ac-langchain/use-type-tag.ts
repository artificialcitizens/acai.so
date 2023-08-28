import { useState, useEffect, useCallback } from 'react';
import {
  TagExampleJSON,
  TypeTagResponse,
  parseTypeTagsResponse,
  getTypeTagResponse,
} from '../../lib/ac-langchain/parsers/type-tag-parser';

const useTypeTagResponse = (data: TagExampleJSON) => {
  const [typeTagResponse, setTypeTagResponse] =
    useState<TypeTagResponse | null>(null);
  const [parseResponse, setParseResponse] = useState<TagExampleJSON | null>(
    null,
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchTypeTagResponse = useCallback(async () => {
    // const response = await getTypeTagResponse(data);
    // setTypeTagResponse(response);
  }, [data]);

  useEffect(() => {
    fetchTypeTagResponse();
  }, [fetchTypeTagResponse]);

  useEffect(() => {
    if (typeTagResponse) {
      const parsedResponse = parseTypeTagsResponse(
        typeTagResponse.tags,
        typeTagResponse.typeTagPrompt,
      );
      setParseResponse(parsedResponse);
    }
  }, [typeTagResponse]);

  return { typeTagResponse, parseResponse, error };
};

export default useTypeTagResponse;
