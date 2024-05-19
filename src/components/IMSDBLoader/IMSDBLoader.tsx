import React, { useState } from 'react';
import { IMSDBLoader } from 'langchain/document_loaders/web/imsdb';
import { toastifyInfo } from '../Toast';

const ScriptLoader = () => {
  const [inputURL, setInputURL] = useState('');
  const [formattedJSON, setFormattedJSON] = useState('');

  const handleChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputURL(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    toastifyInfo(`Submitting URL: ${inputURL}`);
    const loader = new IMSDBLoader(inputURL);
    const docs = await loader.load();
    const pageContent = docs[0].pageContent;
    setFormattedJSON(JSON.stringify(pageContent, null, 2));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="url">Enter URL:</label>
        <input
          type="text"
          id="url"
          value={inputURL}
          onChange={handleChange}
          required
        />
        <button type="submit">Load URL</button>
      </form>
      {formattedJSON && (
        <div>
          <h3>Formatted JSON Output:</h3>
          <pre>
            <code>{formattedJSON}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default ScriptLoader;
