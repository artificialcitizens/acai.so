import CrewAIForm from '../CrewAIForm/CrewAIForm';
import { Crew, useCrewAi } from '../use-crew-ai';
import { useState } from 'react';
import CrewCard from '../CrewCard/CrewCard';
import Dropdown from '../../DropDown';

const CrewAIContainer = ({
  displayDropdown,
}: {
  displayDropdown?: boolean;
}) => {
  const { newCrew, deleteCrew, crews, saveCrew, test, output } = useCrewAi();
  const [formVisible, setFormVisible] = useState(false);
  const [currentCrew, setCurrentCrew] = useState<string | null>(
    localStorage.getItem('currentCrew') || crews?.[0]?.id || null,
  );

  const handleModeChange = (crew: string) => {
    if (!crews) return;
    console.log(crew);
    localStorage.setItem('currentCrew', crew);
    setCurrentCrew(crew);
  };

  if (!crews) return null;
  return (
    <div className="text-acai-white">
      {displayDropdown && (
        <Dropdown
          label="Use Crew:"
          options={crews.map((crew) => ({ value: crew.id, label: crew.name }))}
          value={currentCrew || crews[0].id}
          onChange={handleModeChange}
        />
      )}
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
