import React, { useState } from 'react';
import { marked } from 'marked';
import { useLocalStorageString } from '../../hooks/use-local-storage';

export interface MarkdownInputProps {
  id: string;
  placeholder?: string;
  readonly?: boolean;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ id, placeholder, readonly = false }) => {
  const [input, setInput] = useLocalStorageString(id, '');
  const [isReadOnly, setReadOnly] = useState(readonly);
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const toggleEditing = () => {
    setReadOnly(!isReadOnly);
  };

  return (
    <div className="pt-2 border-b-2 border-solid border-lighter w-full text-light">
      {!isReadOnly ? (
        <textarea
          className="h-56 p-3 bg-base rounded w-full"
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
        />
      ) : (
        <div
          className="h-56 p-3 bg-base rounded overflow-y-auto w-full mt-2 border-b-2 border-solid border-lighter"
          dangerouslySetInnerHTML={{ __html: marked(input) }}
        />
      )}
      {/* <button className="mt-2" onClick={toggleEditing}>
        {readOnly ? 'Preview' : 'Edit'}
      </button> */}
    </div>
  );
};

export default MarkdownInput;
