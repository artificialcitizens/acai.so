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
    run,
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
          run();
        }}
      >
        Test
      </button>
      {output && <p>{output}</p>}
      {isFormVisible ? (
        <>
          <h2 className="text-2xl font-bold">JSON Config</h2>
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
