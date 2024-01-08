import React, { useState } from 'react';
import { Crew } from '../use-crew-ai';
import CrewAIForm from '../CrewAIForm/CrewAIForm';
import CrewAIList from '../CrewAIList/CrewAIList';

interface CrewCardProps {
  crew: Crew;
  output: string;
  onSave: (crew: Crew) => void;
  test: (crew: string) => void;
  deleteCrew: (crewId: string) => void;
}

const CrewCard: React.FC<CrewCardProps> = ({
  crew,
  output,
  onSave,
  test,
  deleteCrew,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [moreInfo, showMoreInfo] = useState(false);

  return (
    <div>
      <div className="float-right">
        <button className="mr-2" onClick={() => showMoreInfo(!moreInfo)}>
          {moreInfo ? 'Collapse' : 'Expand'}
        </button>
        <button
          className="mr-2"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Cancel' : 'Edit'}
        </button>
        <button
          className="mr-2"
          onClick={() => {
            test(crew.id);
          }}
        >
          Test
        </button>
        <button
          className="mr-2"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this crew?')) {
              deleteCrew(crew.id);
            }
          }}
        >
          Delete
        </button>
      </div>
      <div>
        {output && (
          <pre>
            <p></p>
          </pre>
        )}
      </div>
      <h2>{crew.name} Crew</h2>
      {moreInfo && (
        <>
          {output && (
            <div>
              <h4>Test Output</h4>
              <p>{output}</p>
            </div>
          )}
          {isFormVisible ? (
            <>
              <h3 className="text-xl font-bold">JSON Config</h3>
              <CrewAIForm crew={crew} saveCrew={onSave} />
            </>
          ) : (
            <CrewAIList config={crew} />
          )}
        </>
      )}
      <br />
    </div>
  );
};

export default CrewCard;
