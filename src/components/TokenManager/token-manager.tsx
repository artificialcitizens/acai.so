import React, {
  useEffect,
  FormEvent,
  useState,
  useMemo,
  ChangeEvent,
  useRef,
} from 'react';
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

  const handleExport = () => {
    let content = '';
    for (const key in values) {
      content += `${key}=${values[key]}\n`;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'acai-env';
    link.click();
    URL.revokeObjectURL(url);
    toastifySuccess('Tokens exported');
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
      toastifySuccess('Tokens imported and saved');
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
      {keys.map(({ id, name, type }) => (
        <span className="flex mb-4 items-center" key={id}>
          <label className="text-acai-white pr-2 w-[50%] text-base md:text-sm">
            {name}:
          </label>
          <input
            type={type}
            className="text-acai-white text-base md:text-sm bg-base px-[2px]"
            value={values[id] || ''}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
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
