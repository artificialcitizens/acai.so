import { Search } from '@chatscope/chat-ui-kit-react';
import React, { useState } from 'react';
import './Search.css';

interface SBSearchProps {
  onSubmit: (value: string) => void;
}

const SBSearch: React.FC<SBSearchProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  return (
    <Search
      className="w-full mb-2 bg-base"
      placeholder=""
      value={value}
      onChange={(v) => setValue(v)}
      onClearClick={() => setValue('')}
      onKeyDown={(e) => {
        if (value.length > 0 && e.key === 'Enter') {
          onSubmit(value);
          setValue('');
        }
      }}
    />
  );
};

export default SBSearch;
