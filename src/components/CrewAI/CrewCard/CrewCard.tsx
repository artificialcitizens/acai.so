import React, { useState } from 'react';
import { Crew } from '../use-crew-ai';
import CrewAIForm from '../CrewAIForm/CrewAIForm';
import CrewAIList from '../CrewAIList/CrewAIList';

interface CrewCardProps {
  crew: Crew;
  output: string;
  onSave: (crew: Crew) => void;
  test: (crew: string) => void;
  // deleteCrew: (crewId: string) => void;
}

const CrewCard: React.FC<CrewCardProps> = ({
  crew,
  output,
  onSave,
  test,
  // deleteCrew,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  return (
    <div>
      <button
        className="float-right"
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        {isFormVisible ? 'View' : 'Edit'}
      </button>
      <button
        className="float-right mr-2"
        onClick={() => {
          test(crew.id);
        }}
      >
        Test
      </button>
      <div>
        {output && (
          <pre>
            <p></p>
          </pre>
        )}
      </div>
      <h2>{crew.name} Crew</h2>
      <div>
        <h4>Test Output</h4>
        {output && <p>{output}</p>}
      </div>
      {isFormVisible ? (
        <>
          <h3 className="text-xl font-bold">JSON Config</h3>
          <CrewAIForm crew={crew} saveCrew={onSave} />
        </>
      ) : (
        <CrewAIList
          // addAgent={addAgent}
          // addTask={addTask}
          // deleteAgent={deleteAgent}
          // deleteTask={deleteTask}
          // updateAgent={updateAgent}
          // updateTask={updateTask}
          config={crew}
        />
      )}
      <br />
    </div>
  );
};

export default CrewCard;
