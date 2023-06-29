import { Search } from '@chatscope/chat-ui-kit-react';
import React, { useState } from 'react';

const SBSearch = () => {
  const [value, setValue] = useState("I'm controlled component");
  return (
    <Search
      className="m-2 mx-4"
      placeholder="Search..."
      value={value}
      onChange={(v) => setValue(v)}
      onClearClick={() => setValue('')}
    />
  );
};

export default SBSearch;
