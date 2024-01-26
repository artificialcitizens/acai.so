import React, { FormEvent, useState } from 'react';
import { Crew } from '../use-crew-ai';
import { toastifyError } from '../../Toast';
import { exampleData } from '../example-data';

type CrewAIFormProps = {
  crew?: Crew;
  saveCrew: (crew: Crew) => void;
};

const CrewAIForm: React.FC<CrewAIFormProps> = ({ crew, saveCrew }) => {
  const [input, setInput] = useState(JSON.stringify(crew, null, 2) || ''); // Add this line

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input) return;
    try {
      const newConfig = JSON.parse(input);
      saveCrew(newConfig);
    } catch (error) {
      console.error('Invalid JSON');
      toastifyError('Invalid JSON');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        className="bg-light mr-2 mb-4 text-acai-white text-base md:text-sm px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      >
        Save
      </button>
      <button
        type="button"
        className="bg-light mr-2 mb-4 text-acai-white text-base md:text-sm px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        onClick={() => setInput(JSON.stringify(exampleData, null, 2))}
      >
        Insert Example
      </button>
      <pre className="flex w-full h-screen">
        <textarea
          id="config"
          value={input} // Change this line
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow text-acai-white text-base md:text-sm bg-base px-[2px] w-full h-full rounded-md"
        />
      </pre>
    </form>
  );
};

export default CrewAIForm;
