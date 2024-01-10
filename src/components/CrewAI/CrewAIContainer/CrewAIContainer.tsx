import CrewAIForm from '../CrewAIForm/CrewAIForm';
import { useCrewAi } from '../use-crew-ai';
import { useState } from 'react';
import CrewCard from '../CrewCard/CrewCard';

const CrewAIContainer = () => {
  const { newCrew, deleteCrew, crews, saveCrew, test, output } = useCrewAi();
  const [formVisible, setFormVisible] = useState(false);
  return (
    <div>
      <button
        className="w-full text-bold font-2xl border border-solid border-lighter rounded-md mb-6"
        onClick={() => {
          newCrew();
        }}
      >
        Add Crew
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
        crews
          .sort(
            (a, b) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime(),
          )
          .map((crew) => (
            <CrewCard
              output={output}
              crew={crew}
              onSave={saveCrew}
              key={crew.id}
              test={test}
              deleteCrew={deleteCrew}
              saveCrew={saveCrew}
            />
          ))}
    </div>
  );
};

export default CrewAIContainer;
