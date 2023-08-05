import React from 'react';
import { marked } from 'marked';

export interface MarkdownInputProps {
  content: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readonly?: boolean;
  height?: string;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({
  content,
  handleInputChange,
  placeholder,
  readonly = false,
  height = '24px',
}) => {
  return (
    <div className="pt-2 border-b-2 border-solid border-lighter w-full text-light">
      {!readonly ? (
        <textarea
          className={`min-h-[${height}] p-3 bg-base rounded w-full`}
          placeholder={placeholder}
          value={content}
          onChange={handleInputChange}
        />
      ) : (
        <div
          className={`min-h-[${height}] p-3 bg-base rounded overflow-y-auto w-full mt-2 border-b-2 border-solid border-lighter`}
          dangerouslySetInnerHTML={{ __html: marked(content || '') }}
        />
      )}
    </div>
  );
};

export default MarkdownInput;
