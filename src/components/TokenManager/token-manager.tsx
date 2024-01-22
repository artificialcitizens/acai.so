import React, {
  useEffect,
  FormEvent,
  useState,
  useMemo,
  ChangeEvent,
  useRef,
} from 'react';
import { toastifyInfo } from '../Toast';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

export enum Token {
  OPENAI_API_BASE = 'OPENAI_API_BASE',
  OPENAI_EMBEDDING_API_BASE_URL = 'OPENAI_EMBEDDING_API_BASE_URL',
  OPENAI_KEY = 'OPENAI_KEY',
  GOOGLE_API_KEY = 'GOOGLE_API_KEY',
  GOOGLE_CSE_ID = 'GOOGLE_CSE_ID',
  ELEVENLABS_API_KEY = 'ELEVENLABS_API_KEY',
  CUSTOM_SERVER_URL = 'CUSTOM_SERVER_URL',
  CUSTOM_SERVER_PASSWORD = 'CUSTOM_SERVER_PASSWORD',
}

const TokenManager: React.FC = () => {
  const [openAIKey, setOpenAIKey] = useLocalStorageKeyValue(
    Token.OPENAI_KEY,
    import.meta.env.VITE_OPENAI_KEY || '',
  );
  const [openAIBase, setOpenAIBase] = useLocalStorageKeyValue(
    Token.OPENAI_API_BASE,
    import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  );
  const [openAIEmbeddingBase, setOpenAIEmbeddingBase] = useLocalStorageKeyValue(
    Token.OPENAI_EMBEDDING_API_BASE_URL,
    import.meta.env.VITE_OPENAI_EMBEDDING_API_BASE ||
      'https://api.openai.com/v1',
  );
  const [googleApiKey, setGoogleApiKey] = useLocalStorageKeyValue(
    Token.GOOGLE_API_KEY,
    import.meta.env.VITE_GOOGLE_API_KEY || '',
  );
  const [googleCSEId, setGoogleCSEId] = useLocalStorageKeyValue(
    Token.GOOGLE_CSE_ID,
    import.meta.env.VITE_GOOGLE_CSE_ID || '',
  );
  const [elevenlabsApiKey, setElevenlabsApiKey] = useLocalStorageKeyValue(
    Token.ELEVENLABS_API_KEY,
    import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  );

  const [serverUrl, setServerUrl] = useLocalStorageKeyValue(
    Token.CUSTOM_SERVER_URL,
    '',
  );

  const [password, setPassword] = useLocalStorageKeyValue(
    Token.CUSTOM_SERVER_PASSWORD,
    '',
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const keys = useMemo(
    () => [
      {
        id: Token.OPENAI_API_BASE,
        name: 'OpenAI API Base URL',
        placeholder: 'https://api.openai.com/v1',
        value: openAIBase,
        setValue: setOpenAIBase,
        type: 'text',
      },
      {
        id: Token.OPENAI_EMBEDDING_API_BASE_URL,
        name: 'OpenAI Embedding API Base URL',
        placeholder: 'https://api.openai.com/v1',
        value: openAIEmbeddingBase,
        setValue: setOpenAIEmbeddingBase,
        type: 'text',
      },
      {
        id: Token.OPENAI_KEY,
        name: 'OpenAI API Key',
        value: openAIKey,
        setValue: setOpenAIKey,
        type: 'password',
      },
      {
        id: Token.ELEVENLABS_API_KEY,
        name: 'Eleven Labs API Key',
        value: elevenlabsApiKey,
        setValue: setElevenlabsApiKey,
        type: 'password',
      },
      {
        id: Token.CUSTOM_SERVER_URL,
        name: 'Custom Server URL',
        value: serverUrl,
        setValue: setServerUrl,
        type: 'text',
      },
      {
        id: Token.CUSTOM_SERVER_PASSWORD,
        name: 'Custom Server Password',
        value: password,
        setValue: setPassword,
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
      openAIEmbeddingBase,
      setOpenAIEmbeddingBase,
      openAIKey,
      setOpenAIKey,
      elevenlabsApiKey,
      setElevenlabsApiKey,
      serverUrl,
      setServerUrl,
      password,
      setPassword,
    ],
  );

  const handleExport = () => {
    let content = '';
    for (const key in values) {
      content += `${key}=${values[key]}\n`;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'acai.env';
    link.click();
    URL.revokeObjectURL(url);
    toastifyInfo('Tokens exported');
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newValues = content.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: string });

      setValues(newValues);
      keys.forEach(({ id, setValue }) => {
        if (newValues[id]) {
          setValue(newValues[id]);
        }
      });
      toastifyInfo('Tokens imported and saved');
      // @TODO: remove this hack
      window.location.reload();
    };
    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    keys.forEach(({ id, setValue }) => {
      setValue(values[id]);
    });
    toastifyInfo('Keys saved');
    // @TODO: remove this hack
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <span className="flex justify-start mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={handleImportClick}
          className="mr-2 bg-light text-acai-white text-sm md:text-xs px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        >
          Import Config
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="bg-light text-acai-white text-sm md:text-xs px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        >
          Export Config
        </button>
      </span>
      {keys.map(({ id, name, type, placeholder }) => (
        <span className="flex mb-4 items-center" key={id}>
          <label className="text-acai-white pr-2 w-[50%] text-base md:text-sm">
            {name}:
          </label>
          <input
            type={type}
            className="text-acai-white text-base md:text-sm bg-base px-[2px]"
            value={values[id] || ''}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
            placeholder={placeholder || ''}
          />
        </span>
      ))}
      <input
        type="submit"
        value="Save"
        className="bg-light text-acai-white text-base md:text-sm px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      />
    </form>
  );
};

export default TokenManager;
