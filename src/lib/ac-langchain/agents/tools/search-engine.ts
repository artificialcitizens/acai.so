import { GoogleCustomSearch } from 'langchain/tools';
import { getToken } from '../../../../utils/config';

export const googleSearch = () => {
  const google = new GoogleCustomSearch({
    apiKey: getToken('GOOGLE_API_KEY') || import.meta.env.VITE_GOOGLE_API_KEY,
    googleCSEId:
      getToken('GOOGLE_CSE_ID') || import.meta.env.VITE_GOOGLE_CSE_ID,
  });

  google.description =
    'For when you need to find or search information for User, you can use this to search Google for the results. Input is query to search for and output is results.';

  return google;
};
