import React, { useState } from 'react';
import { Agent, Crew, Task } from '../use-crew-ai';
import CrewAIForm from '../CrewAIForm/CrewAIForm';
import CrewAIList from '../CrewAIList/CrewAIList';
import TextBox from '../../InlineEdit/TextBox';

interface CrewCardProps {
  crew: Crew;
  output: string;
  onSave: (crew: Crew) => void;
  test: (crew: string) => void;
  saveCrew: (crew: Crew) => void;
  deleteCrew: (crewId: string) => void;
}

const CrewCard: React.FC<CrewCardProps> = ({
  crew,
  output,
  onSave,
  test,
  saveCrew,
  deleteCrew,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [moreInfo, showMoreInfo] = useState(false);

  return (
    <div className="p-4 border border-solid border-lighter rounded-md mb-2">
      <div className="float-right">
        <button className="mr-2" onClick={() => showMoreInfo(!moreInfo)}>
          {moreInfo ? 'Collapse' : 'Expand'}
        </button>
        <button
          className="mr-2"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Close' : 'View JSON'}
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
      <TextBox
        value={crew.name}
        onCancel={() => {
          console.log('cancel');
        }}
        onSave={(value) => {
          const updatedCrew = { ...crew, name: value };
          saveCrew(updatedCrew);
        }}
      />
      {moreInfo && (
        <>
          {isFormVisible ? (
            <>
              <h3 className="text-xl font-bold">JSON Config</h3>
              <CrewAIForm crew={crew} saveCrew={onSave} />
            </>
          ) : (
            <CrewAIList crew={crew} />
          )}
          {output && (
            <div>
              <h4>Test Output</h4>
              <p>{output}</p>
            </div>
          )}
        </>
      )}
      <br />
      {/*
       <h5>Files</h5>
       <ul>
        {crew.files.map((file) => (
          <li key={file.id}>
            {file.name}
            <button
              onClick={() => {
                window.confirm(
                  `Are you sure you wish to delete this file? ID: ${file.id}`,
                );
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <li className="p-2">
        Upload
        <input
          type="file"
          onChange={() => toastifyInfo('Not implemented yet')}
        />
      </li> */}
    </div>
  );
};

export default CrewCard;
