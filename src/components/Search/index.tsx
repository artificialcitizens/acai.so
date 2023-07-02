import { Search } from '@chatscope/chat-ui-kit-react';
import React, { useState } from 'react';
import './Search.css';

const SBSearch = () => {
  const [value, setValue] = useState('');
  return (
    <Search
      className="m-1 w-full bg-base"
      placeholder=""
      value={value}
      onChange={(v) => setValue(v)}
      onClearClick={() => setValue('')}
    />
  );
};

export default SBSearch;