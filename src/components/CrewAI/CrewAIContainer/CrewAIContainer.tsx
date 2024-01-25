import CrewAIForm from '../CrewAIForm/CrewAIForm';
import { useCrewAi } from '../use-crew-ai';
import { useState } from 'react';
import CrewCard from '../CrewCard/CrewCard';

const CrewAIContainer = () => {
  const { newCrew, deleteCrew, crews, saveCrew, test, output } = useCrewAi();
  const [formVisible, setFormVisible] = useState(false);

  if (!crews) return null;
  return (
    <div className="text-acai-white">
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
      <button
        type="button"
        className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 mb-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        onClick={() => {
          newCrew();
        }}
      >
        Add Crew
      </button>
    </div>
  );
};

export default CrewAIContainer;
