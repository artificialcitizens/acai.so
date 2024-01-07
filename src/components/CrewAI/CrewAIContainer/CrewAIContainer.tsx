import CrewAICard from '../CrewAIList/CrewAIList';
import CrewAIForm from '../CrewAIForm/CrewAIForm';
import { useCrewAi } from '../use-crew-ai';
import { useState } from 'react';

const CrewAIContainer = () => {
  const {
    addAgent,
    addTask,
    deleteAgent,
    deleteTask,
    updateAgent,
    updateTask,
    config,
    updateConfig,
    test,
    output,
  } = useCrewAi();

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
          test();
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
      <div>{output && <p>Output:{output}</p>}</div>
      <h2>{config.name} Crew</h2>
      {isFormVisible ? (
        <>
          <h3 className="text-xl font-bold">JSON Config</h3>
          <CrewAIForm config={config} updateConfig={updateConfig} />
        </>
      ) : (
        <CrewAICard
          addAgent={addAgent}
          addTask={addTask}
          deleteAgent={deleteAgent}
          deleteTask={deleteTask}
          updateAgent={updateAgent}
          updateTask={updateTask}
          config={config}
        />
      )}
      <br />
    </div>
  );
};

export default CrewAIContainer;
