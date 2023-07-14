import React, { useEffect, FormEvent, useState } from 'react';
import useCookieStorage from '../../hooks/use-cookie-storage';

const TokenManager: React.FC = () => {
  const [openAIKey, setOpenAIKey] = useCookieStorage('OPENAI_KEY');
  const [formKey, setFormKey] = useState<string>('');

  useEffect(() => {
    if (openAIKey) {
      setFormKey(openAIKey);
    }
  }, [openAIKey]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setOpenAIKey(formKey, 30);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-light">
        OpenAI API Key:
        <input type="password" value={formKey} onChange={(e) => setFormKey(e.target.value)} />
      </label>
      <input className="text-light" type="submit" value="Submit" />
    </form>
  );
};

export default TokenManager;
