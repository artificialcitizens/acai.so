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
    <div className="text-acai-white p-4 border border-solid border-lighter rounded-md mb-2 bg-darker">
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
      <div className="font-bold text-[.75rem] flex">
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
      </div>
      {moreInfo && (
        <>
          {isFormVisible ? (
            <>
              <h2 className="text-acai-white text-sm mb-4">JSON Config</h2>

              <CrewAIForm crew={crew} saveCrew={onSave} />
            </>
          ) : (
            <CrewAIList crew={crew} />
          )}
          {crew.example && (
            <div className="bg-dark rounded-md p-4 mb-2">
              <h2 className="text-acai-white text-sm mb-4">Example Output</h2>

              <p className="text-sm">{crew.example}</p>
            </div>
          )}
          <h2 className="text-acai-white text-sm mb-4">Logs</h2>

          <div className="max-w-full max-h-[25vh] whitespace-pre-line p-2 text-xs overflow-scroll bg-dark rounded-md">
            <ul>
              {crew.logs &&
                crew.logs.map((log) => (
                  <li
                    key={log.timestamp}
                    className="p-4 border border-solid border-light rounded-md mb-2 text-sm"
                  >
                    <h6 className="text-sm">Agent: {log.agent}</h6>
                    <p className="text-sm">Time: {log.timestamp}</p>
                    <p className="text-sm">Task: {log.task}</p>
                    <p className="text-sm">Context: {log.context}</p>
                    <p className="text-sm">Response: {log.tools}</p>
                    <p className="text-sm">Output: {log.output}</p>
                  </li>
                ))}
            </ul>
          </div>
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
