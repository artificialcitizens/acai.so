import CrewAICard from '../CrewAIList/CrewAIList';
import CrewAIForm from '../CrewAIForm/CrewAIForm';
import { useCrewAi } from '../use-crew-ai';

const CrewAIContainer = () => {
  const { config, updateConfig, getAgents, getTasks } = useCrewAi();
  return (
    <div>
      <CrewAICard getAgents={getAgents} getTasks={getTasks} />
      <CrewAIForm config={config} updateConfig={updateConfig} />
    </div>
  );
};

export default CrewAIContainer;
