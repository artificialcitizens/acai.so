import React, { useEffect, FormEvent, useState, useMemo } from 'react';
import { toastifyInfo, toastifySuccess } from '../Toast';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

const TokenManager: React.FC = () => {
  const [openAIKey, setOpenAIKey] = useLocalStorageKeyValue(
    'OPENAI_KEY',
    import.meta.env.VITE_OPENAI_KEY || '',
  );
  const [googleApiKey, setGoogleApiKey] = useLocalStorageKeyValue(
    'GOOGLE_API_KEY',
    import.meta.env.VITE_GOOGLE_API_KEY || '',
  );
  const [googleCSEId, setGoogleCSEId] = useLocalStorageKeyValue(
    'GOOGLE_CSE_ID',
    import.meta.env.VITE_GOOGLE_CSE_ID || '',
  );
  const [elevenlabsApiKey, setElevenlabsApiKey] = useLocalStorageKeyValue(
    'ELEVENLABS_API_KEY',
    import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  );

  const keys = useMemo(
    () => [
      {
        id: 'OPENAI_KEY',
        name: 'OpenAI API Key',
        value: openAIKey,
        setValue: setOpenAIKey,
      },
      {
        id: 'GOOGLE_API_KEY',
        name: 'Google API Key',
        value: googleApiKey,
        setValue: setGoogleApiKey,
      },
      {
        id: 'GOOGLE_CSE_ID',
        name: 'Google CSE Key',
        value: googleCSEId,
        setValue: setGoogleCSEId,
      },
      {
        id: 'ELEVENLABS_API_KEY',
        name: 'Elevenlabs Api Key',
        value: elevenlabsApiKey,
        setValue: setElevenlabsApiKey,
      },
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
    // keys causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAIKey, googleApiKey, googleCSEId, elevenlabsApiKey]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    keys.forEach(({ id, setValue }) => {
      setValue(values[id]);
    });
    toastifyInfo('Keys saved');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {keys.map(({ id, name }) => (
        <span className="flex mb-2 items-center" key={id}>
          <label className="text-acai-white pr-2 w-[50%]">{name}:</label>
          <input
            className="text-acai-white bg-base px-[2px]"
            type="password"
            value={values[id] || ''}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
          />
        </span>
      ))}
      <input
        type="submit"
        value="Submit"
        className="bg-neutral-900 text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-light focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      />
    </form>
  );
};

export default TokenManager;
