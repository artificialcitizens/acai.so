import React, { FormEvent, useState } from 'react';
import { Crew } from '../use-crew-ai';

type CrewAIFormProps = {
  config: Crew;
  updateConfig: any;
};

const CrewAIForm: React.FC<CrewAIFormProps> = ({ config, updateConfig }) => {
  const [input, setInput] = useState(JSON.stringify(config, null, 2)); // Add this line

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const newConfig = JSON.parse(input);
      updateConfig(newConfig);
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <pre className="flex w-full h-screen">
        <textarea
          id="config"
          value={input} // Change this line
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow text-acai-white text-base md:text-sm bg-base px-[2px] w-full h-full rounded-md"
        />
      </pre>
      <button
        type="submit"
        className="bg-light text-acai-white text-base md:text-sm px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      >
        Save
      </button>
    </form>
  );
};

export default CrewAIForm;
