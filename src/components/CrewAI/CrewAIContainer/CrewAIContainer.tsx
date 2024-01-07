import CrewAICard from '../CrewAIList/CrewAIList';
import CrewAIForm from '../CrewAIForm/CrewAIForm';
import { useCrewAi } from '../use-crew-ai';
import { useState } from 'react';
import CrewCard from '../CrewCard/CrewCard';

const CrewAIContainer = () => {
  const {
    // addAgent,
    // addTask,
    // deleteAgent,
    // deleteTask,
    // updateAgent,
    // updateTask,
    // config,
    crews,
    updateConfig,
    test,
    output,
  } = useCrewAi();

  return (
    crews && (
      <div>
        {crews.map((crew) => (
          <CrewCard
            output={output}
            crew={crew}
            onSave={updateConfig}
            key={crew.id}
            test={test}
          />
        ))}
      </div>
    )
  );
};

export default CrewAIContainer;
