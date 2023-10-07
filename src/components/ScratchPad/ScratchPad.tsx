import React from 'react';

export interface MarkdownInputProps {
  content: string;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
    <div className="pt-2 mb-2 max-h-[25vh] text-base md:text-sm overflow-scroll border-b-transparent bg-base text-acai-white shadow-none w-full rounded-lg">
      {!readonly ? (
        <textarea
          // set pre-wrap to preserve line breaks
          className={`min-h-[${height}] p-3 bg-base rounded w-full `}
          placeholder={placeholder}
          value={content}
          onChange={handleInputChange}
        />
      ) : (
        <div
          className={`min-h-[${height}] p-3 text-acai-white bg-base text-base md:text-sm rounded overflow-y-auto w-full mt-2 whitespace-pre`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
};

export default MarkdownInput;
