import React, { useEffect, FormEvent, useState, useMemo } from 'react';
import { toastifyInfo, toastifySuccess } from '../Toast';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

const TokenManager: React.FC = () => {
  const [openAIKey, setOpenAIKey] = useLocalStorageKeyValue(
    'OPENAI_KEY',
    import.meta.env.VITE_OPENAI_KEY || '',
  );
  const [openAIBase, setOpenAIBase] = useLocalStorageKeyValue(
    'OPENAI_API_BASE',
    import.meta.env.VITE_OPENAI_API_BASE || 'https://api.openai.com/v1',
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
        id: 'OPENAI_API_BASE',
        name: 'OpenAI API Base URL',
        value: openAIBase,
        setValue: setOpenAIBase,
        type: 'text',
      },
      {
        id: 'OPENAI_KEY',
        name: 'OpenAI API Key',
        value: openAIKey,
        setValue: setOpenAIKey,
        type: 'password',
      },
      {
        id: 'ELEVENLABS_API_KEY',
        name: 'Eleven Labs API Key',
        value: elevenlabsApiKey,
        setValue: setElevenlabsApiKey,
        type: 'password',
      },
      // {
      //   id: 'GOOGLE_API_KEY',
      //   name: 'Google API Key',
      //   value: googleApiKey,
      //   setValue: setGoogleApiKey,
      // },
      // {
      //   id: 'GOOGLE_CSE_ID',
      //   name: 'Google CSE Key',
      //   value: googleCSEId,
      //   setValue: setGoogleCSEId,
      // },
    ],
    [
      openAIBase,
      setOpenAIBase,
      openAIKey,
      setOpenAIKey,
      elevenlabsApiKey,
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
      {keys.map(({ id, name, type }) => (
        <span className="flex mb-2 items-center" key={id}>
          <label className="text-acai-white pr-2 w-[50%] text-sm md:text-xs">
            {name}:
          </label>
          <input
            type={type}
            className="text-acai-white text-sm md:text-xs bg-base px-[2px]"
            value={values[id] || ''}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
          />
        </span>
      ))}
      <input
        type="submit"
        value="Submit"
        className="bg-light text-acai-white text-sm md:text-xs px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      />
    </form>
  );
};

export default TokenManager;
