import React, { useEffect, FormEvent, useState, useMemo } from 'react';
import useCookieStorage from '../../hooks/use-cookie-storage';

const TokenManager: React.FC = () => {
  const [openAIKey, setOpenAIKey] = useCookieStorage('OPENAI_KEY');
  const [googleApiKey, setGoogleApiKey] = useCookieStorage('GOOGLE_API_KEY');
  const [googleCSEId, setGoogleCSEId] = useCookieStorage('GOOGLE_CSE_ID');
  const [elevenlabsApiKey, setElevenlabsApiKey] = useCookieStorage('ELEVENLABS_API_KEY');

  const keys = useMemo(
    () => [
      { id: 'OPENAI_KEY', name: 'OpenAI API Key', value: openAIKey, setValue: setOpenAIKey },
      { id: 'GOOGLE_API_KEY', name: 'Google API Key', value: googleApiKey, setValue: setGoogleApiKey },
      { id: 'GOOGLE_CSE_ID', name: 'Google CSE Key', value: googleCSEId, setValue: setGoogleCSEId },
      { id: 'ELEVENLABS_API_KEY', name: 'Elevenlabs Api Key', value: elevenlabsApiKey, setValue: setElevenlabsApiKey },
    ],
    [
      openAIKey,
      googleApiKey,
      googleCSEId,
      elevenlabsApiKey,
      setOpenAIKey,
      setGoogleApiKey,
      setGoogleCSEId,
      setElevenlabsApiKey,
    ],
  );

  const [values, setValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const newValues: { [key: string]: string } = {};
    keys.forEach(({ id, value }) => {
      if (value) {
        newValues[id] = value;
      }
    });
    setValues(newValues);
  }, [openAIKey, googleApiKey, googleCSEId, elevenlabsApiKey, keys]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    keys.forEach(({ id, setValue }) => {
      setValue(values[id], 30);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {keys.map(({ id, name }) => (
        <span className="flex" key={id}>
          <label className="text-light pr-2">
            {name}:
            <input
              type="password"
              value={values[id] || ''}
              onChange={(e) => setValues({ ...values, [id]: e.target.value })}
            />
          </label>
        </span>
      ))}
      <input className="text-light" type="submit" value="Submit" />
    </form>
  );
};

export default TokenManager;
