import React, { useEffect, FormEvent, useState } from 'react';
import useCookieStorage from '../../hooks/use-cookie-storage';

const TokenManager: React.FC = () => {
  const [openAIKey, setOpenAIKey] = useCookieStorage('OPENAI_KEY');
  const [googleApiKey, setGoogleApiKey] = useCookieStorage('GOOGLE_API_KEY');
  const [googleCSEId, setGoogleCSEId] = useCookieStorage('GOOGLE_CSE_ID');
  const [openAIFormKey, setOpenAIFormKey] = useState<string>('');
  const [googleApiFormKey, setGoogleApiFormKey] = useState<string>('');
  const [googleCseFormKey, setGoogleCseFormKey] = useState<string>('');

  useEffect(() => {
    if (openAIKey) {
      setOpenAIFormKey(openAIKey);
    }
    if (googleApiKey) {
      setGoogleApiFormKey(googleApiKey);
    }
    if (googleCSEId) {
      setGoogleCseFormKey(googleCSEId);
    }
  }, [googleApiKey, googleCSEId, openAIKey]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setOpenAIKey(openAIFormKey, 30);
    setGoogleApiKey(googleApiFormKey, 30);
    setGoogleCSEId(googleCseFormKey, 30);
  };

  return (
    <form onSubmit={handleSubmit}>
      <span className="flex">
        <label className="text-light pr-2">
          OpenAI API Key:
          <input type="password" value={openAIFormKey} onChange={(e) => setOpenAIFormKey(e.target.value)} />
        </label>
      </span>
      <span className="flex">
        <label className="text-light pr-2">
          Google API Key:
          <input type="password" value={googleApiFormKey} onChange={(e) => setGoogleApiFormKey(e.target.value)} />
        </label>
      </span>
      <span className="flex">
        <label className="text-light pr-2">
          Google CSE Key:
          <input type="password" value={googleCseFormKey} onChange={(e) => setGoogleCseFormKey(e.target.value)} />
        </label>
      </span>
      <input className="text-light" type="submit" value="Submit" />
    </form>
  );
};

export default TokenManager;
