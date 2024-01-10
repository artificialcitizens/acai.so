import { AgentCard } from '../AgentCard';
import { TaskCard } from '../TaskCard';
import { Crew, newAgent, newTask, useCrewAi } from '../use-crew-ai';
import { v4 as uuidv4 } from 'uuid';

const CrewAIList = ({ crew }: { crew: Crew }) => {
  const { addAgentToCrew, addTaskToCrew, models } = useCrewAi();
  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      <div className="m-2 border-b-2 border-solid border-dark text-acai-white flex flex-col">
        <h3 className="text-2xl font-bold">Agents</h3>
        {crew.agents.map((agent) => (
          <AgentCard crewId={crew.id} agent={agent} key={agent.id} />
        ))}
      </div>
      <button
        className="w-full text-bold font-2xl  rounded-md mb-2"
        onClick={() => {
          addAgentToCrew(
            crew.id,
            newAgent({
              id: uuidv4(),
              llm: models[0],
            }),
          );
        }}
      >
        Add Agent
      </button>

      <h3 className="text-2xl font-bold m-2">Tasks</h3>
      <ul className="m-2 border-b-2 border-solid border-dark text-acai-white flex flex-col">
        {crew.tasks.map((task) => (
          <TaskCard crewId={crew.id} task={task} key={task.id} />
        ))}
      </ul>
      <button
        className="w-full text-bold font-2xl  rounded-md mb-2"
        onClick={() => {
          addTaskToCrew(
            crew.id,
            newTask({
              id: uuidv4(),
              agent: crew.agents[0].role,
            }),
          );
        }}
      >
        Add Task
      </button>
    </div>
  );
};

export default CrewAIList;
