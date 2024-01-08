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
    saveCrew,
    test,
    output,
  } = useCrewAi();
  const [formVisible, setFormVisible] = useState(false);
  return (
    <div>
      <button
        className="w-full text-bold font-2xl border border-solid border-lighter rounded-md mb-6"
        onClick={() => setFormVisible(!formVisible)}
      >
        {formVisible ? 'Cancel' : 'Add Crew'}
      </button>
      {formVisible && (
        <CrewAIForm
          saveCrew={(crew) => {
            saveCrew(crew);
            setFormVisible(false);
          }}
        />
      )}
      {crews &&
        crews.map((crew) => (
          <CrewCard
            output={output}
            crew={crew}
            onSave={saveCrew}
            key={crew.id}
            test={test}
          />
        ))}
    </div>
  );
};

export default CrewAIContainer;
